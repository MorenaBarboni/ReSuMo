const fs = require("fs");
const path = require("path");
const copy = require("recursive-copy");
const glob = require("glob");
const mkdirp = require("mkdirp");
const parser = require("@solidity-parser/parser");
const { parse } = require("path");
const chalk = require("chalk");
const rimraf = require('rimraf')

//SuMo modules
const Reporter = require("./reporter");
const Instrumenter = require("./instrumenter");
const testingInterface = require("./testingInterface");
const mutationGenerator = require("./operators/mutationGenerator");
const utils = require("./utils");
const config = require("./config");
const resume = require("./resume/resume");
const csvWriter = require("./resume/utils/csvWriter");

//SuMo configuration
const absoluteArtifactsDir = config.absoluteArtifactsDir;
const resultsDir = config.resultsDir
const artifactsDir = config.artifactsDir
const baselineDir = config.baselineDir;
const targetDir = config.targetDir;
const contractsDir = config.contractsDir;
const buildDir = config.buildDir;
const testDir = config.testDir;
const contractsGlob = config.contractsGlob;
const equivalentDir = resultsDir + '/equivalent';
const liveDir = resultsDir + '/live';
const mutantsDir = resultsDir + '/mutants';
const redundantDir = resultsDir + '/redundant';
const stillbornDir = resultsDir + '/stillborn';
const timedoutDir = resultsDir + '/timedout';
const killedDir = resultsDir + '/killed';

var packageManager;
var runScript;
var originalBytecodeMap = new Map();
var compiledArtifacts = [];

//SuMo modules
const reporter = new Reporter();
const instrumenter = new Instrumenter();
const mutGen = new mutationGenerator.CompositeOperator([
  new mutationGenerator.ACMOperator(),
  new mutationGenerator.AOROperator(),
  new mutationGenerator.AVROperator(),
  new mutationGenerator.BCRDOperator(),
  new mutationGenerator.BLROperator(),
  new mutationGenerator.BOROperator(),
  new mutationGenerator.CBDOperator(),
  new mutationGenerator.CCDOperator(),
  new mutationGenerator.CSCOperator(),
  new mutationGenerator.DLROperator(),
  new mutationGenerator.DODOperator(),
  new mutationGenerator.ECSOperator(),
  new mutationGenerator.EEDOperator(),
  new mutationGenerator.EHCOperator(),
  new mutationGenerator.EROperator(),
  new mutationGenerator.ETROperator(),
  new mutationGenerator.FVROperator(),
  new mutationGenerator.GVROperator(),
  new mutationGenerator.HLROperator(),
  new mutationGenerator.ILROperator(),
  new mutationGenerator.ICMOperator(),
  new mutationGenerator.LSCOperator(),
  new mutationGenerator.PKDOperator(),
  new mutationGenerator.MCROperator(),
  new mutationGenerator.MOCOperator(),
  new mutationGenerator.MODOperator(),
  new mutationGenerator.MOIOperator(),
  new mutationGenerator.MOROperator(),
  new mutationGenerator.OLFDOperator(),
  new mutationGenerator.OMDOperator(),
  new mutationGenerator.ORFDOperator(),
  new mutationGenerator.RSDOperator(),
  new mutationGenerator.RVSOperator(),
  new mutationGenerator.SCECOperator(),
  new mutationGenerator.SFIOperator(),
  new mutationGenerator.SFDOperator(),
  new mutationGenerator.SFROperator(),
  new mutationGenerator.SKDOperator(),
  new mutationGenerator.SKIOperator(),
  new mutationGenerator.SLROperator(),
  new mutationGenerator.TOROperator(),
  new mutationGenerator.UORDOperator(),
  new mutationGenerator.VUROperator(),
  new mutationGenerator.VVROperator()
]);


/**
 * Prepare the necessary directories and files, checks the SUT configuration
 */
function prepare(callback) {

  if (absoluteArtifactsDir === "" || targetDir === "" || contractsDir === "" || testDir === "" || (config.tce && buildDir === '')) {
    console.error("SuMo configuration is incomplete or missing.");
    process.exit(1);
  }

  //Checks the package manager used by the SUT
  let pmConfig = utils.getPackageManager()
  packageManager = pmConfig.packageManager;
  runScript = pmConfig.runScript;

  let testConfigFile = utils.getTestConfig();
  instrumenter.setConfig(testConfigFile);

  mkdirp.sync(resultsDir);
  mkdirp.sync(artifactsDir);
  mkdirp.sync(mutantsDir);
  mkdirp.sync(liveDir);
  mkdirp.sync(killedDir);
  mkdirp.sync(timedoutDir);
  mkdirp.sync(stillbornDir);
  if (config.tce) {
    mkdirp.sync(redundantDir);
    mkdirp.sync(equivalentDir);
  }

  if (fs.existsSync(baselineDir)) {
    rimraf(baselineDir, function () {
      //console.log("Baseline deleted");
      mkdirp(baselineDir, () =>
        copy(targetDir + testConfigFile, baselineDir + testConfigFile,
          copy(testDir, baselineDir + '/test', { dot: true },
            copy(contractsDir, baselineDir + '/contracts', { dot: true }, callback)))
      );
    })
  } else {
    mkdirp(baselineDir, () =>
      copy(targetDir + testConfigFile, baselineDir + testConfigFile,
        copy(testDir, baselineDir + '/test', { dot: true },
          copy(contractsDir, baselineDir + '/contracts', { dot: true }, callback)))
    );
  }
}

/**
 * Shows a summary of all the mutants without starting the testing process.
 */
function preflight() {
  prepare(() =>
    glob(contractsDir + contractsGlob, (err, files) => {

      if (err) throw err;

      let contractsUnderMutation;

      if (config.regression) {
        resume.regressionTesting(false);
        contractsUnderMutation = resumeContractSelection();
        testsToBeRun = resumeTestSelection();
        reporter.logSelectedFiles(contractsUnderMutation, testsToBeRun);
      } else {
        contractsUnderMutation = defaultContractSelection(files);
        testsToBeRun = defaultTestSelection();
        reporter.logSelectedFiles(contractsUnderMutation, testsToBeRun);
      }
      generateAllMutations(contractsUnderMutation, true)
    })
  );
}


/**
 * Shows a summary of the available mutants without starting the testing process and
 * saves the generated .sol mutants to file.
 */
function mutate() {
  prepare(() =>
    glob(contractsDir + contractsGlob, (err, files) => {
      if (err) throw err;
      let contractsUnderMutation;
      if (config.regression) {
        resume.regressionTesting(false);
        contractsUnderMutation = resumeContractSelection();
        testsToBeRun = resumeTestSelection();
        reporter.logSelectedFiles(contractsUnderMutation, testsToBeRun);
      } else {
        contractsUnderMutation = defaultContractSelection(files);
        testsToBeRun = defaultTestSelection();
        reporter.logSelectedFiles(contractsUnderMutation, testsToBeRun);
      }
      const mutations = generateAllMutations(contractsUnderMutation, true);
      for (const mutation of mutations) {
        mutation.save();
      }
      console.log("Mutants saved to file");
    })
  );
}

/**
 * Generates  the mutations for each target contract
 *  @param files The smart contracts to be mutated
 *  @param overwrite Overwrite the generated mutation reports
 */
function generateAllMutations(files, overwrite) {
  let mutations = [];
  var startTime = Date.now();
  let contractsUnderTest = files;
  for (const file of contractsUnderTest) {
    const source = fs.readFileSync(file, "utf8");
    const ast = parser.parse(source, { range: true, loc: true })
    const visit = parser.visit.bind(parser, ast);
    mutations = mutations.concat(mutGen.getMutations(file, source, visit, overwrite));
  }
  if (overwrite) {
    var generationTime = (Date.now() - startTime) / 1000
    reporter.saveGeneratedMutantsCsv(mutations);
    reporter.logPreflightSummary(mutations, generationTime, mutGen.getEnabledOperators())
  }
  return mutations;
}

/**
 * Runs the original test suite to ensure that all tests pass.
 * Cleans up files from the previous run.
 */
function preTest() {

  reporter.logPretest();

  //Check if there are contracts under mutation
  let contractsUnderMutation;
  let testsToBeRun;

  if (config.regression) {
    resume.regressionTesting(false);
    contractsUnderMutation = resumeContractSelection();
    testsToBeRun = resumeTestSelection();
  } else {
    contractsUnderMutation = defaultContractSelection();
    testsToBeRun = defaultTestSelection();
  }

  if (contractsUnderMutation.length == 0) {
    console.log(chalk.red("- No mutants to test"))
    process.exit(1)
  }

  //run pretest on all test files regardless of regression
  if (testsToBeRun.testFiles.length == 0) {
    console.log(chalk.red("- No tests to be evaluated"))
    process.exit(1)
  }

  utils.cleanBuildDir(); //Remove old compiled artifacts
  utils.cleanMochaDir(); //Remove old mochawesome reports
  utils.cleanSavedMutations(); //Remove old saved mutations
  reporter.setupResultsCsv();

  let ganacheChild = testingInterface.spawnGanache();
  const isCompiled = testingInterface.spawnCompile(packageManager, runScript);

  if (isCompiled) {
    const status = testingInterface.spawnTest(packageManager, runScript, testsToBeRun.testFiles);
    if (status === 0) {
      console.log("Pre-test OK.");
    } else {
      testingInterface.killGanache(ganacheChild);
      console.error(chalk.red("Error: Original tests should pass."));
      process.exit(1);
    }
  } else {
    testingInterface.killGanache(ganacheChild);
    console.error(chalk.red("Error: Original contracts should compile."));
    process.exit(1);
  }
  testingInterface.killGanache(ganacheChild);
}

/**
 * Starts the mutation testing process
 */
function test() {
  prepare(() =>
    glob(contractsDir + contractsGlob, (err, files) => {
      if (err) throw err;

      //Run the pre-test
      preTest();

      //Select contracts to mutate and tests to be run
      let contractsUnderMutation;
      let testsToBeRun;

      if (config.regression) {
        utils.saveMutationBaseline();
        resume.regressionTesting(true);
        contractsUnderMutation = resumeContractSelection();
        testsToBeRun = resumeTestSelection();
        reporter.logSelectedFiles(contractsUnderMutation, testsToBeRun);
        contractsUnderMutation.forEach(c => {
          let testsForC = resumeTestSelectionForContract(c);
          if (testsForC.length != 0) {
            reporter.logTestsForContract(c, testsForC)
          }
        });

      } else {
        contractsUnderMutation = defaultContractSelection(files);
        testsToBeRun = defaultTestSelection();
        reporter.logSelectedFiles(contractsUnderMutation, testsToBeRun);
      }
      if (config.tce) {
        //save the bytecode of the original contracts
        exploreDirectories(buildDir)
        for (const contract of contractsUnderMutation) {
          compiledArtifacts.map(artifact => {
            if (parse(artifact).name === parse(contract).name) {
              originalBytecodeMap.set(parse(contract).name, saveBytecodeSync(artifact))
            }
          })
        }
      }
      //Generate the mutations
      instrumenter.instrumentConfig();
      reporter.setupMutationsReport();
      const mutations = generateAllMutations(contractsUnderMutation, true);

      //Compile and test each mutant
      reporter.logStartMutationTesting()
      var startTime = Date.now();
      for (const file of contractsUnderMutation) {
        runTest(mutations, file, testsToBeRun.testFiles);
      }
      var testTime = ((Date.now() - startTime) / 60000).toFixed(2);

      //Restore the test configuration file
      instrumenter.restoreConfig();

      //Integrate the test results
      reporter.integrateUnchangedMutants(contractsUnderMutation, () => {
        reporter.saveMutationsJSON();
        reporter.saveOperatorsResults();
        if (config.regression) {
          csvWriter.csv();
        }
        reporter.logAndSaveTestSummary(testTime)
      })
    })
  )
}

/**
 * Default selection of contracts to mutate
 * @param files array of paths of all Smart Contracts * 
 */
function defaultContractSelection(files) {
  var contractUnderMutation = [];

  for (const file of files) {
    let skipContract = false;
    for (const path of config.skipContracts) {
      if (file.startsWith(path) && path !== "") {
        skipContract = true;
        break;
      }
    }
    if (!skipContract) {
      contractUnderMutation.push(file)
    }
  }
  return contractUnderMutation;
}

/**
 * Regression selection of contracts to mutate * 
 * @returns a list of contracts to be mutated
 */
function resumeContractSelection() {
  let changedContracts = resume.getChangedContracts();
  let contractsUnderMutation = [];

  for (const file of changedContracts) {
    let skipContract = false;
    for (const path of config.skipContracts) {
      if (file.startsWith(path) && path !== "") {
        skipContract = true;
        break;
      }
    }
    if (!skipContract) {
      contractsUnderMutation.push(file)
    }
  }
  return contractsUnderMutation;
}

/**
 * Regression selection of tests to evaluate
 * @returns a list of tests to be run
 */
function resumeTestSelection() {
  let tests = {
    testFiles: [],
    testUtils: [],
  }

  let changedTests = resume.getChangedTest();
  let originalTests = resume.getOriginalTest();

  //Select tests to be run
  for (const originalTest of originalTests) {
    let keepTest = false;

    //If the test is an util it will not be deleted
    for (const path of config.testUtils) {
      if (originalTest.path.startsWith(path) && path !== "") {
        tests.testUtils.push(originalTest.path)
        keepTest = true;
        break;
      }
    }

    if (!keepTest) {
      //If the test was marked as changed by ReSuMe
      if (changedTests.includes(originalTest.path)) {
        keepTest = true;
      }
      if (keepTest) {
        //If the test must be skipped
        for (const path of config.skipTests) {
          if (originalTest.path.startsWith(path) && path !== "") {
            //console.log("Skipped test > " + originalTest.path);
            keepTest = false;
            break;
          }
        }
      }
      if (keepTest) {
        tests.testFiles.push(originalTest.path);
      }
    }
  }
  return tests;
}

/**
 * Get the regression tests to be run on a specific smart contract
 * @param contract the smart contract to be tested
 * @returns a list of tests
 */
function resumeTestSelectionForContract(contract) {

  let tests = {
    testFiles: [],
    testUtils: [],
  }

  const resumeSelectedTests = resumeTestSelection();
  const testsCoveringContract = resume.getTestsCoveringContract(contract);

  if (testsCoveringContract.length != 0) {
    tests.testUtils = resumeSelectedTests.testUtils;

    testsCoveringContract[0].forEach(t => {
      if (resumeSelectedTests.testFiles.includes(t)) {
        tests.testFiles.push(t)
      }
    });
  }

  return tests;
}



/**
 * Default selection of tests to evaluate
 * @returns a list of tests to be run
 */
function defaultTestSelection() {
  let tests = {
    testFiles: [],
    testUtils: [],
  }

  if (!fs.existsSync(config.testDir)) {
    console.log("Tests directory does not exits!");
    process.exit(0);
  }

  const originalTests = glob.sync(config.testDir + config.testsGlob);

  //Select tests to be run
  for (const originalTest of originalTests) {
    let isUtil = false;

    //If the test is an util it will not be deleted
    for (const path of config.testUtils) {
      if (originalTest.startsWith(path) && path !== "") {
        tests.testUtils.push(originalTest)
        isUtil = true;
        break;
      }
    }
    if (!isUtil) {
      tests.testFiles.push(originalTest);
    }
  }
  return tests;
}


/**
 * Get a mutation by its hash
 * @param {*} mutations 
 * @returns 
 */
function mutationsByHash(mutations) {
  return mutations.reduce((obj, mutation) => {
    obj[mutation.hash()] = mutation;
    return obj;
  }, {});
}

/**
 * Prints the diff between a mutant and the original contract
 * @param {*} argv the hash of the mutant
 */

function diff(argv) {
  prepare(() =>
    glob(contractsDir + contractsGlob, (err, files) => {
      const mutations = generateAllMutations(files, false);
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
  console.log(mutGen.getEnabledOperators());
}

//Enables a mutation operator
function enableOperator(ID) {
  //Enable all operators
  if (!ID) {
    var success = mutGen.enableAll();
    if (success)
      console.log("> All mutation operators enabled.");
    else
      console.log("Error");
  } else {
    //Enable operator ID
    var success = mutGen.enable(ID);
    if (success)
      console.log("> " + chalk.bold.yellow(ID) + " enabled.");
    else
      console.log("> " + ID + " does not exist.");
  }
}


//Disables a mutation operator 
function disableOperator(ID) {
  //Disable all operators
  if (!ID) {
    var success = mutGen.disableAll();
    if (success)
      console.log("> All mutation operators disabled.");
    else
      console.log("Error");
  } else {
    //Disable operator ID
    var success = mutGen.disable(ID);
    if (success)
      console.log("> " + chalk.bold.yellow(ID) + " disabled.");
    else
      console.log("> " + ID + " does not exist.");
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
 * @param file The name of the original contract
 * @param tests the tests to be run on the mutated contract
 */
function runTest(mutations, file, tests) {
  const mutantBytecodeMap = new Map();

  for (var mutation of mutations) {
    if ((parse(mutation.file).name) === (parse(file).name)) {

      let ganacheChild = testingInterface.spawnGanache();

      mutation.apply();
      reporter.logCompile(mutation);
      const isCompiled = testingInterface.spawnCompile(packageManager, runScript);

      if (isCompiled) {
        if (config.tce) {
          tce(mutation, mutantBytecodeMap, originalBytecodeMap);
        }
        if (mutation.status !== "redundant" && mutation.status !== "equivalent") {
          reporter.logTest(mutation);
          let startTestTime = Date.now();

          //If there are no tests to be run on the mutant
          if (tests.length === 0) {
            mutation.status = "live";
          } else {
            const result = testingInterface.spawnTest(packageManager, runScript, tests);
            mutation.testingTime = Date.now() - startTestTime;
            if (result === 0) {
              mutation.status = "live";
            } else if (result === 999) {
              mutation.status = "timedout";
            } else {
              mutation.status = "killed";
            }
          }
        }
        if (mutation.status !== "redundant" && mutation.status !== "equivalent" && mutation.status !== "timedout") {
          mutation = reporter.getTestResults(mutation);
        }
      } else {
        mutation.status = "stillborn";
      }
      if (mutation.status !== "redundant") {
        reporter.saveResultsCsv(mutation, null);
      }

      reporter.mutantStatus(mutation);
      mutation.restore();
      testingInterface.killGanache(ganacheChild);
    }
  }
  mutantBytecodeMap.clear();
}

/**
 * The <b>tce()</b> function provides to compare bytecode of the all contracts used up to that point, and it can set status of the mutated contract
 * in two different cases. "equivalent" status is assigned to the mutated contract that has the same bytecode of the non-mutated contract. "redundant"
 * status is assigned to the mutated contract that has the same bytecode of another mutated contract already tested.
 * @param mutation The mutated contract
 * @param map The map of the already tested mutated contract
 * @param originalBytecodeMap The map that contains all non-mutated contract bytecode
 */
function tce(mutation, map, originalBytecodeMap) {

  console.log();
  console.log(chalk.yellow('Running the TCE'));
  let fileName = parse(mutation.file).name;

  compiledArtifacts = [];

  exploreDirectories(buildDir)
  compiledArtifacts.map(artifact => {
    if (parse(artifact).name === parse(mutation.file).name) {
      mutation.bytecode = saveBytecodeSync(artifact);
    }
  })

  if (originalBytecodeMap.get(fileName) === mutation.bytecode) {
    mutation.status = "equivalent";
  } else if (map.size !== 0) {
    for (const key of map.keys()) {
      if (map.get(key) === mutation.bytecode) {
        mutation.status = "redundant";
        reporter.saveResultsCsv(mutation, key);
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

function exploreDirectories(Directory) {
  fs.readdirSync(Directory).forEach(File => {
    const Absolute = path.join(Directory, File);
    if (fs.statSync(Absolute).isDirectory())
      return exploreDirectories(Absolute);
    else
      return compiledArtifacts.push(Absolute);
  });
}


/**
 Saves the test results extracted from the  mocha-report dir to an excel file
 */
function generateTestExcel() {
  if (fs.existsSync(artifactsDir + '/mochawesome-report'))
    reporter.saveTestData();
  else
    console.log('The mochawesome-report dir does not exist!')
}

module.exports = {
  test: test, preflight, preflight, mutate: mutate, diff: diff, list: list,
  enable: enableOperator, disable: disableOperator, preTest: preTest, generateExcel: generateTestExcel
};


