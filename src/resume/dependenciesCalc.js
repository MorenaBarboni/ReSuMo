const path = require("path");
var DepGraph = require("dependency-graph").DepGraph;
const fileSys = require("./utils/fileSys");
const config = require("../config");

function findAndAddDependenciesBetweenTests(test1, test2, graph) {
  //self dependency check
  if (test1 == test2) return;

  var name2 = path.parse(test2.name).name;
  test1.used_tests.forEach((re) => {
    if (re.includes(name2)) {
      //occurrence is not part of another occurrence
      if (re[re.indexOf(name2) - 1] == "/") {
        graph.addDependency(test1.path, test2.path);
      }
    }
  });

}

function findAndAddDependenciesBetweenContracts(contract1, contract2, graph) {
  //self dependency check
  if (contract1 == contract2) return;

  contract1.used_contracts.forEach((im) => {
    if (im.includes(contract2.name)) {
      //occurrence is not part of another occurrence
      if (im[im.indexOf(contract2.name) - 1] == "/") {
        graph.addDependency(contract1.path, contract2.path);
      }
    }
  });


}

function findAndAddDependenciesBetweenTestsAndContracts(
  test1,
  contract2,
  graph
) {
  var name2 = path.parse(contract2.name).name;
  test1.used_contracts.forEach((ar) => {
    if (ar.includes(name2)) {
      //occurrence is not part of another occurrence
      if (ar.indexOf(name2) == 0) {
        graph.addDependency(test1.path, contract2.path);
      }
    }
  });


}

/**
 * Adds contract and test files to the dependency graph
 * @param contracts contract files
 * @param tests test files
 * @param overwrite overwrite old dependencies
 */

function buildDependencyGraph(contracts, tests, overwrite) {
  var graph = new DepGraph({ circular: true });

  contracts.forEach((c) => {
    graph.addNode(c.path, "contract");
  });
  tests.forEach((t) => {
    graph.addNode(t.path, "test");
  });

  //contracts that use contracts - import() statement
  contracts.forEach((c1) => {
    contracts.forEach((c2) => {
      findAndAddDependenciesBetweenContracts(c1, c2, graph);
    });
  });

  //tests that use tests - require() statement
  tests.forEach((t1) => {
    tests.forEach((t2) => {
      findAndAddDependenciesBetweenTests(t1, t2, graph);
    });
  });

  //tests that use contracts - artifacts.require() statement
  tests.forEach((t) => {
    contracts.forEach((c) => {
      findAndAddDependenciesBetweenTestsAndContracts(t, c, graph);
    });
  });

  var allDependencies = [];

  tests.concat(contracts).forEach((file) => {


    const dep = {
      file: file.path,
      testDependencies: graph
        .dependenciesOf(file.path)
        .filter((d) => graph.getNodeData(d) == "test"),
      contractDependencies: graph
        .dependenciesOf(file.path)
        .filter((d) => graph.getNodeData(d) == "contract"),
      testDependants: graph
        .dependantsOf(file.path)
        .filter((d) => graph.getNodeData(d) == "test"),
      contractDependants: graph
        .dependantsOf(file.path)
        .filter((d) => graph.getNodeData(d) == "contract")
    };

    allDependencies.push(dep);
  });

  if (overwrite) {
    fileSys.writeFile(fileSys.types.all_dependencies, allDependencies);
  }
  var contractDependencies = [];
  var testDependencies = [];
  allDependencies.forEach((dep) => {

    //The dependency is a contract under test
    if (dep.file.includes(path.basename(config.testDir))) {
      testDependencies.push(dep);
    }
    //The dependency is a test file
    else if (dep.file.includes(path.basename(config.contractsDir))) {
      contractDependencies.push(dep);
    }
  });
  if (overwrite) {
    fileSys.writeFile(fileSys.types.contracts_deps, contractDependencies);
    fileSys.writeFile(fileSys.types.tests_deps, testDependencies);
  }
  return graph;
}

module.exports = {
  buildDependencyGraph: buildDependencyGraph
};
