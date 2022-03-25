const fs = require("fs");
const fileSys = require("./utils/fileSys");
const path = require("path");
const checksum = require("checksum");

function checkContracts(contracts) {
  var oldChecksumsExists = fileSys.existsContractsChecksums();
  var oldFilesChecksums;
  if (oldChecksumsExists) oldFilesChecksums = fileSys.loadContractsChecksums();

  var newFilesChecksums = [];
  contracts.forEach((contract) => {
    var current = {
      filePath: contract.path,
      fileName: contract.name,
      checksum: checksum(contract.content),
      lastChecksum: null
    };
    if (oldChecksumsExists) {
      var old = oldFilesChecksums.find(
        ({ filePath }) => filePath === contract.path
      );
      if (old !== undefined)
        current.lastChecksum = old.checksum;
    }
    newFilesChecksums.push(current);
  });

  fileSys.writeFile(fileSys.types.contracts_checksums, newFilesChecksums);

  var changedFiles_paths = [];
  newFilesChecksums.forEach((element) => {
    if (element.checksum !== element.lastChecksum)
      changedFiles_paths.push(element.filePath);
  });
  //if (changedFiles_paths.length == 0) changedFiles_paths.push("none");

  //fileSys.writeFile(fileSys.types.contracts_changed, changedFiles_paths);

  return changedFiles_paths;
}

function checkTests(tests) {
  var oldChecksumsExists = fileSys.existsTestsChecksums();
  var oldFilesChecksums;
  if (oldChecksumsExists) oldFilesChecksums = fileSys.loadTestsChecksums();
  var newFilesChecksums = [];
  tests.forEach((test) => {
    var current = {
      fileName: test.name,
      filePath: test.path,
      checksum: checksum(test.content),
      lastChecksum: null
    };
    if (oldChecksumsExists) {
      var old = oldFilesChecksums.find(
        ({ filePath }) => filePath === test.path
      );
      if (old !== undefined) current.lastChecksum = old.checksum;
    }
    newFilesChecksums.push(current);
  });

  fileSys.writeFile(fileSys.types.tests_checksums, newFilesChecksums);

  var changedFiles_paths = [];
  newFilesChecksums.forEach((element) => {
    if (element.checksum !== element.lastChecksum)
      changedFiles_paths.push(element.filePath);
  });
  //if (changedFiles_paths.length == 0) changedFiles_paths.push("none");

  //fileSys.writeFile(fileSys.types.tests_changed, changedFiles_paths);

  return changedFiles_paths;
}

function mutationOperatorsChanged(newOperators) {
  var oldOperatorsExists = fileSys.existsMutationOperators();
  var oldOperators;
  var bool = true;
  if (oldOperatorsExists) {
    oldOperators = fileSys.loadMutationOperators();
    bool = false;
    Object.keys(oldOperators).forEach(function(k) {
      if (oldOperators[k] !== newOperators[k]) bool = true;
    });
  }

  fileSys.writeFile(fileSys.types.operators_checksums, newOperators);

  return bool;
}

module.exports = {
  checkContracts: checkContracts,
  checkTests: checkTests,
  mutationOperatorsChanged: mutationOperatorsChanged
};
