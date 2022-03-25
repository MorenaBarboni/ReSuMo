const path = require("path");
const fs = require("fs");
const glob = require("glob");
const fileSys = require("./fileSys");
const sol_parser = require("@solidity-parser/parser");
const acorn = require("acorn");
const config = require("../config");

function loadTests() {
  fileSys.copyTestsToBaseline();

  if (!fs.existsSync(fileSys.loadTestsDir)) {
    console.log("Tests directory does not exits!");
    process.exit(0);
  }

  const paths = glob.sync(fileSys.loadTestsDirGlob);

  if (paths.length === 0) {
    console.log("Tests directory is empty!");
    process.exit(0);
  }

  var tests = [];
  paths.forEach((test) => {
    const content = fs.readFileSync(test);

    var artifacts = []; //used_contracts
    var requires = []; //used_tests

    if (test.endsWith(".js")||test.endsWith(".ts")) {
      var ast = acorn.parse(content.toString(), {
        ecmaVersion: 2020
      });
      ast.body.forEach((node) => {
        if (node.type === "VariableDeclaration") {
          if (
            node.declarations.length > 0 &&
            (node.declarations[0]!==null && node.declarations[0]!== undefined) &&
            (node.declarations[0].init!==null && node.declarations[0].init !== undefined) &&
            node.declarations[0].init.arguments !== undefined &&
            node.declarations[0].init.arguments.length > 0 &&
            node.declarations[0].init.arguments[0].value !== undefined &&
            node.declarations[0].init.callee !== undefined &&
            node.declarations[0].init.callee.object !== undefined &&
            node.declarations[0].init.callee.property !== undefined &&
            node.declarations[0].init.callee.object.name === "artifacts" &&
            node.declarations[0].init.callee.property.name === "require"
          ) {
            artifacts.push(node.declarations[0].init.arguments[0].value);

          } else if (
            node.declarations.length > 0 &&
            (node.declarations[0]!==null && node.declarations[0]!== undefined) &&
            (node.declarations[0].init!==null && node.declarations[0].init !== undefined) &&
            node.declarations[0].init.arguments !== undefined &&
            node.declarations[0].init.arguments.length > 0 &&
            node.declarations[0].init.arguments[0].value !== undefined &&
            node.declarations[0].init.callee !== undefined &&
            node.declarations[0].init.callee.name !== undefined &&
            node.declarations[0].init.callee.name === "require"
          ) {
            requires.push(node.declarations[0].init.arguments[0].value);
          }
        } else if (node.type === "ExpressionStatement") {
          if (
            node.expression !== undefined &&
            node.expression.callee !== undefined &&
            node.expression.callee.name !== undefined &&
            node.expression.callee.name === "require" &&
            node.expression.arguments !== undefined &&
            node.expression.arguments.length > 0 &&
            node.expression.arguments[0].value !== undefined
          )
            requires.push(node.expression.arguments[0].value);
        }
      });
    } else if (test.endsWith(".py")) {
      var lines = content.toString().split(/(?:\r\n|\r|\n)/g);
      lines.forEach((l) => {
        if (l.includes(".sol")) artifacts.push(l.split("'", 2)[1]);
      });
    } else if (test.endsWith(".sol")) {
      const content = fs.readFileSync(test);

      var ast = sol_parser.parse(content.toString());
      sol_parser.visit(ast, {
        ImportDirective: function(node) {

          //used contract is a test
          if (node.path.includes(path.basename(config.testDir))) {
            requires.push(path.basename(node.path).split(".sol")[0]);
          }
          //used contract is a contract under test
          else if (node.path.includes(path.basename(config.contractsDir))) {
            artifacts.push(path.basename(node.path).split(".sol")[0]);
          }
        }
      });
    }

    tests.push({
      path: test,
      name: path.parse(test).base,
      content: content,
      used_tests: requires,
      used_contracts: artifacts
    });
  });

  return tests;
}

function loadContracts() {
  fileSys.copyContractsToBaseline();

  if (!fs.existsSync(fileSys.loadContractsDir)) {
    console.log("Contracts directory does not exits!");
    process.exit(0);
  }

  const paths = glob.sync(fileSys.loadContractsDirGlob);

  if (paths.length === 0) {
    console.log("Contracts directory is empty!");
    process.exit(0);
  }

  var contracts = [];
  paths.forEach((contract) => {
    const content = fs.readFileSync(contract);

    var imports = []; //used_contracts
    var ast = sol_parser.parse(content.toString());
    sol_parser.visit(ast, {
      ImportDirective: function(node) {
        imports.push(node.path);
      }
    });

    contracts.push({
      path: contract,
      name: path.parse(contract).base,
      content: content,
      used_contracts: imports
    });
  });
  return contracts;
}

function loadMutationOperators() {
  fileSys.copyMutationOpertatorsToBaseline();

  const ops = require(fileSys.loadMutationOperatorsFile);

  return ops;
}


module.exports = {
  loadTests: loadTests,
  loadContracts: loadContracts,
  loadMutationOperators: loadMutationOperators

};
