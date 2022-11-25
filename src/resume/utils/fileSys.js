const fs = require("fs-extra");
const path = require("path");
const config = require("../../config");

const sumoDir = config.sumoDir;
const baselineDir = config.baselineDir;
const artifactsDir = config.artifactsDir;

const config_projectDir = path.isAbsolute(config.targetDir)
  ? config.targetDir
  : path.resolve("ReSuMe", config.targetDir);

const config_contractsDir = path.isAbsolute(config.contractsDir)
  ? config.contractsDir
  : path.resolve("ReSuMe", config.contractsDir);

const config_testsDir = path.isAbsolute(config.testDir)
  ? config.testDir
  : path.resolve("ReSuMe", config.testDir);

const loadContractsDir = config_contractsDir;
const loadContractsDirGlob = config_contractsDir + config.contractsGlob;
const loadTestsDir = config_testsDir;
const loadTestsDirGlob = config_testsDir + config.testsGlob;


const checksumsDir = path.join(artifactsDir, "checksums");
const contracts_checksums = path.join(checksumsDir, "contracts_checksums.json");
const tests_checksums = path.join(checksumsDir, "tests_checksums.json");

const changesDir = path.join(artifactsDir, "changed_files");
const contracts_changed = path.join(changesDir, "contracts_changed.json");
const tests_changed = path.join(changesDir, "tests_changed.json");

const dependenciesDir = path.join(artifactsDir, "dependencies");
const contracts_deps = path.join(dependenciesDir, "contracts_deps.json");
const tests_deps = path.join(dependenciesDir, "tests_deps.json");
const all_dependencies = path.join(dependenciesDir, "all_dependencies.json");

const regression_tests = path.join(artifactsDir, "regression_tests.json");
const regression_contracts = path.join(artifactsDir, "regression_contracts.json");


function createAmbient() {
  if (!fs.existsSync(config_projectDir)) {
    console.log("Project directory does not exits!");
    process.exit(0);
  }

  if (!fs.existsSync(sumoDir)){
    console.log("- "+sumoDir +" does not exist!")
    process.exit(0)
  }

  if (!fs.existsSync(dependenciesDir))
    fs.mkdirSync(dependenciesDir);
  if (!fs.existsSync(checksumsDir))
    fs.mkdirSync(checksumsDir);
}

function writeFile(type, content) {
  var path = adequatePath(type);
  fs.writeFileSync(path, JSON.stringify(content, null, "\t"), (err) => {
    if (err)
      throw err;
  });
}

function adequatePath(type) {
  switch (type) {
    case types.baseline:
      return baselineDir;
    case types.contracts_checksums:
      return contracts_checksums;
    case types.tests_checksums:
      return tests_checksums;
    case types.contracts_changed:
      return contracts_changed;
    case types.tests_changed:
      return tests_changed;
    case types.contracts_deps:
      return contracts_deps;
    case types.all_dependencies:
      return all_dependencies;
    case types.tests_deps:
      return tests_deps;
    case types.result:
      return artifactsDir;
    case types.regression_contracts:
      return regression_contracts;
    case types.regression_tests:
      return regression_tests;
  }
}

const types = {
  baseline: 0,
  contracts_checksums: 1,
  tests_checksums: 2,
  operators_checksums: 11,
  contracts_changed: 3,
  tests_changed: 4,
  contracts_deps: 5,
  tests_deps: 6,
  all_dependencies: 10,
  result: 8,
  regression_tests: 9,
  regression_contracts: 12
};

function existsContractsChecksums() {
  return fs.existsSync(contracts_checksums);
}

function loadContractsChecksums() {
  return require(path.resolve(contracts_checksums));
}

function existsTestsChecksums() {
  return fs.existsSync(tests_checksums);
}

function loadTestsChecksums() {
  return require(path.resolve(tests_checksums));
}

function existsMutationOperators() {
  return fs.existsSync(operators_checksums);
}

function loadMutationOperators() {
  return require(path.resolve(operators_checksums));
}

function loadPreviousMatrixFile() {
  return fs.readFileSync(config.previousMatrixPath);
}

function loadCurrentMatrixFile() {
  return fs.readFileSync(config.currentMatrixPath);
}


module.exports = {
  createAmbient: createAmbient,
  loadContractsDir: loadContractsDir,
  loadContractsDirGlob: loadContractsDirGlob,
  loadTestsDir: loadTestsDir,
  loadTestsDirGlob: loadTestsDirGlob,
  loadPreviousMatrixFile: loadPreviousMatrixFile,
  loadCurrentMatrixFile: loadCurrentMatrixFile,
  existsContractsChecksums: existsContractsChecksums,
  loadContractsChecksums: loadContractsChecksums,
  existsTestsChecksums: existsTestsChecksums,
  loadTestsChecksums: loadTestsChecksums,
  existsMutationOperators: existsMutationOperators,
  loadMutationOperators: loadMutationOperators,
  types: types,
  writeFile: writeFile,
};
