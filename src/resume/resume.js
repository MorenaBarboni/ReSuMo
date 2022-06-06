const chalk = require("chalk");
const fileSys = require("./utils/fileSys");
const loader = require("./utils/loader");
const logger = require("./utils/logger");
const depCalc = require("./dependenciesCalc");
const diffCalc = require("./differencesCalc");
const remCalc = require("./remCalc");

var contractsToBeMutated = [];
var regressionTests = [];
var tests;

/**
 * Start regression testing
 * @param overwrite overwrite old checksums and dependencies
 * @param print print log 
 */
function ress(overwrite, print) {
  fileSys.createAmbient();

  //load files
  const contracts = loader.loadContracts();

  tests = loader.loadTests();

  logger.logBaseline(contracts, tests);

  const dependencyGraph = depCalc.buildDependencyGraph(contracts, tests, overwrite);

  if (print) {
    console.log("=============================================");
    console.log(chalk.yellow.bold("> Computing File Differences"))
    console.log("=============================================");
    console.log();
  }

  const changedContracts_paths = diffCalc.checkContracts(contracts, overwrite);
  const changedTests_paths = diffCalc.checkTests(tests, overwrite);

  if (print) {
    logger.logPathsOnConsole("Changed contracts", changedContracts_paths);
    logger.logPathsOnConsole("Changed tests", changedTests_paths);
    logger.logProgramDifferences(changedContracts_paths, changedTests_paths);
  }
  /*console.log();
  console.log("=============================================");
  console.log(chalk.yellow.bold("> Selecting Contract and Test Files"))
  console.log("=============================================");
  console.log();*/


  const contracsHaveChanged = changedContracts_paths.length > 0;
  const testsHaveChanged = changedTests_paths.length > 0;


  //no changes
  /*if (!contracsHaveChanged && !testsHaveChanged) {
    console.log(
      chalk.red("Case:") +
      " " +
      chalk.green("No changed files since last revision")
    );
    console.log();
  }*/

  //only changed contracts
  if (contracsHaveChanged && !testsHaveChanged) {
    /* console.log(
       chalk.red("Case:") +
       " " +
       chalk.green("Only contracts changed since last revision")
     );
     console.log();*/

    //changed contracts + dependant and dependency contracts of changed contracts
    contractsToBeMutated =
      remCalc.getChangedContractsPlusDependencyAndDependantContractsOfChangedContracts(
        changedContracts_paths,
        dependencyGraph
      );

    //dependant tests of changed contracts
    regressionTests = remCalc.getDependantTestsOfChangedContracts(
      changedContracts_paths,
      dependencyGraph
    );

    //regression test + dependency tests of regression test
    regressionTests =
      remCalc.getRegressionTestsPlusDependencyTestsOfRegressionTests(
        regressionTests,
        dependencyGraph
      );
  }

  //only changed tests
  if (!contracsHaveChanged && testsHaveChanged) {
    /*console.log(
      chalk.red("Case:") +
      " " +
      chalk.green("Only tests changed since last revision")
    );
    console.log();*/

    //dependency contracts of changed tests
    contractsToBeMutated = remCalc.getDependencyContractsOfChangedTests(
      changedTests_paths,
      dependencyGraph
    );

    //changed tests + dependant tests of changed tests
    regressionTests = remCalc.getChangedTestsPlusDependantTestsOfChangedTests(
      changedTests_paths,
      dependencyGraph
    );

    //regression test + dependency tests of regression test
    regressionTests =
      remCalc.getRegressionTestsPlusDependencyTestsOfRegressionTests(
        regressionTests,
        dependencyGraph
      );
  }

  //se ci sono sia contratti che test alterati
  if (contracsHaveChanged && testsHaveChanged) {
    /* console.log(
       chalk.red("Case:") +
       " " +
       chalk.green("Both contracts and tests changed since last revision")
     );
     console.log();*/

    contractsToBeMutated =
      remCalc.getChangedContractsPlusDependencyAndDependantContractsOfChangedContractsPlusDependencyContractsOfChangedTests(
        changedContracts_paths,
        changedTests_paths,
        dependencyGraph
      );
    regressionTests =
      remCalc.getChangedTestsPlusDependantTestsOfChangedTestsPlusDependantTestsOfChangedContracts(
        changedContracts_paths,
        changedTests_paths,
        dependencyGraph
      );
    regressionTests =
      remCalc.getRegressionTestsPlusDependencyTestsOfRegressionTests(
        regressionTests,
        dependencyGraph
      );
  }
  // logger.logPathsOnConsole("Selected contracts", contractsToBeMutated);
  //logger.logPathsOnConsole("Selected tests", regressionTests);
  if (print) {
    logger.logRTS(contractsToBeMutated, regressionTests);
  }
}

function getChangedTest() {
  return regressionTests;
}

function getChangedContracts() {
  return contractsToBeMutated;
}

function getOriginalTest() {
  return tests;
}


module.exports = {
  regressionTesting: ress,
  getChangedTest: getChangedTest,
  getChangedContracts: getChangedContracts,
  getOriginalTest: getOriginalTest
};
