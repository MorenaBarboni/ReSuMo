const fs = require("fs");
const fileSys = require("./utils/fileSys");
const loader = require("./utils/loader");
const depCalc = require("./dependenciesCalc");
const diffCalc = require("./differencesCalc");
const remCalc = require("./remCalc");
const config = require("../config");

var contractsToBeMutated = [];
var regressionTests = [];
var tests;

/**
 * Start regression testing
 * @param overwrite overwrite old checksums and dependencies
 */
function ress(overwrite) {
  fileSys.createAmbient();

  //load files
  const contracts = loader.loadContracts();

  tests = loader.loadTests();

  const dependencyGraph = depCalc.buildDependencyGraph(contracts, tests, overwrite);

  const changedContracts_paths = diffCalc.checkContracts(contracts, overwrite);
  const changedTests_paths = diffCalc.checkTests(tests, overwrite);

  const contracsHaveChanged = changedContracts_paths.length > 0;
  const testsHaveChanged = changedTests_paths.length > 0;

  //only changed contracts
  if (contracsHaveChanged && !testsHaveChanged) {
    
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
}

/**
 * Get all the test files to be re-evaluated
 * @returns a list of test files
 */
function getChangedTest() {
  return regressionTests;
}

/**
 * Get all the smart contracts to be mutated
 * @returns a list of smart contracts
 */
function getChangedContracts() {
  return contractsToBeMutated;
}

/**
 * Get the original test files
 * @returns a list of test files
 */
function getOriginalTest() {
  return tests;
}

/**
 * Get all the test files that should be run on a smart contract from the contracts_deps.json
* @param contract a smart contract file
* @returns a list of test files that cover a smart contract
 */
 function getTestsCoveringContract(contract) {
    let contracts_deps = fs.readFileSync(config.artifactsDir+"/dependencies/contracts_deps.json")
    let json = JSON.parse(contracts_deps)
    let testsForContract = [];
    json.forEach(element => {
      if (element.file === contract){
        testsForContract.push(element.testDependants)
      }
    }); 
    return testsForContract;
}

module.exports = {
  regressionTesting: ress,
  getChangedTest: getChangedTest,
  getChangedContracts: getChangedContracts,
  getOriginalTest: getOriginalTest,
  getTestsCoveringContract: getTestsCoveringContract
};
