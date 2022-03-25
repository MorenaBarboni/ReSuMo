const fileSys = require("./src/utils/fileSys");
const loader = require("./src/utils/loader");
const logger = require("./src/utils/logger");
const dependenciesCalc = require("./src/dependencies/dependenciesCalc");
const checksumCalc = require("./src/checksum/checksumCalc");
const firewallCalc = require("./src/firewall/firewallCalc");
const chalk = require("chalk");
const unique = (value, index, self) => {
  return self.indexOf(value) === index;
};

//.resume dir
fileSys.createAmbient();

//load files
const contracts = loader.loadContracts();
// [
//  {
//    path: ../C.sol,
//    name: C.sol,
//    content: ...,
//    imports: [../D.sol, ../E.sol, ...]
//  }, ...
// ]

const tests = loader.loadTests();
// [
//  {
//    path: ../T1.js,
//    name: T1.js,
//    content: ...,
//    requires: [../T5.js, ../T6.js, ...],
//    artifacts: [../D.sol, ../E.sol, ...]
//  }, ...
// ]

//files dependencies (C-uses-C, T-uses-C, T-uses-T)
const dependencyGraph = dependenciesCalc.buildDependencyGraph(contracts, tests);
// graph: node: name: ../C.sol,
//              data: "contract" or "test"

//changed files (+ newly added files) since last execution
const changedContracts_paths = checksumCalc.checkContracts(contracts);
// [../C.sol, ../D.sol, ...]
const changedTests_paths = checksumCalc.checkTests(tests);
// [../T1.js, ../T2.js, ...]

/*
######################################
######### REGRESSION TESTING #########
######################################
*/

console.log();
console.log("#####################################");
console.log("######## PROGRAM DIFFERENCES ########");
console.log("#####################################");
console.log();

logger.logPaths("Changed contracts", changedContracts_paths);
logger.logPaths("Changed tests", changedTests_paths);

console.log();
console.log("######################################");
console.log("######### REGRESSION TESTING #########");
console.log("######################################");
console.log();

//file firewall around dangerous files (contracts and tests)
const filesFirewall = firewallCalc.computeFirewall(
  changedContracts_paths,
  changedTests_paths,
  dependencyGraph
);

//regression tests
const regressionTests = firewallCalc.extractTestsFromFirewall(filesFirewall);

logger.logPaths(
  "Files firewall",
  filesFirewall.tests.concat(filesFirewall.contracts)
);

logger.logPaths("Regression tests", regressionTests);

console.log();