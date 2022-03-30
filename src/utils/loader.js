const path = require("path");
const fs = require("fs");
const glob = require("glob");
const fileSys = require("./fileSys");
const sol_parser = require("@solidity-parser/parser");
const ts = require('typescript');
const config = require("../config");
const { factory } = require("typescript");

function loadTests() {
  fileSys.copyTestsToBaseline();

  if (!fs.existsSync(fileSys.loadTestsDir)) {
    console.log("Tests directory does not exits!");
    process.exit(0);
  }

  const paths = glob.sync(fileSys.loadTestsDirGlob);

  if (paths.length == 0) {
    console.log("Tests directory is empty!");
    process.exit(0);
  }

  var tests = new Array();
  paths.forEach((test) => {
    const content = fs.readFileSync(test);

    var artifacts = new Array(); //used_contracts
    var requires = new Array(); //used_tests

    if (test.endsWith(".js")) {
      var ast = acorn.parse(content.toString(), {
        ecmaVersion: 2020,
      });
      ast.body.forEach((node) => {
        if (node.type == "VariableDeclaration") {
          if (
            node.declarations.length > 0 &&
            node.declarations[0] != undefined &&
            node.declarations[0].init != undefined &&
            node.declarations[0].init.arguments != undefined &&
            node.declarations[0].init.arguments.length > 0 &&
            node.declarations[0].init.arguments[0].value != undefined &&
            node.declarations[0].init.callee != undefined &&
            node.declarations[0].init.callee.object != undefined &&
            node.declarations[0].init.callee.property != undefined &&
            node.declarations[0].init.callee.object.name == "artifacts" &&
            node.declarations[0].init.callee.property.name == "require"
          ) {
            artifacts.push(node.declarations[0].init.arguments[0].value);

          } else if (
            node.declarations.length > 0 &&
            node.declarations[0] != undefined &&
            node.declarations[0].init != undefined &&
            node.declarations[0].init.arguments != undefined &&
            node.declarations[0].init.arguments.length > 0 &&
            node.declarations[0].init.arguments[0].value != undefined &&
            node.declarations[0].init.callee != undefined &&
            node.declarations[0].init.callee.name != undefined &&
            node.declarations[0].init.callee.name == "require"
          ) {
            requires.push(node.declarations[0].init.arguments[0].value);
          }
        } else if (node.type == "ExpressionStatement") {
          if (
            node.expression != undefined &&
            node.expression.callee != undefined &&
            node.expression.callee.name != undefined &&
            node.expression.callee.name == "require" &&
            node.expression.arguments != undefined &&
            node.expression.arguments.length > 0 &&
            node.expression.arguments[0].value != undefined
          )
            requires.push(node.expression.arguments[0].value);
        }
      });
    } else if (test.endsWith(".py")) {
      var lines = content.toString().split(/(?:\r\n|\r|\n)/g);
      lines.forEach((l) => {
        if (l.includes(".sol")) artifacts.push(l.split("'", 2)[1]);
      });
    } else if (test.endsWith(".ts")) {
      //this is an ad-hoc solution for the Safe-Contracts project
      const node = ts.createSourceFile(
        test,   // fileName
        fs.readFileSync(test, 'utf8'), // sourceText
        ts.ScriptTarget.Latest // langugeVersion
      );

      var importDecl;

      node.forEachChild(child => {
        if (ts.SyntaxKind[child.kind] === 'ImportDeclaration') {
          importDecl = child;
        }

       if (importDecl && importDecl.moduleSpecifier && importDecl.moduleSpecifier.text && importDecl.moduleSpecifier.text.includes('/utils/setup')) {
        
          if (importDecl.importClause && importDecl.importClause.namedBindings && importDecl.importClause.namedBindings.elements) {
         
            let importedElements = importDecl.importClause.namedBindings.elements.map(
              el => el.name.escapedText
            )
            console.log(importedElements)

            if (importedElements.includes("getFactory")) {
              artifacts.push("GnosisSafeProxyFactory.sol");
            }
            if (importedElements.includes("getMock")) {
              artifacts.push("MockContract.sol");
            }
            if (importedElements.includes("getSimulateTxAccessor")) {
              artifacts.push("SimulateTxAccessor.sol");
            }
            if (importedElements.includes("getMultiSend")) {
              artifacts.push("MultiSend.sol");
            }
            if (importedElements.includes("getMultiSendCallOnly")) {
              artifacts.push("MultiSendCallOnly.sol");
            }
            if (importedElements.includes("defaultCallbackHandlerDeployment") || importedElements.includes("defaultCallbackHandlerContract")) {
              artifacts.push("DefaultCallbackHandler.sol");
            }
            if (importedElements.includes("compatFallbackHandlerDeployment") ||
              importedElements.includes("compatFallbackHandlerContract") ||
              importedElements.includes("getDefaultCallbackHandler") ||
              importedElements.includes("getCompatFallbackHandler")
            ) {
              artifacts.push("CompatibilityFallbackHandler.sol");
            }
            if (importedElements.includes("getSafeSingleton")) {
              artifacts.push("GnosisSafe.sol");
            }
            if (importedElements.includes("getCreateCall")) {
              artifacts.push("CreateCall.sol");
            }
            if (importedElements.includes("getSafeTemplate") || importedElements.includes("getSafeWithOwners")) {
              artifacts.push("GnosisSafe.sol");
              artifacts.push("GnosisSafeProxyFactory.sol");
            }

            console.log("Which are contracts: " +artifacts)

          }
        }
      }
      );
    }


    else if (test.endsWith(".sol")) {
      const content = fs.readFileSync(test);

      var ast = sol_parser.parse(content.toString());
      sol_parser.visit(ast, {
        ImportDirective: function (node) {

          //used contract is a test
          if (node.path.includes(path.basename(config.testsDir))) {
            requires.push(path.basename(node.path).split('.sol')[0]);
          }
          //used contract is a contract under test
          else if (node.path.includes(path.basename(config.contractsDir))) {
            artifacts.push(path.basename(node.path).split('.sol')[0]);
          }
        },
      });
    }

    tests.push({
      path: test,
      name: path.parse(test).base,
      content: content,
      used_tests: requires,
      used_contracts: artifacts,
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

  if (paths.length == 0) {
    console.log("Contracts directory is empty!");
    process.exit(0);
  }

  var contracts = new Array();
  paths.forEach((contract) => {
    const content = fs.readFileSync(contract);

    var imports = new Array(); //used_contracts
    var ast = sol_parser.parse(content.toString());
    sol_parser.visit(ast, {
      ImportDirective: function (node) {
        imports.push(node.path);
      },
    });

    contracts.push({
      path: contract,
      name: path.parse(contract).base,
      content: content,
      used_contracts: imports,
    });
  });
  return contracts;
}

function loadMutationOperators() {
  fileSys.copyMutationOpertatorsToBaseline();

  const ops = require(fileSys.loadMutationOperatorsFile);

  return ops;
}

function loadMatrixJsonFromFile(matrix) {
  var lines = matrix.toString().split(/(?:\r\n|\r|\n)/g);

  var mutantLines = [];
  lines.forEach((line) => {
    if (line.length > 0) {
      const contract_mutant_killers_saviors = line.split(":", 4);
      const contract = contract_mutant_killers_saviors[0];
      const mutant = contract_mutant_killers_saviors[1];
      const killers = contract_mutant_killers_saviors[2];
      const saviors = contract_mutant_killers_saviors[3];
      var killers_array = killers.split(",");
      if (killers_array[0] == "") killers_array = [];
      var saviors_array = saviors.split(",");
      if (saviors_array[0] == "") saviors_array = [];
      const mutantLine = {
        contract: contract,
        mutant: mutant,
        killers: killers_array,
        saviors: saviors_array,
      };

      mutantLines.push(mutantLine);
    }
  });

  return mutantLines;
}

function loadPreviousMatrixJson() {
  return loadMatrixJsonFromFile(fileSys.loadPreviousMatrixFile());
}

function loadCurrentMatrixJson() {
  return loadMatrixJsonFromFile(fileSys.loadCurrentMatrixFile());
}

function loadFinalMatrix() {
  return loadMatrixJsonFromFile(
    fs.readFileSync(require("../config").finalMatrixPath)
  );
}

module.exports = {
  loadTests: loadTests,
  loadContracts: loadContracts,
  loadMutationOperators: loadMutationOperators,
  loadPreviousMatrixJson: loadPreviousMatrixJson,
  loadCurrentMatrixJson: loadCurrentMatrixJson,
  loadFinalMatrix: loadFinalMatrix,
};