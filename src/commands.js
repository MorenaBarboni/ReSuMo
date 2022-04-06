const copy = require("recursive-copy");
const fs = require("fs");
const glob = require("glob");
const mkdirp = require("mkdirp");
const parser = require("@solidity-parser/parser");
const fsExtra = require("fs-extra");
const { spawnSync, spawn } = require("child_process");
const config = require("./config");
const operators = require("./operators");
const Reporter = require("./reporter");
const Instrumenter = require("./instrumenter");
const path = require("path");
const { parse } = require("path");
const chalk = require("chalk");
const resume = require("./resume");
const csvWriter = require("./utils/csvWriter");
const rimraf=require('rimraf')
const os = require("os");
const exreporter=require("./exReporter")
const readline = require('readline');
//Config
var testingFramework;
var packageManager;
const absoluteSumoDir = config.absoluteSumoDir;
const sumoDir = config.sumoDir;
const resumeDir = ".resume";
const targetDir = config.targetDir;
const baselineDir = config.baselineDir;
const contractsDir = config.contractsDir;
const compiledDir = config.compiledDir;
const testDir = config.testDir;
const liveDir = config.liveDir;
const killedDir = config.killedDir;
const mutantsDir = config.mutantsDir;
const contractsGlob = config.contractsGlob;
const testConfigGlob = config.testConfigGlob;
const packageManagerGlob = config.packageManagerGlob;
const personalTimeOut=config.testingTimeOutInSec
//SuMo modules
const reporter = new Reporter();
const exReporter = new  exreporter();
const instrumenter = new Instrumenter();
const operator = new operators.CompositeOperator([
  new operators.ACMOperator(),
  new operators.AOROperator(),
  new operators.AVROperator(),
  new operators.BCRDOperator(),
  new operators.BLROperator(),
  new operators.BOROperator(),
  new operators.CBDOperator(),
  new operators.CCDOperator(),
  new operators.CSCOperator(),
  new operators.DLROperator(),
  new operators.DODOperator(),
  new operators.ECSOperator(),
  new operators.EEDOperator(),
  new operators.EHCOperator(),
  new operators.EROperator(),
  new operators.ETROperator(),
  new operators.FVROperator(),
  new operators.GVROperator(),
  new operators.HLROperator(),
  new operators.ILROperator(),
  new operators.ICMOperator(),
  new operators.LSCOperator(),
  new operators.PKDOperator(),
  new operators.MCROperator(),
  new operators.MOCOperator(),
  new operators.MODOperator(),
  new operators.MOIOperator(),
  new operators.MOROperator(),
  new operators.OLFDOperator(),
  new operators.OMDOperator(),
  new operators.ORFDOperator(),
  new operators.RSDOperator(),
  new operators.RVSOperator(),
  new operators.SCECOperator(),
  new operators.SFIOperator(),
  new operators.SFDOperator(),
  new operators.SFROperator(),
  new operators.SKDOperator(),
  new operators.SKIOperator(),
  new operators.SLROperator(),
  new operators.TOROperator(),
  new operators.UORDOperator(),
  new operators.VUROperator(),
  new operators.VVROperator()
]);


//Prepare necessary dirs and files, checks SUT configuration
function prepare(callback) {

  if (absoluteSumoDir === "" || targetDir === "" || contractsDir === "" || testDir === "") {
    console.error("SuMo configuration is incomplete or missing.");
    process.exit(1);
  }

  //Checks the package manager used by the SUT
  let packageManagerFile;
  for (const lockFile of packageManagerGlob) {
    if (fs.existsSync(targetDir + lockFile)) {
      packageManagerFile = lockFile;
      if (lockFile.includes("yarn")) {
        packageManager = "yarn";
      } else {
        packageManager = "npm";
      }
      break;
    }
  }

  if (!packageManagerFile) {
    console.error("Target project does not contain a suitable lock file.");
    process.exit(1);
  }

  //Checks the testing framework used by the SUT
  let targetConfigFile;
  for (const configFile of testConfigGlob) {
    if (fs.existsSync(targetDir + configFile)) {
      targetConfigFile = configFile;
      if (configFile.includes("truffle")) {
        testingFramework = "truffle";
      } else {
        testingFramework = "hardhat";
      }
      instrumenter.setConfig(targetConfigFile);
      break;
    }
  }

  if (!targetConfigFile) {
    console.error("Target project does not contain a suitable test configuration file.");
    process.exit(1);
  }

  mkdirp(liveDir);
  mkdirp(killedDir);
  mkdirp(mutantsDir);

  mkdirp(baselineDir, () =>
      fs.copyFile(targetDir + targetConfigFile, baselineDir + targetConfigFile, (err) => {
        if (err) throw err;
      }),
    copy(contractsDir, baselineDir, { dot: true }, callback)
  );
}

//Shows a summary of the available mutants without starting the testing process.
function preflight() {
  prepare(() =>
    glob(contractsDir + contractsGlob, (err, files) => {
      if (err) throw err;
      const mutations = generateAllMutations(files)
      reporter.preflightSummary(mutations)
      reporter.preflightToExcel(mutations)
    })
  );
}

//Shows a summary of the available mutants without starting the testing process.
//Saves the mutants to file.
function preflightAndSave() {
  prepare(() =>
    glob(contractsDir + contractsGlob, (err, files) => {
      if (err) throw err;
      const mutations = generateAllMutations(files);
      for (const mutation of mutations) {
        mutation.save();
      }
      reporter.preflightSummary(mutations);
      console.log("Mutants saved to file");
    })
  );
}

//Generates mutations for each target contract
function generateAllMutations(files) {
  reporter.setupReport();
  let mutations = [];
  var startTime = Date.now();

  for (const file of files) {
    let ignoreFile = false;
    for (const path of config.ignore) {
      if (file.startsWith(path))
        ignoreFile = true;
    }
    if (!ignoreFile) {
      const source = fs.readFileSync(file, "utf8");
      const ast = parser.parse(source, { range: true });
      const visit = parser.visit.bind(parser, ast);
      mutations = mutations.concat(operator.getMutations(file, source, visit));
    }
  }
  var generationTime = (Date.now() - startTime) / 1000;
  reporter.saveGenerationTime(mutations.length, generationTime);
  return mutations;
}

//Check if the original tests pass
function preTest() {
  console.log("Pre-Test ...");

  const status = spawnTest();

  if (status === 0) {
    console.log("PreTest OK.");
  } else {
    console.error("Error: Original tests should pass.");
    process.exit(1);
  }
}


function restoreTestDir() {
  const baselineTest = "./.resume/baseline/tests";
  if (fs.existsSync(baselineTest)) {
    fsExtra.copySync(baselineTest, config.testDir);
    console.log("Test files restored");
  } else
    console.log("No baseline exist ");


}
var compiledContracts  = [];

function exploreDirectories(Directory) {
  fs.readdirSync(Directory).forEach(File => {
    const Absolute = path.join(Directory, File);
    if (fs.statSync(Absolute).isDirectory())
      return exploreDirectories(Absolute);
    else
      return compiledContracts.push(Absolute);
  });
}

//Start mutation testing process
function test() {
  prepare(() =>

    glob(contractsDir + contractsGlob, (err, files) => {
      var changedContracts;
      var changedTest;
      var originalTest;
      if (err) {
        console.error(err);
        process.exit(1);
      }
      if (config.regressionTestingActived) {
        resume.regressionTesting();
        changedContracts = resume.getChangedContracts();
        changedTest = resume.getChangedTest();
        originalTest = resume.getOriginalTest();
        for (const singleTest of originalTest) {
         if (!changedTest.includes(singleTest.path)&&!(path.dirname(singleTest.path)===testDir+'/utils'&&!(path.dirname(singleTest.path)===testDir+'/json'))) {
            fs.unlinkSync(singleTest.path);
          }
          
        }
      } else {
        changedContracts = files;
      }
      spawnCompile();
      var originalBytecodeMap = new Map();
      var check = false;
      var contractsToMutate=[]
      for (const file of changedContracts) {
        //if (file !== config.ignore){
        
          for (const contract of config.ignore) {
            if (!contract.includes(parse(file).name)) {
              check = true;
            } else {
              check = false;
              break;
            }
          }
      //  }
        if (check) {
          exploreDirectories(config.compiledDir)
          compiledContracts.map(singleContract=>{
            if(parse(singleContract).name===parse(file).name){
            originalBytecodeMap.set(parse(file).name, saveBytecodeSync(singleContract))
            if(!contractsToMutate.includes(file)){
               contractsToMutate.push(file)
            }
            }})
        }
        check=false
      }
        console.log("Contracts to mutate and Test: " + originalBytecodeMap.size);
        instrumenter.instrumentConfig();
        reporter.setupMutationsReport();
        //Generate mutations
        const mutations = generateAllMutations(contractsToMutate);
        var startTime = Date.now();

        //Compile and test each mutant
        for (const file of originalBytecodeMap.keys()) {
          runTest(mutations, originalBytecodeMap, file);
        }
        //Kill ganache
        var testTime = ((Date.now() - startTime) / 60000).toFixed(2);

        instrumenter.restoreConfig();
        reporter.saveMochawesomeReportInfo();
        reporter.testSummary();
        reporter.printTestReport(testTime);
        reporter.restore();
        exReporter.saveData();
        exReporter.restore();
        if (config.regressionTestingActived) {
          restoreTestDir();
          csvWriter.csv();
        }
      })
    )}


function killGanache() {
  if (config.ganache) {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", ganacheChild.pid, "/f", "/t"]);
    } else if (process.platform === "linux") {
      ganacheChild.kill("SIGHUP");
    } else if (process.platform === "darwin") {
      ganacheChild.kill("SIGHUP");
    }
  }
}

function spawnCompile() {
  var compileChild;

  //Run a custom compile script
  if (config.customTestScript) {

    if (process.platform === "win32") {
      compileChild = spawnSync(packageManager + ".cmd", ["run-script", "compile"], {
        stdio: "inherit",
        cwd: targetDir
      });
    } else if (process.platform === "linux") {
      compileChild = spawnSync(packageManager, ["run-script", "compile"], { stdio: "inherit", cwd: targetDir });
    } else if (process.platform === "darwin") {
      compileChild = spawnSync(packageManager, ["run-script", "compile"], { stdio: "inherit", cwd: targetDir });
    } else if (process.platform === "darwin") {
      compileChild = spawnSync(packageManager, ["run-script", "compile"], { stdio: "inherit", cwd: targetDir });
    }
  }   //Spawn a default compile script
  else {
    if (process.platform === "win32") {
      compileChild = spawnSync(testingFramework + ".cmd", ["compile"], { stdio: "inherit", cwd: targetDir });
    } else if (process.platform === "linux") {
      compileChild = spawnSync(testingFramework, ["compile"], { stdio: "inherit", cwd: targetDir });
    } else if (process.platform === "darwin") {
      compileChild = spawnSync(testingFramework, ["compile"], { stdio: "inherit", cwd: targetDir });
    } else if (process.platform === "darwin") {
      compileChild = spawnSync(testingFramework, ["compile"], { stdio: "inherit", cwd: targetDir });
    }
  }
  return compileChild.status === 0;
}

function spawnTest() {

  var testChild;
  //Run a custom test script
  if (config.customTestScript) {
    if (process.platform === "win32") {
      testChild = spawnSync(packageManager + ".cmd", ["run-script", "test"], {
        stdio: "inherit",
        cwd: targetDir,
        timeout: 300000
      });

    } else if (process.platform === "linux") {
      testChild = spawnSync(packageManager, ["run-script", "test"], {
        stdio: "inherit",
        cwd: targetDir,
        timeout: 300000
      });
    } else if (process.platform === "darwin") {
      testChild = spawnSync(packageManager, ["run-script", "test"], {
        stdio: "inherit",
        cwd: targetDir,
        timeout: 300000
      });
    } else if (process.platform === "darwin") {
      testChild = spawnSync(packageManager, ["run-script", "test"], {
        stdio: "inherit",
        cwd: targetDir,
        timeout: 300000
      });
    }
  }
  //Spawn a default test process
  else {
    if (process.platform === "win32") {
      testChild = spawnSync(testingFramework + ".cmd", ["test"], { stdio: "inherit", cwd: targetDir, timeout: (personalTimeOut*1000) });
    } else if (process.platform === "linux") {
      testChild = spawnSync(testingFramework, ["test"], { stdio: "inherit", cwd: targetDir, timeout: (personalTimeOut*1000) });
    } else if (process.platform === "darwin") {
      testChild = spawnSync(testingFramework, ["test"], { stdio: "inherit", cwd: targetDir, timeout: (personalTimeOut*1000) });
    }
  }

  let status;
  if (testChild.error && testChild.error.code === "ETIMEDOUT") {
    status = 999;
  } else {
    status = testChild.status;
  }
  //0 = live, !=0 killed, 999 = timedout
  return status;
}

//spawn new ganache process
function spawnGanache() {
  var child;
  if (config.ganache) {
    if (process.platform === "win32") {
      child = spawn("ganache-cli.cmd", { stdio: "inherit", cwd: targetDir, detached: true });
    } else if (process.platform === "linux") {
      child = spawn("ganache-cli", { stdio: "inherit", cwd: targetDir, detached: true });
    } else if (process.platform === "darwin") {
      child = spawn("ganache-cli", { stdio: "inherit", cwd: targetDir, detached: true });
    }
    child.unref;
    const waitForGanache = () => {
      if (!isRunning(child)) {
        console.log("Waiting for Ganache ...");
        setTimeout(() => {
          waitForGanache();
        }, 250);
      } else {
        resolve();
      }
    };
  }
  return child;
}


function mutationsByHash(mutations) {
  return mutations.reduce((obj, mutation) => {
    obj[mutation.hash()] = mutation;
    return obj;
  }, {});
}

function diff(argv) {
  prepare(() =>
    glob(contractsDir + contractsGlob, (err, files) => {
      const mutations = generateAllMutations(files);
      const index = mutationsByHash(mutations);
      if (!index[argv.hash]) {
        console.error("Mutation " + argv.hash + " not found.");
        process.exit(1);
      }
      console.log(index[argv.hash].diff());
    })
  );
}

//Get list of enabled operators
function list() {
  console.log(operator.getEnabledOperators());
}

//Enables a mutation operator
function enableOperator(ID) {
  //Enable all operators
  if (!ID) {
    var success = operator.enableAll();
    if (success)
      console.log("All mutation operators enabled.");
    else
      console.log("Error");
  } else {
    //Enable operator ID
    var success = operator.enable(ID);
    if (success)
      console.log(ID + " enabled.");
    else
      console.log(ID + " does not exist.");
  }
}

//Disables a mutation operator
function disableOperator(ID) {
  //Disable all operators
  if (!ID) {
    var success = operator.disableAll();
    if (success)
      console.log("All mutation operators disabled.");
    else
      console.log("Error");
  } else {
    //Disable operator ID
    var success = operator.disable(ID);
    if (success)
      console.log(ID + " disabled.");
    else
      console.log(ID + " does not exist.");
  }
}

//deletes .sumo folder
function clean() {
  fsExtra.remove(sumoDir);
}

function deleteResumeFromCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  if(!fs.existsSync(resumeDir)){
    console.log("Nothing to delete")
    process.exit(0)
  }
  rl.question("If you delete '.resume' directory you will lose all the regression testing information. Want to proceed? y/n > ",function(response){
    response=response.trim()
    response=response.toLowerCase()
    if(response==='y' || response==='yes'){
      fsExtra.remove(resumeDir);
      console.log("'.resume directory' has been deleted!")
      rl.close()
    }
    else {
      console.log('Nothing has been deleted')
      rl.close()
    }
  })
}
  function deleteResumeFromGUI(){
  fsExtra.remove(resumeDir);
}


//restores SUT files
function restore() {

  if (fs.existsSync(baselineDir)) {

    let targetConfigFile;
    for (const configFile of testConfigGlob) {
      if (fs.existsSync(baselineDir + configFile)) {
        targetConfigFile = configFile;
        break;
      }
    }
    if (targetConfigFile) {
      fs.copyFile(baselineDir + targetConfigFile, targetDir + targetConfigFile, (err) => {
        if (err) throw err;
      });
    }

    glob(baselineDir + contractsGlob, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        let relativeFilePath = file.split(".sumo/baseline")[1];
        let fileDir = path.dirname(relativeFilePath);
        fs.mkdir(contractsDir + fileDir, { recursive: true }, function(err) {
          if (err) return cb(err);

          fs.copyFile(file, contractsDir + relativeFilePath, (err) => {
            if (err) throw err;
          });
        });
      }
    });
    console.log("Project restored.");
  } else {
    console.log("No baseline available.");
  }
}

/**
 *The <b>saveBytecodeSync</b> function return the original bytecode of a certain contract
 * @param file The name of the original contract
 * @returns {*} The bytecode
 */
function saveBytecodeSync(file) {
  var mutantBytecode;
  try {
    const data = fs.readFileSync(file, "utf-8");
    var json = JSON.parse(data);
    mutantBytecode = json.bytecode;
    return mutantBytecode;
  } catch (err) {
    console.log(chalk.red('Artifact not found!!'));
  }
}

/**
 * The <b>runTest</b> function compile and test each mutant, assigning them a certain status
 * @param mutations An array of all mutants
 * @param originalBytecodeMap A map containing all original contracts bytecodes
 * @param file The name of the original contract
 */
function runTest(mutations, originalBytecodeMap, file) {
  const bytecodeMutantsMap = new Map();
  for (const mutation of mutations) {
    if ((mutation.file.substring(mutation.file.lastIndexOf("/") + 1)) === (file + ".sol")) {
     var startTime=Date.now()
      ganacheChild = spawnGanache();
      mutation.apply();
      reporter.beginCompile(mutation);
      const isCompiled = spawnCompile();
      if (isCompiled) {
        if (config.tce) {
          tce(mutation, bytecodeMutantsMap, file, originalBytecodeMap);
        }
        if (mutation.status !== "redundant" && mutation.status !== "equivalent") {
          reporter.beginTest(mutation);
          const result = spawnTest();
          if (result === 0) {
            mutation.status = "live";
          } else if (result === 999) {
            mutation.status = "timedout";
          } else {
            mutation.status = "killed";
          }
        }
        if (mutation.status !== "redundant" && mutation.status !== "equivalent" && mutation.status !== "timedout") {
          reporter.extractMochawesomeReportInfo(mutation);
        }
      } else {
        mutation.status = "stillborn";
      }
      reporter.mutantStatus(mutation);
      exReporter.mutantStatus(mutation);
      mutation.restore();
      killGanache();
      cleanTmp();
      mutation.time=Date.now()-startTime;
    }
  }
  bytecodeMutantsMap.clear();
}

/**
 * The <b>tce()</b> function provides to compare bytecode of the all contracts used up to that point, and it can set status of the mutated contract
 * in two different cases. "equivalent" status is assigned to the mutated contract that has the same bytecode of the non-mutated contract. "redundant"
 * status is assigned to the mutated contract that has the same bytecode of another mutated contract already tested.
 * @param mutation The mutated contract
 * @param map The map of the already tested mutated contract
 * @param file The file to analyze
 * @param originalBytecodeMap The map that contains all non-mutated contract bytecode
 */
function tce(mutation, map, file, originalBytecodeMap) {
  exploreDirectories(config.compiledDir)
  compiledContracts.map(data=>{
    if(parse(data).name===parse(mutation.file).name){
      mutation.bytecode=saveBytecodeSync(data);
    }
  })

  if (originalBytecodeMap.get(file) === mutation.bytecode) {
    mutation.status = "equivalent";
    console.log(chalk.magenta("EQUIVALENT"));
  } else if (map.size !== 0) {
    for (const key of map.keys()) {
      if (map.get(key) === mutation.bytecode) {
        mutation.status = "redundant";
        console.log(chalk.magenta("REDUNDANT"));
        break;
      }
    }
    if (mutation.status !== "redundant") {
      map.set(mutation.hash(), mutation.bytecode);
    }

  } else {
    map.set(mutation.hash(), mutation.bytecode);
  }
}

  function cleanTmp(){
  var dir= os.tmpdir();
  fs.readdirSync(dir).forEach(f => {
    if(f.substring(0,4)==='tmp-'){
      rimraf.sync(`${dir}/${f}`)
      console.log(f+' deleted')
    }
    });
}



module.exports = {
  test: test, preflight, preflight, mutate: preflightAndSave, diff: diff, list: list,
  enable: enableOperator, disable: disableOperator, clean: clean, preTest: preTest, restore: restore,
  delete:deleteResumeFromCLI, deleteResumeFromGUI:deleteResumeFromGUI
};


