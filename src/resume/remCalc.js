const unique = (value, index, self) => {
  return self.indexOf(value) === index;
};

function getChangedContractsPlusDependencyAndDependantContractsOfChangedContracts(
  changed_contracts_paths,
  dependencyGraph
) {
  var contracts = [];
  changed_contracts_paths.forEach((path) => {
    const dependants = dependencyGraph
      .dependantsOf(path)
      .filter((d) => dependencyGraph.getNodeData(d) === "contract"); //dependant contracts
    const dependencies = dependencyGraph
      .dependenciesOf(path)
      .filter((d) => dependencyGraph.getNodeData(d) === "contract"); //dependency contracts
    contracts = contracts.concat(dependencies).concat(dependants);
  });

  return contracts.concat(changed_contracts_paths).filter(unique).sort();
}

function getChangedTestsPlusDependantTestsOfChangedTests(
  changed_tests_paths,
  dependencyGraph
) {
  var tests = [];
  changed_tests_paths.forEach((path) => {
    const dependants = dependencyGraph
      .dependantsOf(path)
      .filter((d) => dependencyGraph.getNodeData(d) === "test"); //dependant contracts
    tests = tests.concat(dependants);
  });

  return tests.concat(changed_tests_paths).filter(unique).sort();
}

function getDependencyContractsOfChangedTests(
  changed_tests_paths,
  dependencyGraph
) {
  var contracts = [];
  changed_tests_paths.forEach((path) => {
    const dependencies = dependencyGraph
      .dependenciesOf(path)
      .filter((d) => dependencyGraph.getNodeData(d) === "contract"); //dependency contracts
    contracts = contracts.concat(dependencies);
  });

  return contracts.filter(unique).sort();
}

function getDependantTestsOfChangedContracts(
  changed_contracts_paths,
  dependencyGraph
) {
  var tests = [];
  changed_contracts_paths.forEach((path) => {
    const dependants = dependencyGraph
      .dependantsOf(path)
      .filter((d) => dependencyGraph.getNodeData(d) === "test"); //dependant tests
    tests = tests.concat(dependants);
  });

  return tests.filter(unique).sort();
}

function getRegressionTestsPlusDependencyTestsOfRegressionTests(
  regressionTests_paths,
  dependencyGraph
) {
  var tests = [];
  regressionTests_paths.forEach((path) => {
    const dependencies = dependencyGraph
      .dependenciesOf(path)
      .filter((d) => dependencyGraph.getNodeData(d) === "test"); //dependency tests
    tests = tests.concat(dependencies);
  });

  return tests.concat(regressionTests_paths).filter(unique).sort();
}

function getChangedContractsPlusDependencyAndDependantContractsOfChangedContractsPlusDependencyContractsOfChangedTests(
  changed_contracts_paths,
  changed_tests_paths,
  dependencyGraph
) {
  var contracts =
    getChangedContractsPlusDependencyAndDependantContractsOfChangedContracts(
      changed_contracts_paths,
      dependencyGraph
    );
  contracts = contracts.concat(
    getDependencyContractsOfChangedTests(changed_tests_paths, dependencyGraph)
  );
  return contracts.filter(unique).sort();
}

function getChangedTestsPlusDependantTestsOfChangedTestsPlusDependantTestsOfChangedContracts(
  changed_contracts_paths,
  changed_tests_paths,
  dependencyGraph
) {
  var tests = getChangedTestsPlusDependantTestsOfChangedTests(
    changed_tests_paths,
    dependencyGraph
  );
  tests = tests.concat(
    getDependantTestsOfChangedContracts(
      changed_contracts_paths,
      dependencyGraph
    )
  );
  return tests.filter(unique).sort();
}

module.exports = {
  getChangedContractsPlusDependencyAndDependantContractsOfChangedContracts:
  getChangedContractsPlusDependencyAndDependantContractsOfChangedContracts,
  getDependantTestsOfChangedContracts: getDependantTestsOfChangedContracts,
  getRegressionTestsPlusDependencyTestsOfRegressionTests:
  getRegressionTestsPlusDependencyTestsOfRegressionTests,
  getDependencyContractsOfChangedTests: getDependencyContractsOfChangedTests,
  getChangedTestsPlusDependantTestsOfChangedTests:
  getChangedTestsPlusDependantTestsOfChangedTests,
  getChangedContractsPlusDependencyAndDependantContractsOfChangedContractsPlusDependencyContractsOfChangedTests:
  getChangedContractsPlusDependencyAndDependantContractsOfChangedContractsPlusDependencyContractsOfChangedTests,
  getChangedTestsPlusDependantTestsOfChangedTestsPlusDependantTestsOfChangedContracts:
  getChangedTestsPlusDependantTestsOfChangedTestsPlusDependantTestsOfChangedContracts
};
