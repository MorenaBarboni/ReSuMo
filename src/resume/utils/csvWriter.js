const fs = require("fs");
const config = require("../../config");
const csvReader = require("./csvReader");
const mutationJson = config.absoluteResultsDir + "/mutations.json";
const mochawesomeDir = config.absoluteResultsDir + "/mochawesome-report/";
const mochaJson = config.absoluteResultsDir + "/mochawesome-report/mochawesome-";
var map = new Map();
var columnName = [];
var testName = [];

/**
 *The <b>readJSON()</b> function provides to read data from a JSON file and return data values parsed
 * @param {string} inputPath The path of the JSON file
 * @returns Parsed data values
 */
function readJSON(inputPath) {
  const data = fs.readFileSync(inputPath, "utf-8");
  return JSON.parse(data);
}

/**
 * The <b>populateMap()</b> function provides to read data from JSON files and write them on a Map.
 * The hash is used as a <b>key</b> and an array made by contract name, operator and all test results is used as a <b>value</b>
 */
function populateMap() {
  if (fs.existsSync(mochawesomeDir)) {
    const numberSuite = readJSON(mochaJson + readJSON(mutationJson)[0].hash + ".json").results[0].suites.length;
    var mochaMutants = readJSON(mutationJson).map(hash => readJSON(mochaJson + hash.hash + ".json"));
    columnName.push("hash");
    columnName.push("contract");
    columnName.push("operator");
    for (var hash of readJSON(mutationJson).map(hash => hash.hash)) {

      var arr = [];
      readJSON(mutationJson).map(mutation => {
        if (mutation.hash === hash) {
          arr.push(mutation.file.substring(mutation.file.lastIndexOf("/") + 1));
        }
      });
      readJSON(mutationJson).map(mutation => {
        if (mutation.hash === hash) {
          arr.push(mutation.operator);
        }
      });
      var count = 0;
      while (count < numberSuite) {
        var resToAdd = [];
        var allRes = mochaMutants.map(item => item.results[0].suites[count].file);
        allRes.filter(item => {
          if (!resToAdd.includes(item)) {
            resToAdd.push(item);
          }
        });
        allRes.filter(item => {
          if (!columnName.includes(item)) {
            columnName.push(item);
            testName.push(item);
          }
        });
        var res = findTestRes(resToAdd[0], hash);
        res.map(item => {
          if (item !== undefined) {
            arr.push(item);
          }
        });
        count++;
      }
      map.set(hash, arr);
    }
  }else{
    console.log("- "+mochawesomeDir +" was not generated.")
  }
}

/**
 * The <b>findTestRes</b> function provides to find if a test killed a certain mutant or not
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
    if (item.hash === hash) {
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
  if (!fs.existsSync(".resume/report.csv")) {
    fs.writeFileSync(".resume/report.csv", csv);
    //console.log("Report writtend to .resume/report.csv");
  } else {
    csvReader.read(map, testName);
  }
}

module.exports = {
  csv: toCSV
};

