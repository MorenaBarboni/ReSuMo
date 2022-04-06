const csv = require("csv-parser");
const fs = require("fs");
var oldArr = [];
const mergedMap = new Map();
/**
 *The big <b>compare()</b> method provides to merge the old test result and the new one, adding new hashes, new contracts, new operators and new test names
 * @param oldReport  The privius results report
 * @param newReport The new result report
 * @param oldTestName An array of old report tests
 * @param newTestName An array of new report tests
 */
function compare(oldReport, newReport, oldTestName, newTestName) {
  var allTestName = setTestNameArray(oldTestName, newTestName);
  var newHashArray = setHash(newReport);
  var oldHashArray = setHash(oldReport);
  var newOperators = setArray(newReport,1);
  var newContracts = setArray(newReport,0)
  for (var key of newReport.keys()) {
    var arrayRes = [];
    for (var oldReportElement of oldReport) {
      /**
       * Results can be merged if they are referred to the same hash
       */
      if (oldReportElement.hash === key) {
        for (let test of allTestName) {
          var indexOf = allTestName.indexOf(test);
          if (oldTestName.includes(test) && newTestName.includes(test)) {
            arrayRes.insert(indexOf, newReport.get(key)[indexOf + 2]);
          } else if (!(oldTestName.includes(test)) && (newTestName.includes(test))) {
            arrayRes.insert(indexOf, newReport.get(key)[indexOf + 2]);
          } else if (oldTestName.includes(test) && !(newTestName.includes(test))) {
            arrayRes = saveTestResult(oldReportElement, test, arrayRes, indexOf);
          }
        }
        arrayRes.unshift(newReport.get(key)[1]);
        arrayRes.unshift(newReport.get(key)[0]);
        mergedMap.set(key, arrayRes);
      }/**
       * If one of the report has more hashes than the other, it's possible to add
       * the newest and to delete the oldest if it is referred to an already exists operator
       */
      else if ((!(newHashArray.includes(oldReportElement.hash))) || (!(oldHashArray.includes(key)))) {

        if ((!(newOperators.includes(oldReportElement.operator)))||(!(newContracts.includes(oldReportElement.contract)))) {
          console.log(newContracts)
          var tempTest = [];
          for (let test of allTestName) {
            var indexOf2 = allTestName.indexOf(test);
            if (oldTestName.includes(test)) {
              tempTest = saveTestResult(oldReportElement, test, tempTest, indexOf2);
            } else {
              tempTest.insert(indexOf2, "?");
            }
          }
          tempTest.unshift(oldReportElement.operator);
          tempTest.unshift(oldReportElement.contract);
          mergedMap.set(oldReportElement.hash, tempTest);
        }
        var tmp = [];
        for (let test of allTestName) {
          var indexOf3 = allTestName.indexOf(test);
          if ((newReport.get(key)[indexOf3 + 2]) !== undefined) {
            tmp.insert(indexOf3, newReport.get(key)[indexOf3 + 2]);
          } else {
            tmp.insert(indexOf3, "?");
          }
        }
        tmp.unshift(newReport.get(key)[1]);
        tmp.unshift(newReport.get(key)[0]);
        mergedMap.set(key, tmp);
      }
    }
  }
  var columnName = [];
  columnName = allTestName;
  columnName.unshift("operator");
  columnName.unshift("contract");
  columnName.unshift("hash");
  writeCSV(columnName,mergedMap)
}


/**
 * The <b>columnName()</b> function provides to write the new and merged array of results affixed to the old one .
 * @param columnName Array of CSV column
 * @param mergedMap Array of CSV data
 */
function writeCSV(columnName,mergedMap){
  const headers = columnName.join(",");
  const record = Array.from(mergedMap.entries()).map(arr => arr.join(","));
  const csv = [
    headers, ...record
  ].join("\n");
  fs.writeFileSync(".resume/report.csv", csv);
  console.log("report.csv Written");
  mergedMap.clear()
  oldArr=[]
}
/**
 * The read() function read the old csv report and store data into an array
 * @param newMap
 * @param newTestName
 */
function read(newMap, newTestName) {
  var oldTestName = [];
  var swapped = [];
  fs.readFile(".resume/report.csv", "utf8", function(err, data) {
    var dataArray = data.split(/\r?\n/);
    oldTestName = dataArray[0].split(",");
    oldTestName.shift();
    oldTestName.shift();
    oldTestName.shift();
    fs.createReadStream(".resume/report.csv")
      .pipe(csv())
      .on("data", (data) => oldArr.push(data))
      .on("end", () => {
        swapped = [];
        for (var i = 0; i < oldArr.length; i++) {
          swapped.push(objectFlip(oldArr[i]));
        }
        compare(swapped, newMap, oldTestName, newTestName);
      });

  });
}

/**
 * The <b>insert()</b> function extend the Array library
 * @param index Index of the array where to insert the item
 * @param item The item to insert into the array
 */
Array.prototype.insert = function(index, item) {
  this.splice(index, 0, item);
};


/**
 * The <b>setTestNameArray()</b> return an array of ordered merged tests
 * @param oldTestName Array containing all old tests
 * @param newTestName Array containing all new tests
 * @returns {*[]} Ordered tests name
 */
function setTestNameArray(oldTestName, newTestName) {
  var mergedTestName = [];
  for (let test of newTestName) {
    if (oldTestName.includes(test)) {
      mergedTestName.push(test);
    }
  }
  for (let test of newTestName) {
    if (!(oldTestName.includes(test))) {
      mergedTestName.push(test);
    }
  }
  for (let test of oldTestName) {
    if (!(newTestName.includes(test))) {
      mergedTestName.push(test);
    }
  }
  return mergedTestName;
}

/**
 * The <b>objectFlip()</b> function provides to store the test by their result
 * @param obj Array where test are stored
 * @returns {{}} A new array with flipped test result
 */
function objectFlip(obj) {
  const ret = {};
  Object.keys(obj).forEach(key => {
    if (key !== "operator" && key !== "hash" && key !== "contract") {
      if (!(obj[key] in ret)) {
        ret[obj[key]] = [key];
      } else {
        ret[obj[key]].push(key);
      }
    } else {
      ret[key] = obj[key];
    }
  });
  return ret;
}

/**
 *Store all mutants hash into an array
 * @param collection The collection could be an array or a map
 * @returns {*[]} An array where all hash are stored
 */
function setHash(collection) {
  var hashArr = [];
  if (Array.isArray(collection)) {
    for (let elem of collection) {
      hashArr.push(elem.hash);
    }
  } else {
    for (let elem of collection.keys()) {
      hashArr.push(elem);
    }
  }
  return hashArr;
}



/**
 * The <b>setOperatorArray()</b> function store a list information about new mutants
 * @param newReport A map containing the updated tests results
 * @param index 1 for Operator, 2 for Contracts
 * @returns {*[]} An array containing all mutants operators
 */
function setArray(newReport,index) {
  var arr = [];
  for (let elem of newReport.keys()) {
    if (!(arr.includes(newReport.get(elem)[index]))) {
      arr.push(newReport.get(elem)[index]);
    }
  }
  return arr;
}
/**
 *The <b>saveTestResult()</b> function provides to write in the resultArray the result of the tests
 * @param oldReportElement A mutant belonging to the old report
 * @param test The name of a tests
 * @param arrayRes Array where are stored the results
 * @param indexOf Index where put the result of the tests
 * @returns {*[]} The Array result
 */
function saveTestResult(oldReportElement, test, arrayRes, indexOf) {
  if (("L" in oldReportElement) && oldReportElement.L.includes(test)) {
    arrayRes.insert(indexOf, "L");
  } else if (("K" in oldReportElement) && oldReportElement.K.includes(test)) {
    arrayRes.insert(indexOf, "K");
  } else if ("?" in oldReportElement) {
    arrayRes.insert(indexOf, "?");
  }
  return arrayRes;
}

module.exports = {
  read: read
};
