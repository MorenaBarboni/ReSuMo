const fs = require("fs");
const config = require("../../config");
const mutationJson = config.artifactsDir + "/mutations.json";
var map = new Map();
var columnName = [];
var testName = [];

/**
 *The <b>readJSON()</b> function parses a JSON file
 * @param {string} inputPath The path of the JSON file
 * @returns Parsed data values
 */
function readJSON(inputPath) {
  const data = fs.readFileSync(inputPath, "utf-8");
  return JSON.parse(data);
}

/**
 * The <b>populateMap()</b> function reads a JSON files and writes it on a Map.
 * The hash is used as a <b>key</b> and an array made by contract name, operator and all test results is used as a <b>value</b>
 */
 function populateMap() {
  if (fs.existsSync(mutationJson)) {
    
    columnName.push("hash");
    columnName.push("contract");
    columnName.push("operator");

    var testFiles = []; 

    //get unique test file names
    readJSON(mutationJson).map(mutation => {
      let killersNonKillers = mutation.killers.concat(mutation.nonKillers);
      testFiles = testFiles.concat(killersNonKillers.filter((item) => testFiles.indexOf(item) < 0));     
    });

    testFiles.forEach(testFile => {
      columnName.push(testFile);      
    });

    for (var id of readJSON(mutationJson).map(id => id.id)) {

      var row = [];
      readJSON(mutationJson).map(mutation => {
        if (mutation.id === id) {
          row.push(mutation.file.substring(mutation.file.lastIndexOf("/") + 1));
          row.push(mutation.operator);
        }
      });

      testFiles.forEach(item => {
        testName.push(item);
        var res = findTestRes(item, id);
        res.map(item => {
          if (item !== undefined) {
            row.push(item);
          }
        });
      });    
      map.set(id, row);
    }
  } else {
    console.log("- " + config.artifactsDir +"/mochawesome-report was not generated.")
  }
}

/**
 * The <b>findTestRes</b> function finds if a test killed a certain mutant or not
 * @param testName The name of the test
 * @param hash Is used to identify the mutant under test
 * @returns {K,L} *K* if the mutant has been killed,*L* if the mutant survived the test, *?* if the mutant has not been tested
 */
function findTestRes(testName, hash) {
  return readJSON(mutationJson).map(item => {
    var arrKillers = [];
    var arrNonKillers = [];
    for (let i = 0; i < item.killers.length; i++) {
      arrKillers.push(item.killers[i]);
    }
    for (let i = 0; i < item.nonKillers.length; i++) {
      arrNonKillers.push(item.nonKillers[i]);
    }
    if (item.id === hash) {
      if (arrKillers.includes(testName)) {
        return "K";
      } else if (arrNonKillers.includes(testName)) {
        return "L";
      } else
        return "?";
    }
  });
}

/**
 * The <b>toCsv()</b> function provides to collect test results and save them into a csv file
 */
function toCSV() {
  map.clear()
  columnName = []
  testName = []
  //console.log("Writing report to .resume/report.csv")
  populateMap();
  const headers = columnName
    .join(",");
  const record = Array.from(map.entries()).map(arr => arr.join(","));
  const csv = [
    headers,
    ...record
  ].join("\n");

  fs.writeFileSync(config.resultsDir+"/report.csv", csv);
}

module.exports = {
  csv: toCSV
};

