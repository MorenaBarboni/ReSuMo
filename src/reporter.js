const chalk = require('chalk')
const fs = require('fs')
const { parse } = require("path");
const { sumoDir } = require('./config')
const config = require('./config')
var excel = require('excel4node');
const liveDir = config.liveDir
const killedDir = config.killedDir
const path = require('path');
function Reporter() {
  this.mutations = [];
  this.survived = [];
  this.killed = [];
  this.stillborn = [];
  this.equivalent = [];
  this.redundant = [];
  this.timedout = [];
}

Reporter.prototype._formatMutant = function(mutant) {
  return chalk.green(mutant.hash());
};

Reporter.prototype.beginTest = function(mutant) {

  console.log("Mutant successfully compiled.");

  const hash = mutant.hash();

  console.log("Applying mutation " + hash + " to " + mutant.file);
  process.stdout.write(mutant.diff());
  console.log("\n " + chalk.yellow("Running tests ") + "for mutation " + hash);
};

Reporter.prototype.beginCompile = function(mutant) {
  const hash = mutant.hash();
  console.log("\n " + chalk.yellow("Compiling mutation ") + hash + " of " + mutant.file);
};

//Set the status of a mutant
Reporter.prototype.mutantStatus = function (mutant) {
  switch (mutant.status) {
    case "killed":
      this.killed.push(mutant);
      console.log("Mutant " + this._formatMutant(mutant) + " was killed by tests.");
      fs.writeFileSync(killedDir + "/mutant-" + mutant.hash() + ".sol", mutant.printMutation(), function(err) {
        if (err) return console.log(err);
      });
      break;
    case "live":
      this.survived.push(mutant);
      console.log("Mutant " + this._formatMutant(mutant) + " survived testing.");
      fs.writeFileSync(liveDir + "/mutant-" + mutant.hash() + ".sol", mutant.printMutation(), function(err) {
        if (err) return console.log(err);
      });
      break;
    case "stillborn":
      this.stillborn.push(mutant);
      console.log("Mutant " + this._formatMutant(mutant) + " is stillborn.");
      break;
    case "equivalent":
      this.equivalent.push(mutant);
      console.log(
        "Mutant " + this._formatMutant(mutant) + " is equivalent."
      );
      break;
    case "timedout":
      this.timedout.push(mutant);
      console.log(
        "Mutant " + this._formatMutant(mutant) + " has timed out."
      );
      break;
    case "redundant":
      this.redundant.push(mutant);
      console.log(
        "Mutant " + this._formatMutant(mutant) + " is redundant."
      );
      break;
  }
};

//Prints preflight summary to console
Reporter.prototype.preflightSummary = function(mutations) {
  console.log("----------------------");
  console.log(" " + mutations.length + " mutation(s) found. ");
  console.log("----------------------");

  for (const mutation of mutations) {
    console.log(mutation.file + ":" + mutation.hash() + ":");
    process.stdout.write(mutation.diff());
  }
};

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
  for(var i = 0; i < mutations.length; i ++){

    worksheet.cell(i+2, 1)
      .string(mutations[i].operator)
      .style(style);

    worksheet.cell(i+2, 2)
      .string(mutations[i].hash())
      .style(style);

    worksheet.cell(i+2, 3)
      .string(mutations[i].file)
      .style(style);

    worksheet.cell(i+2, 4)
      .number(mutations[i].start)
      .style(style);

    worksheet.cell(i+2, 5)
      .number(mutations[i].end)
      .style(style);

    worksheet.cell(i+2, 6)
      .string(mutations[i].replace)
      .style(style);

    workbook.write('./.sumo/GeneratedMutations.xlsx');
  }

}


//Prints test summary to console
Reporter.prototype.testSummary = function () {
  console.log('\n--- Summary ---')
  console.log(
    " " + this.survived.length +
    " mutants survived testing.\n " +
    this.killed.length +
    " mutants killed.\n " +
    this.stillborn.length +
    " mutants stillborn.\n " +
    this.equivalent.length +
    " mutants equivalent.\n",
    this.redundant.length +
    " mutants redundant.\n",
    this.timedout.length +
    " mutants timed-out.\n"
  );
  if (this.survived.length > 0) {
    console.log(
      "Live: " + this.survived.map(m => this._formatMutant(m)).join(", ")
    );
  }
};

//Setup test report
Reporter.prototype.setupReport = function(mutationsLength, generationTime) {
  fs.writeFileSync(".sumo/report.txt", "################################################ REPORT ################################################\n\n------------------------------------------- GENERATED MUTANTS ------------------------------------------ \n", function(err) {
    if (err) return console.log(err);
  });
};

//Save generated mutations to report
Reporter.prototype.saveGeneratedMutants = function(fileString, mutantString) {

  fs.appendFileSync(".sumo/report.txt", fileString + mutantString, { "flags": "a" }, function(err) {
    if (err) return console.log(err);
  });
};

//Save mutants generation time to report
Reporter.prototype.saveGenerationTime = function(mutationsLength, generationTime) {
  fs.appendFileSync(".sumo/report.txt", "\n" + mutationsLength + " mutant(s) found in " + generationTime + " seconds. \n", function(err) {
    if (err) return console.log(err);
  });
};

//Save test results to report
Reporter.prototype.printTestReport = function(time) {
  const validMutants = this.survived.length + this.killed.length;
  const stillbornMutants = this.stillborn.length;
  const equivalentMutants = this.equivalent.length;
  const redundantMutants = this.redundant.length;
  const timedoutMutants = this.timedout.length;
  const totalMutants = validMutants + stillbornMutants + timedoutMutants + equivalentMutants + redundantMutants;
  const mutationScore = ((this.killed.length / validMutants) * 100).toFixed(2);
  var printString = "\n ---------------------- TEST REPORT --------------------- \n\n  "
    + totalMutants + " mutant(s) tested in " + time + " minutes."
    + "\n\n - Total mutants: " + totalMutants
    + "\n\n - Valid mutants: " + validMutants;


  printString = printString + "\n\n - Live mutants: " + this.survived.length;
  if (this.survived.length > 0)
    printString = printString + "\n --- Live: " + JSON.stringify(this.survived.map(m => m.hash()).join(", "));

  printString = printString + "\n\n - Killed mutants: " + this.killed.length;
  if (this.killed.length > 0)
    printString = printString + "\n --- Killed: " + JSON.stringify(this.killed.map(m => m.hash()).join(", "));

  printString = printString + "\n\n - Equivalent mutants: " + this.equivalent.length;
  if (this.equivalent.length > 0)
    printString = printString + "\n --- Equivalent: " + JSON.stringify(this.equivalent.map(m => m.hash()).join(", "));

  printString = printString + "\n\n - Redundant mutants: " + this.redundant.length;
  if (this.redundant.length > 0)
    printString = printString + "\n --- Redundant: " + JSON.stringify(this.redundant.map(m => m.hash()).join(", "));

  printString = printString + "\n\n - Stillborn mutants: " + this.stillborn.length;
  if (this.stillborn.length > 0)
    printString = printString + "\n --- Stillborn: " + JSON.stringify(this.stillborn.map(m => m.hash()).join(", "));

  printString = printString + "\n\n - Timed-Out mutants: " + this.timedout.length;
  if (this.timedout.length > 0)
    printString = printString + "\n --- Timed-Out: " + JSON.stringify(this.timedout.map(m => m.hash()).join(", "));

  printString = printString + "\n\n Mutation Score = " + mutationScore;

  fs.appendFileSync(".sumo/report.txt", printString, { "flags": "a" }, function(err) {
    if (err) return console.log(err);
  });
};

Reporter.prototype.setupMutationsReport = function() {
  fs.writeFileSync(sumoDir + "/mutations.json", "", "utf8", function(err) {
    if (err) {
      return console.log(err);
    }
  });
};

Reporter.prototype.saveTestData=function () {
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
    }});
  var stylePassed = workbook.createStyle({
    font: {
      color: "#000000",
      size: 12
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      bgColor:"#67cc5d",
      fgColor: "#67cc5d"
    },
    border:{
      top:{style:'thin'},
      bottom:{style:'thin'},
      left:{style:'thin'},
      right:{style:'thin'},
    }
  });
  var styleFailed = workbook.createStyle({
    font: {
      color: "#000000",
      size: 12,
      bold:true
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      bgColor:"#e73748",
      fgColor: "#e73748"
    },
    border:{
      top:{style:'thin'},
      bottom:{style:'thin'},
      left:{style:'thin'},
      right:{style:'thin'},
    }
  });
  var styleNull = workbook.createStyle({
    font: {
      color: "#000000",
      size: 12,
      bold:true
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      bgColor:"#8d45ad",
      fgColor: "#8d45ad"
    },
    border:{
      top:{style:'thin'},
      bottom:{style:'thin'},
      left:{style:'thin'},
      right:{style:'thin'},
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
  const mochaDir=sumoDir+'/mochawesome-report/'
  const mutationsJsonDir=sumoDir+'/mutations.json'
  const dirPath=path.join(mochaDir)
  let mochaDirItems= fs.readdirSync(dirPath);
  var columnCounter=0
  let counter=5
  //Structure
  let item=mochaDirItems[0]
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
    if (suite.length===0 ) {
      for(let j=0;j<mochaMutant.suites[i].tests.length;j++){
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
  for(let item of mochaDirItems){
    var count2=0
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
      }}
    let mochaFile = fs.readFileSync(mochaDir + item)
    let json = JSON.parse(mochaFile)
    let mochaMutant = json.results[0]
    for(let i=0;i<mochaMutant.suites.length;i++) {
      let testSuite = mochaMutant.suites[i]
      if (testSuite.suites.length === 0) {
        for (let j = 0; j<testSuite.tests.length; j++) {
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
  workbook.write("./.sumo/testData.xlsx");
}



//Extracts test information from mochawesome reports and adds them to the mutation object
Reporter.prototype.extractMochawesomeReportInfo = function (mutation) {

  let hash = mutation.hash();

  //Rename report file
  let pathJson = sumoDir + '/mochawesome-report/mochawesome.json';
  let pathHtml = sumoDir + '/mochawesome-report/mochawesome.html';

  if (mutation.status !== 'timedout') {

    if (fs.existsSync(pathJson)) {
      fs.renameSync(pathJson, sumoDir + '/mochawesome-report/mochawesome-' + hash + '.json', function (err) {
        if (err) console.log('ERROR: ' + err);
      });

      if (fs.existsSync(pathHtml)) {
        fs.renameSync(pathHtml, sumoDir + '/mochawesome-report/mochawesome-' + hash + '.html', function (err) {
          if (err) console.log('ERROR: ' + err);
        });
      }

      //Extract test info
      let path = sumoDir + '/mochawesome-report/mochawesome-' + hash + '.json'
      let rawdata = fs.readFileSync(path);
      let json = JSON.parse(rawdata);
      var check=false
      let testFiles = json.results[0].suites;
      let killers = [];
      let nonKillers = [];
      for (let suite of testFiles) {
        let testFileInfo = []
        testFileInfo.push(suite.file)
        if (suite.suites.length === 0) {
          if (suite.failures.length > 0) {
            check = true
          } else {
            check = false
          }
        }
        else {
          for (let subSuite of suite.suites) {
            if (subSuite.failures.length > 0) {
              check = true
              break;
            } else {
              check = false
            }
          }
        }
        if(check){
          killers.push(testFileInfo[0])
        }
        else{
          nonKillers.push(testFileInfo[0])
        }
      }

      mutation.killers = killers
      mutation.nonKillers = nonKillers

      mutationObj = new Object()
      mutationObj.hash = mutation.hash()
      mutationObj.operator = mutation.operator
      mutationObj.status = mutation.status
      mutationObj.file = mutation.file
      mutationObj.killers = mutation.killers
      mutationObj.nonKillers = mutation.nonKillers
      this.mutations.push(mutationObj)
    } else {
      console.log('ERROR: Could not access ' +sumoDir + '/mochawesome-report/mochawesome-' + hash + '.json' );
    }
  } else {
    mutationObj = new Object()
    mutationObj.hash = mutation.hash()
    mutationObj.operator = mutation.operator
    mutationObj.status = mutation.status
    mutationObj.file = mutation.file
    mutationObj.killers = []
    mutationObj.nonKillers = []
  }

}

//Saves the mutation to .sumo/mutations.json
Reporter.prototype.saveMochawesomeReportInfo = function() {

  let jsonData = JSON.stringify(this.mutations, null, 1);

  fs.appendFileSync(sumoDir + "/mutations.json", jsonData, "utf8", function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("Done.");
  });

};
Reporter.prototype.restore = function() {
  this.mutations = [];
  this.survived = [];
  this.killed = [];
  this.stillborn = [];
  this.equivalent = [];
  this.redundant = [];
  this.timedout = [];
};
Reporter.prototype.getMutants = function(){
  return this.mutations
}




module.exports = Reporter
