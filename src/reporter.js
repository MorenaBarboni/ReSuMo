const fs = require('fs')
const path = require('path');
const chalk = require('chalk')
const { parse } = require("path");
const config = require('./config')
const operatorsConfigFileName = "./operators.config.json";
const operatorsConfig = require(operatorsConfigFileName);
var excel = require('excel4node');
const resultsDir = config.resultsDir
const artifactsDir = config.artifactsDir
const glob = require("glob");
const Mutation = require('./mutation');


function Reporter() {
  this.operators = Object.entries(operatorsConfig);
  this.survived = [];
  this.killed = [];
  this.stillborn = [];
  this.equivalent = [];
  this.redundant = [];
  this.timedout = [];
}

Reporter.prototype.chalkMutant = function (mutant) {
  return chalk.rgb(186, 85, 211)(mutant.hash());
};

Reporter.prototype.logPretest = function () {
  console.log(chalk.yellow.bold("> Running pre-test 🔎"));
};

Reporter.prototype.logStartMutationTesting = function () {
  console.log(chalk.yellow.bold("> Starting Mutation Testing 👾"))
};

Reporter.prototype.logTest = function (mutant) {

  console.log("- Mutant successfully compiled. \n");

  console.log(chalk.yellow("> Applying mutation ") + this.chalkMutant(mutant) + " to " + mutant.fileName());
  process.stdout.write(mutant.diff());
  console.log("\n ");
  console.log(chalk.yellow("> Running tests ") + "for mutant " + this.chalkMutant(mutant));
};

Reporter.prototype.logCompile = function (mutant) {
  console.log("\n ");
  console.log(chalk.yellow("> Compiling mutation ") + this.chalkMutant(mutant) + " of " + mutant.fileName());
};

Reporter.prototype.logPreflightSummary = function (mutations, genTime, operators) {

  console.log(chalk.yellow.bold("> Preflight") + " ✈️ \n");

  const preflight = "- " + operators + "\n\n- " + mutations.length + " mutation(s) found in " + genTime + " seconds \n" +
    "- Generated mutations saved to .sumo/results/generated.csv \n";

  fs.appendFileSync(resultsDir + "/report.txt", "\n\n>>> PREFLIGHT SUMMARY \n\n" + preflight, function (err) {
    if (err) return console.log(err);
  });

  console.log(preflight);
};


/**
 * Prints the files under test and saves them to report.txt
 * @param {*} contracts list of contracts to be mutated
 * @param {*} tests list of tests to be run
 */
Reporter.prototype.logSelectedFiles = function (contracts, tests) {
  const nc = contracts.length;
  console.log(chalk.yellow.bold("> Selecting Contract and Test Files \n"))


  if (nc == 0) console.log("Contracts to be mutated : " + chalk.green("none"));
  else {
    console.log("Contracts to be mutated : (" + nc + "):");
    fs.writeFileSync(resultsDir + "/report.txt", ">>> SELECTED FILES \n\n Contracts to be mutated : (" + nc + "):\n", function (err) {
      if (err) return console.log(err);
    });

    contracts.forEach((c) => {
      console.log(
        "\t" + path.parse(c).dir + "/" + chalk.bold(path.basename(c))
      );
      fs.appendFileSync(resultsDir + "/report.txt", "\t" + "- " + path.parse(c).dir + "/" + path.basename(c) + "\n", function (err) {
        if (err) return console.log(err);
      });
    });
  }
  console.log();

  const nt = tests.testFiles.length;
  if (nt == 0) console.log("Tests to be run : " + chalk.green("none"));
  else {
    console.log("Tests to be run : (" + nt + "):");
    fs.appendFileSync(resultsDir + "/report.txt", "Tests to be run : (" + nt + "):\n", function (err) {
      if (err) return console.log(err);
    });

    tests.testFiles.forEach((t) => {
      console.log(
        "\t" + path.parse(t).dir + "/" + chalk.bold(path.basename(t))
      );
      fs.appendFileSync(resultsDir + "/report.txt", "\t" + "- " + path.parse(t).dir + "/" + path.basename(t) + '\n', function (err) {
        if (err) return console.log(err);
      });
    });
  }
  console.log();

  const nu = tests.testUtils.length;
  console.log("Tests utils : (" + nu + "):");
  fs.appendFileSync(resultsDir + "/report.txt", "Tests utils : (" + nu + "):\n", function (err) {
    if (err) return console.log(err);
  });

  tests.testUtils.forEach((t) => {
    console.log(
      "\t" + path.parse(t).dir + "/" + chalk.bold(path.basename(t))
    );
    fs.appendFileSync(resultsDir + "/report.txt", "\t" + "- " + path.parse(t).dir + "/" + path.basename(t) + '\n', function (err) {
      if (err) return console.log(err);
    });
  });

  console.log();
}



/**
 * Prints the files under test and saves them to report.txt
 * @param {*} contracts list of contracts to be mutated
 * @param {*} tests list of tests to be run
 */
Reporter.prototype.logTestsForContract = function (contract, tests) {

  const cName = contract.split("/contracts")[1];
  console.log(chalk.bold(cName) + " must be tested with:");

  fs.appendFileSync(resultsDir + "/report.txt", "\n" + cName + " must be tested with:\n", function (err) {
    if (err) return console.log(err);
  });
  if (tests.testFiles.length > 0) {
    tests.testFiles.forEach((t) => {
      const tName = t.split("/test")[1];

      console.log("\t" + tName);
      fs.appendFileSync(resultsDir + "/report.txt", "    - " + tName + "\n", function (err) {
        if (err) return console.log(err);
      });
    });
    console.log();
  } else {
    console.log("\t None\n");
    fs.appendFileSync(resultsDir + "/report.txt", "    - None \n", function (err) {
      if (err) return console.log(err);
    });
  }
}


/**
 * Saves the status of a mutant and pushes the mutant to respective array
 * @param {*} mutant 
 */
Reporter.prototype.mutantStatus = function (mutant) {
  switch (mutant.status) {
    case "killed":
      this.killed.push(mutant);
      console.log("Mutant " + this.chalkMutant(mutant) + " was killed by tests.");
      fs.writeFileSync(resultsDir + "/killed/" + mutant.fileName() + '-' + mutant.hash() + ".json", mutant.toJson(), function (err) {
        if (err) return console.log(err);
      });
      break;
    case "live":
      this.survived.push(mutant);
      console.log("Mutant " + this.chalkMutant(mutant) + " survived testing.");
      fs.writeFileSync(resultsDir + "/live/" + mutant.fileName() + '-' + mutant.hash() + ".json", mutant.toJson(), function (err) {
        if (err) return console.log(err);
      });
      break;
    case "stillborn":
      this.stillborn.push(mutant);
      console.log("Mutant " + this.chalkMutant(mutant) + " is stillborn.");
      fs.writeFileSync(resultsDir + "/stillborn/" + mutant.fileName() + '-' + mutant.hash() + ".json", mutant.toJson(), function (err) {
        if (err) return console.log(err);
      });
      break;
    case "equivalent":
      this.equivalent.push(mutant);
      console.log(
        "Mutant " + this.chalkMutant(mutant) + " is equivalent."
      );
      fs.writeFileSync(resultsDir + "/equivalent/" + mutant.fileName() + '-' + mutant.hash() + ".json", mutant.toJson(), function (err) {
        if (err) return console.log(err);
      });
      break;
    case "timedout":
      this.timedout.push(mutant);
      console.log(
        "Mutant " + this.chalkMutant(mutant) + " has timed out."
      );
      fs.writeFileSync(resultsDir + "/timedout/" + mutant.fileName() + '-' + mutant.hash() + ".json", mutant.toJson(), function (err) {
        if (err) return console.log(err);
      });
      break;
    case "redundant":
      this.redundant.push(mutant);
      console.log(
        "Mutant " + this.chalkMutant(mutant) + " is redundant."
      );
      fs.writeFileSync(resultsDir + "/redundant/" + mutant.fileName() + '-' + mutant.hash() + ".json", mutant.toJson(), function (err) {
        if (err) return console.log(err);
      });
      break;
  }
};



//Setup results.csv sync log
Reporter.prototype.setupResultsCsv = function () {
  fs.writeFileSync(resultsDir + "/results.csv", "Hash$File$Operator$Start$End$StartLine$EndLine$Original$Replacement$Status$RedundantTo$Time; \n", function (err) {
    if (err) return console.log(err);
  })
}

//
/**
 * Save the test results of the current mutant to the results.csv synchronous log
 * @param {*} mutant mutant object
 * @param {*} hashOfRedundant optional hash of the mutant to which the current mutant is redundant
 */
Reporter.prototype.saveResultsCsv = function (mutant, hashOfRedundant) {

  var originalString = mutant.original;
  originalString = originalString.replace(/[\n\r]/g, '');

  var replaceString = mutant.replace;
  replaceString = replaceString.replace(/[\n\r]/g, '');

  const row = mutant.hash() + '$' + mutant.file + '$' + mutant.operator + '$' + mutant.start + '$' + mutant.end + '$' +
    mutant.startLine + '$' + mutant.endLine + '$' + originalString + '$' + replaceString + '$' + mutant.status + '$' + hashOfRedundant + '$' + mutant.testingTime + '\n';

  fs.appendFileSync(resultsDir + "/results.csv", row, function (err) {
    if (err) return console.log(err);
  })
}


//Save mutations info to excel file
Reporter.prototype.preflightToExcel = function (mutations) {
  var workbook = new excel.Workbook();
  var worksheet = workbook.addWorksheet('Mutations');

  var headerStyle = workbook.createStyle({
    font: {
      color: '#000000',
      size: 12,
      bold: true
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      bgColor: '#e9e2d2',
      fgColor: '#e9e2d2',
    }
  });

  // Set Headers
  worksheet.cell(1, 1)
    .string("Operator")
    .style(headerStyle);

  worksheet.cell(1, 2)
    .string("Hash")
    .style(headerStyle);

  worksheet.cell(1, 3)
    .string("File")
    .style(headerStyle);

  worksheet.cell(1, 4)
    .string("Start Index")
    .style(headerStyle);

  worksheet.cell(1, 5)
    .string("End Index")
    .style(headerStyle); worksheet.cell(1, 2)

  worksheet.cell(1, 6)
    .string("Replacement")
    .style(headerStyle); worksheet.cell(1, 2)

  var style = workbook.createStyle({
    font: {
      color: '#000000',
      size: 10,
    }
  });

  //Retrieve list of mutations
  for (var i = 0; i < mutations.length; i++) {

    worksheet.cell(i + 2, 1)
      .string(mutations[i].operator)
      .style(style);

    worksheet.cell(i + 2, 2)
      .string(mutations[i].hash())
      .style(style);

    worksheet.cell(i + 2, 3)
      .string(mutations[i].file)
      .style(style);

    worksheet.cell(i + 2, 4)
      .number(mutations[i].start)
      .style(style);

    worksheet.cell(i + 2, 5)
      .number(mutations[i].end)
      .style(style);

    worksheet.cell(i + 2, 6)
      .string(mutations[i].replace)
      .style(style);

    workbook.write('./.sumo/results/GeneratedMutations.xlsx');
  }

}

/**
 * Logs the mutants generated by the mutationGenerator to report.txt
 * @param {*} fileString 
 * @param {*} mutantString 
 */
Reporter.prototype.saveGeneratedMutants = function (fileString, mutantString) {
  fs.appendFileSync(resultsDir + "/report.txt", fileString + mutantString, { "flags": "a" }, function (err) {
    if (err) return console.log(err);
  });
};


//Save generated mutations to csv
Reporter.prototype.saveGeneratedMutantsCsv = function (mutations) {

  fs.writeFileSync(resultsDir + "/generated.csv", "Hash$File$Operator$Start$End$StartLine$EndLine$Original$Replacement; \n", function (err) {
    if (err) return console.log(err);
  })

  mutations.forEach(m => {
    var originalString = m.original.toString();
    originalString = originalString.replace(/[\n\r]/g, '');

    var replaceString = m.replace.toString();
    replaceString = replaceString.replace(/[\n\r]/g, '');

    const row = m.hash() + '$' + m.file + '$' + m.operator + '$' + m.start + '$' + m.end + '$' + m.startLine + '$' + m.endLine + '$' + originalString + '$' + replaceString + '\n';

    fs.appendFileSync(resultsDir + "/generated.csv", row, function (err) {
      if (err) return console.log(err);
    })
  });
}

/**
 * Logs the final test summary to console (and to report.txt)
 * @param {*} time the total testing time
 */
Reporter.prototype.logAndSaveTestSummary = function (time) {

  const validMutants = this.survived.length + this.killed.length;
  const stillbornMutants = this.stillborn.length;
  const equivalentMutants = this.equivalent.length;
  const redundantMutants = this.redundant.length;
  const timedoutMutants = this.timedout.length;
  const totalMutants = validMutants + stillbornMutants + timedoutMutants + equivalentMutants + redundantMutants;
  const mutationScore = ((this.killed.length / validMutants) * 100).toFixed(2);

  console.log('\n')
  console.log(chalk.yellow.bold("> Mutation Testing completed in " + time + " minutes. 👋"))
  console.log("- Test Summary saved to .sumo/results/report.txt \n ")
  console.log(
    "ReSuMo generated " + totalMutants + " mutants: \n" +
    "- " + this.survived.length + " mutants survived; \n" +
    "- " + this.killed.length + " mutants killed; \n" +
    "- " + this.stillborn.length + " mutants stillborn; \n" +
    "- " + this.equivalent.length + " mutants equivalent; \n" +
    "- " + this.redundant.length + " mutants redundant; \n" +
    "- " + this.timedout.length + " mutants timed-out; \n"
  );
  if (mutationScore >= 80) {
    console.log(chalk.bold("Mutation Score") + ": " + chalk.bold.green(mutationScore + " %"));
  } else if (mutationScore >= 70 && mutationScore < 80) {
    console.log(chalk.bold("Mutation Score") + ": " + chalk.bold.yellow(mutationScore + " %"));
  } else {
    console.log(chalk.bold("Mutation Score") + ": " + chalk.bold.red(mutationScore + " %"));
  }

  var printString = "\n\n >>> TEST REPORT \n\n  "
    + totalMutants + " mutant(s) tested in " + time + " minutes."
    + "\n\n - Total mutants: " + totalMutants
    + "\n\n - Valid mutants: " + validMutants;


  printString = printString + "\n\n - Live mutants: " + this.survived.length;
  if (this.survived.length > 0)
    printString = printString + "\n --- Live: " + JSON.stringify(this.survived.map(m => m.id).join(", "));

  printString = printString + "\n\n - Killed mutants: " + this.killed.length;
  if (this.killed.length > 0)
    printString = printString + "\n --- Killed: " + JSON.stringify(this.killed.map(m => m.id).join(", "));

  printString = printString + "\n\n - Equivalent mutants: " + this.equivalent.length;
  if (this.equivalent.length > 0)
    printString = printString + "\n --- Equivalent: " + JSON.stringify(this.equivalent.map(m => m.id).join(", "));

  printString = printString + "\n\n - Redundant mutants: " + this.redundant.length;
  if (this.redundant.length > 0)
    printString = printString + "\n --- Redundant: " + JSON.stringify(this.redundant.map(m => m.id).join(", "));

  printString = printString + "\n\n - Stillborn mutants: " + this.stillborn.length;
  if (this.stillborn.length > 0)
    printString = printString + "\n --- Stillborn: " + JSON.stringify(this.stillborn.map(m => m.id).join(", "));

  printString = printString + "\n\n - Timed-Out mutants: " + this.timedout.length;
  if (this.timedout.length > 0)
    printString = printString + "\n --- Timed-Out: " + JSON.stringify(this.timedout.map(m => m.id).join(", "));

  printString = printString + "\n\n Mutation Score = " + mutationScore;

  fs.appendFileSync(resultsDir + "/report.txt", printString, { "flags": "a" }, function (err) {
    if (err) return console.log(err);
  });
};

/**
 * Create the mutations.json artifact
 */
Reporter.prototype.setupMutationsReport = function () {
  fs.writeFileSync(artifactsDir + "/mutations.json", "", "utf8", function (err) {
    if (err) {
      return console.log(err);
    }
  });
};

/**
 * Saves the test results for each operator to operators.xlsx
 */
Reporter.prototype.saveOperatorsResults = function () {

  var workbook = new excel.Workbook
  var worksheet = workbook.addWorksheet("Sheet 1");

  var headerStyle = workbook.createStyle({
    font: {
      color: "#000000",
      size: 12,
      bold: true
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      bgColor: "#e9e2d2",
      fgColor: "#e9e2d2"
    }
  });

  var operatorStyle = workbook.createStyle({
    font: {
      color: "#000000",
      size: 10,
      bold: true
    }
  });

  // Set Headers
  worksheet.cell(1, 1)
    .string("Operator")
    .style(headerStyle);

  worksheet.cell(1, 2)
    .string("Total")
    .style(headerStyle);

  worksheet.cell(1, 3)
    .string("Equivalent")
    .style(headerStyle);

  worksheet.cell(1, 4)
    .string("Redundant")
    .style(headerStyle);

  worksheet.cell(1, 5)
    .string("Valid")
    .style(headerStyle);

  worksheet.cell(1, 6)
    .string("Killed")
    .style(headerStyle);

  worksheet.cell(1, 7)
    .string("Live")
    .style(headerStyle);

  worksheet.cell(1, 8)
    .string("Timedout")
    .style(headerStyle)

  worksheet.cell(1, 9)
    .string("Stillborn")
    .style(headerStyle)

  worksheet.cell(1, 10)
    .string("Mutation Score")
    .style(headerStyle);

  worksheet.cell(1, 11)
    .string("Testing Time")
    .style(headerStyle);
  for (var i = 0; i < this.operators.length; i++) {
    worksheet.cell(i + 2, 1)
      .string(this.operators[i])
      .style(operatorStyle);
  }

  var style = workbook.createStyle({
    font: {
      color: "#000000",
      size: 10
    }
  });

  //Retrieve list of killed mutants for each operator
  var operators = Object.entries(operatorsConfig);
  for (var i = 0; i < operators.length; i++) {
    var time = 0
    var operatorKilled = this.killed.filter(mutant => mutant.operator === operators[i][0]);
    var operatorLive = this.survived.filter(mutant => mutant.operator === operators[i][0]);
    var operatorStillborn = this.stillborn.filter(mutant => mutant.operator === operators[i][0]);
    var operatorEquivalent = this.equivalent.filter(mutant => mutant.operator === operators[i][0]);
    var operatorRedundant = this.redundant.filter(mutant => mutant.operator === operators[i][0]);
    var operatorTimedout = this.timedout.filter(mutant => mutant.operator === operators[i][0]);
    this.killed.filter(mutant => {
      if (mutant.operator === operators[i][0]) {
        time = time + mutant.testingTime
      }
    })
    this.survived.filter(mutant => {
      if (mutant.operator === operators[i][0]) {
        time = time + mutant.testingTime
      }
    })
    worksheet.cell(i + 2, 2)
      .number(operatorKilled.length + operatorLive.length + operatorEquivalent.length + operatorRedundant.length + operatorTimedout.length + operatorStillborn.length)
      .style(style);

    worksheet.cell(i + 2, 3)
      .number(operatorEquivalent.length)
      .style(style);

    worksheet.cell(i + 2, 4)
      .number(operatorRedundant.length)
      .style(style)

    worksheet.cell(i + 2, 5)
      .number(operatorKilled.length + operatorLive.length)
      .style(style);

    worksheet.cell(i + 2, 6)
      .number(operatorKilled.length)
      .style(style);

    worksheet.cell(i + 2, 7)
      .number(operatorLive.length)
      .style(style);

    worksheet.cell(i + 2, 8)
      .number(operatorTimedout.length)
      .style(style);

    worksheet.cell(i + 2, 9)
      .number(operatorStillborn.length)
      .style(style);

    var ms = (operatorKilled.length / (operatorKilled.length + operatorLive.length)) * 100;
    if (!isNaN(ms)) {
      worksheet.cell(i + 2, 10)
        .number(ms)
        .style(style);
    }
    worksheet.cell(i + 2, 11)
      .number(time / 60000)
      .style(style)
    workbook.write("./" + resultsDir + "/operators.xlsx");
  }
};


/**
 *  Saves the test results for each mutant to testData.xlsx
 * (Just for the mutants tested during the considered run)
 */
Reporter.prototype.saveTestData = function () {
  var workbook = new excel.Workbook
  var worksheet = workbook.addWorksheet("Sheet 1");
  var headerStyle = workbook.createStyle({
    font: {
      color: "#000000",
      size: 12,
      bold: false
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      bgColor: "#e9e2d2",
      fgColor: "#e9e2d2"
    }
  });
  var style = workbook.createStyle({
    font: {
      color: "#000000",
      size: 12
    }
  });
  var stylePassed = workbook.createStyle({
    font: {
      color: "#000000",
      size: 12
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      bgColor: "#67cc5d",
      fgColor: "#67cc5d"
    },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    }
  });
  var styleFailed = workbook.createStyle({
    font: {
      color: "#000000",
      size: 12,
      bold: false
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      bgColor: "#e73748",
      fgColor: "#e73748"
    },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    }
  });
  var styleNull = workbook.createStyle({
    font: {
      color: "#000000",
      size: 12,
      bold: true
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      bgColor: "#8d45ad",
      fgColor: "#8d45ad"
    },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    }
  });
  worksheet.cell(4, 1)
    .string("Hash")
    .style(headerStyle);
  worksheet.cell(4, 2)
    .string("Operator")
    .style(headerStyle);
  worksheet.cell(4, 3)
    .string("Contract")
    .style(headerStyle);
  const mochaDir = artifactsDir + '/mochawesome-report/'
  const mutationsJsonDir = artifactsDir + '/mutations.json'
  const dirPath = path.join(mochaDir)
  let mochaDirItems = fs.readdirSync(dirPath);
  var columnCounter = 0
  let counter = 5
  //Structure
  let item = mochaDirItems[0]
  let mochaFile = fs.readFileSync(mochaDir + item)
  let json = JSON.parse(mochaFile)
  let mochaMutant = json.results[0]
  for (let i = 0; i < mochaMutant.suites.length; i++) {
    let suite = mochaMutant.suites[i].suites
    worksheet.cell(1, columnCounter + 4)
      .string(mochaMutant.suites[i].file)
      .style(style)
    worksheet.cell(2, columnCounter + 4)
      .string(mochaMutant.suites[i].title)
      .style(style)
    if (suite.length === 0) {
      for (let j = 0; j < mochaMutant.suites[i].tests.length; j++) {
        worksheet.cell(4, columnCounter + 4)
          .string(mochaMutant.suites[i].tests[j].title)
          .style(style)
        columnCounter++
      }
    }
    else {
      for (let j = 0; j < suite.length; j++) {
        worksheet.cell(3, columnCounter + 4)
          .string(suite[j].title)
          .style(style)
        let testCase = suite[j].tests
        for (let k = 0; k < testCase.length; k++) {
          worksheet.cell(4, columnCounter + 4)
            .string(testCase[k].title)
            .style(style)
          columnCounter++
        }
      }
    }
  }
  for (let item of mochaDirItems) {
    var count2 = 0
    let hash = parse(item).name
    hash = hash.substring(12)
    worksheet.cell(counter, 1)
      .string(hash)
      .style(style)
    let mut = fs.readFileSync(mutationsJsonDir)
    let json2 = JSON.parse(mut)
    for (let elem of json2) {
      if (elem.hash === hash) {
        let contractName = elem.file.substring(elem.file.lastIndexOf("/") + 1)
        worksheet.cell(counter, 2)
          .string(elem.operator)
          .style(style)
        worksheet.cell(counter, 3)
          .string(contractName)
          .style(style)
      }
    }
    let mochaFile = fs.readFileSync(mochaDir + item)
    let json = JSON.parse(mochaFile)
    let mochaMutant = json.results[0]
    for (let i = 0; i < mochaMutant.suites.length; i++) {
      let testSuite = mochaMutant.suites[i]
      if (testSuite.suites.length === 0) {
        for (let j = 0; j < testSuite.tests.length; j++) {
          if (testSuite.tests[j].state === 'passed') {
            worksheet.cell(counter, count2 + 4)
              .string('L')
              .style(stylePassed)
          } else if (testSuite.tests[j].state === 'failed') {
            worksheet.cell(counter, count2 + 4)
              .string('K')
              .style(styleFailed)
          } else
            worksheet.cell(counter, count2 + 4)
              .string('-')
              .style(styleNull)
          count2++
        }
      } else {
        for (let j = 0; j < testSuite.suites.length; j++) {
          let testCase = testSuite.suites[j].tests
          for (let k = 0; k < testCase.length; k++) {
            if (testCase[k].state === 'passed') {
              worksheet.cell(counter, count2 + 4)
                .string('L')
                .style(stylePassed)
            } else if (testCase[k].state === 'failed') {
              worksheet.cell(counter, count2 + 4)
                .string('K')
                .style(styleFailed)
            } else
              worksheet.cell(counter, count2 + 4)
                .string('-')
                .style(styleNull)
            count2++
          }
        }
      }
    }
    counter++
  }
  workbook.write("./" + resultsDir + "/testData.xlsx");
}

/**
 * Extracts the test results from each report in the /mochawesome-report directory and adds them to the mutation object
 * @param {*} mutant a tested mutant (live or killed)
 * @returns the mutant with updated test results and status
 */
Reporter.prototype.getTestResults = function (mutant) {

  let hash = mutant.hash();

  //Rename report file
  let pathJson = artifactsDir + '/mochawesome-report/mochawesome.json';

  if (mutant.status !== 'timedout') {

    if (fs.existsSync(pathJson)) {

      //Renames the mutant report
      fs.renameSync(pathJson, artifactsDir + '/mochawesome-report/mochawesome-' + hash + '.json', function (err) {
        if (err) console.log('- ' + err);
      });

      //Extract current test info from the mochawesome report of the mutant
      let path = artifactsDir + '/mochawesome-report/mochawesome-' + hash + '.json'
      let rawdata = fs.readFileSync(path);
      let json = JSON.parse(rawdata);
      var testFileIsKiller = false
      let testFiles = json.results[0].suites;
      let killers = [];
      let nonKillers = [];
      for (let testFile of testFiles) {
        let testFileInfo = []
        testFileInfo.push(testFile.file)

        //If the test file does not contain test suites, check if it is a killer
        if (testFile.suites.length === 0) {
          if (testFile.failures.length > 0) {
            testFileIsKiller = true
          }
        }
        //If the test file contains test suites
        else {
          for (let suite of testFile.suites) {
            if (!testFileIsKiller) {
              //If the test file does not contain sub-test suites
              if (suite.suites.length === 0) {
                if (suite.failures.length > 0) {
                  testFileIsKiller = true
                  break;
                }
              } else {
                for (let subSuite of suite.suites) {
                  if (subSuite.failures.length > 0) {
                    testFileIsKiller = true
                    break;
                  }
                }
              }
            }
          }
        }
        //Add test file to killers/nonKillers array
        if (testFileIsKiller) {
          killers.push(testFileInfo[0])
        }
        else {
          nonKillers.push(testFileInfo[0])
        }
      }

      mutant.killers = killers
      mutant.nonKillers = nonKillers

      //If there is a results baseline, integrates the previous test results and updates the status
      if (fs.existsSync(artifactsDir + "/mutationsBaseline.json")) {

        let mutationsBaselinePath = artifactsDir + "/mutationsBaseline.json";
        let rawBaselineData = fs.readFileSync(mutationsBaselinePath);
        let mutationsBaselineJson = JSON.parse(rawBaselineData);
        let prevMutant = mutationsBaselineJson.find(element => element.id === mutant.hash())

        if (prevMutant) {
          //console.log("Re-testing mutant:")
          //console.log(prevMutant.id);

          if (prevMutant.killers && prevMutant.killers.length > 0) {
            for (let i = 0; i < prevMutant.killers.length; i++) {
              if (mutant.killers.indexOf(prevMutant.killers[i]) == -1)
                mutant.killers.push(prevMutant.killers[i])
            }
            mutant.status = "killed";
          }
          if (prevMutant.nonKillers && prevMutant.nonKillers.length > 0) {
            for (let i = 0; i < prevMutant.nonKillers.length; i++) {
              if (mutant.nonKillers.indexOf(prevMutant.nonKillers[i]) == -1)
                mutant.nonKillers.push(prevMutant.nonKillers[i])
            }
          }
        }
      }
    } else {
      console.log('ERROR: Could not access ' + artifactsDir + '/mochawesome-report/mochawesome-' + hash + '.json');
    }
  }
  return mutant;
}

/**
 * Retrieves the mutations generated from unchanged contracts from the mutations baseline, and adds them to the current mutation testing results.
 *  */
Reporter.prototype.integrateUnchangedMutants = function (selectedContracts, callback) {
  if (fs.existsSync(artifactsDir + "/mutationsBaseline.json")) {

    let mutationsBaselinePath = artifactsDir + "/mutationsBaseline.json";
    let rawBaselineData = fs.readFileSync(mutationsBaselinePath);
    let mutationsBaselineJson = JSON.parse(rawBaselineData);

    // async 
    glob(config.contractsDir + config.contractsGlob, (err, files) => {
      if (err) throw err;

      files.forEach(file => {
        if (!selectedContracts.includes(file)) {
          const unchangedMutants = mutationsBaselineJson.filter(mutant => mutant.file === file)
          unchangedMutants.forEach(unchangedMutant => {
           // console.log("Pushing old results for mutations:")
            if (unchangedMutant.status === "live") {

              var um = new Mutation(
                unchangedMutant.file,
                unchangedMutant.start,
                unchangedMutant.end,
                unchangedMutant.startLine,
                unchangedMutant.endLine,
                unchangedMutant.original,
                unchangedMutant.replace,
                unchangedMutant.operator,
                unchangedMutant.status,
                unchangedMutant.killers,
                unchangedMutant.nonKillers,
                unchangedMutant.bytecode,
                unchangedMutant.testingTime
              )
              this.survived.push(um)
            }
            else if (unchangedMutant.status === "killed") {
              this.killed.push(unchangedMutant)
            }
          });
        }
      });
      //console.log("> Unchanged mutants integrated.");
      callback();
    })
  } else {
    callback();
  }
}

//Saves the mutations to .sumo/results/mutations.json
Reporter.prototype.saveMutationsJSON = function () {
  console.log("Saving mutations to json:");
  let testedMutants = this.survived.concat(this.killed);

  //remove the bytecode
  testedMutants.forEach(m => {
    m.bytecode = null;
  });

  let jsonData = JSON.stringify(testedMutants, null, 1);
  fs.appendFileSync(artifactsDir + "/mutations.json", jsonData, "utf8", function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("Done.");
  });
};

module.exports = Reporter
