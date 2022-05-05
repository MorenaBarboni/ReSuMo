const fs = require("fs");
const path = require("path");
const copy = require("recursive-copy");
const glob = require("glob");
const mkdirp = require("mkdirp");
const parser = require("@solidity-parser/parser");
const { parse } = require("path");
const chalk = require("chalk");

//SuMo modules
const Reporter = require("./reporter");
const Instrumenter = require("./instrumenter");
const testingInterface = require("./testingInterface");
const operators = require("./operators");
const utils = require("./utils");
const config = require("./config");
const resume = require("./resume/resume");
const csvWriter = require("./resume/utils/csvWriter");

//SuMo configuration
const absoluteSumoDir = config.absoluteSumoDir;
const sumoDir = config.sumoDir;
const targetDir = config.targetDir;
const baselineDir = config.baselineDir;
const contractsDir = config.contractsDir;
const buildDir = config.buildDir;
const testDir = config.testDir;
const liveDir = config.liveDir;
const killedDir = config.killedDir;
const mutantsDir = config.mutantsDir;
const contractsGlob = config.contractsGlob;
const testConfigGlob = config.testConfigGlob;
const packageManagerGlob = config.packageManagerGlob;
var testingFramework;
var packageManager;
var runScript;
var compiledContracts = [];

//SuMo modules
const reporter = new Reporter();
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


/**
 * Prepare the necessary directories and files, checks the SUT configuration
 */
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
        runScript = "run";
      } else {
        packageManager = "npm";
        runScript = "run-script";
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

/**
 * Shows a summary of the available mutants without starting the testing process.
 */
function preflight() {
  prepare(() =>
    glob(contractsDir + contractsGlob, (err, files) => {
      if (err) throw err;
      const mutations = generateAllMutations(files)
        reporter.preflightSummary(mutations)
      //reporter.preflightToExcel(mutations)
    })
  );
}

/**
 * Shows a summary of the available mutants without starting the testing process and
 * saves the mutants to file.
 */
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

/**
 * Generates  the mutations for each target contract
 *  @param files The smart contracts of the SUT
 */
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

/**
 * Check if the original tests pass.
 */
function preTest() {
  console.log("Pre-Test ...");

  const status = testingInterface.spawnTest(packageManager, testingFramework, runScript);

  if (status === 0) {
    console.log("PreTest OK.");
  } else {
    console.error("Error: Original tests should pass.");
    process.exit(1);
  }
}



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
      if (config.regression) {
        resume.regressionTesting();
        changedContracts = resume.getChangedContracts();
        changedTest = resume.getChangedTest();
        originalTest = resume.getOriginalTest();
        for (const singleTest of originalTest) {
          if (!changedTest.includes(singleTest.path) && !(path.dirname(singleTest.path) === testDir + '/utils' && !(path.dirname(singleTest.path) === testDir + '/json'))) {
            fs.unlinkSync(singleTest.path);
          }
        }
      } else {
        changedContracts = files;
      }
      testingInterface.spawnCompile(packageManager, testingFramework, runScript);
      var originalBytecodeMap = new Map();
      var check = false;
      var contractsToMutate = [];
      for (const changedContract of changedContracts) {
        for (const ignoreElement of config.ignore) {
          if (ignoreElement !== changedContract) {
            check = true;
          } else {
            check = false;
            break;
          }
        }

        if (check) {
          exploreDirectories(buildDir)
          compiledContracts.map(singleContract => {
            if (parse(singleContract).name === parse(changedContract).name) {
              originalBytecodeMap.set(parse(changedContract).name, saveBytecodeSync(singleContract))
              if (!contractsToMutate.includes(changedContract)) {
                contractsToMutate.push(changedContract)
              }
            }
          })
        }
        check = false
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
      reporter.saveOperatorsResults();
      reporter.restore();

      if (config.regression) {
        utils.restoreTestDir();
        csvWriter.csv();
      }
    })
  )
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
      var startTime = Date.now()
      ganacheChild = testingInterface.spawnGanache();
      mutation.apply();
      reporter.beginCompile(mutation);
      const isCompiled = testingInterface.spawnCompile(packageManager, testingFramework, runScript);
      if (isCompiled) {
        if (config.tce) {
          tce(mutation, bytecodeMutantsMap, file, originalBytecodeMap);
        }
        if (mutation.status !== "redundant" && mutation.status !== "equivalent") {
          reporter.beginTest(mutation);
          const result = testingInterface.spawnTest(packageManager, testingFramework, runScript);
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
      mutation.restore();
      testingInterface.killGanache();
      utils.cleanTmp();
      mutation.time = Date.now() - startTime;
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
  exploreDirectories(buildDir)
  compiledContracts.map(data => {
    if (parse(data).name === parse(mutation.file).name) {
      mutation.bytecode = saveBytecodeSync(data);
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

/**
 Saves the test results extracted from the  mocha-report dir to an excel file
 */
function generateTestExcel() {
  if (fs.existsSync(sumoDir + '/mochawesome-report'))
    reporter.saveTestData();
  else
    console.log('The mochawesome-report dir does not exist!')
}

module.exports = {
  test: test, preflight, preflight, mutate: preflightAndSave, diff: diff, list: list,
  enable: enableOperator, disable: disableOperator, preTest: preTest, generateExcel: generateTestExcel
};

