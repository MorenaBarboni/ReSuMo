const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const fileSys = require("./fileSys");
const { table } = require("table");

function logPathsOnConsole(title, paths) {
  const n = paths.length;
  if (n == 0) console.log(title + ": " + chalk.green("none"));
  else {
    console.log(title + " (" + n + "):");

    paths.forEach((p) => {
      console.log(
        "\t" + path.parse(p).dir + "/" + chalk.bold(path.basename(p))
      );
    });
  }
  console.log();
}

function logTileOnReport(content) {
  fs.appendFileSync(fileSys.report, "\n\n" + content + "\n", { flags: "a" });
}

function logJsonOnReport(content) {
  const n = content.length;
  if (n === 0) fs.appendFileSync(fileSys.report, "none", { flags: "a" });
  else
    fs.appendFileSync(fileSys.report, JSON.stringify(content, null, "\t"), {
      flags: "a"
    });
}

function logBaseline(cs, ts) {
  var s =
    "\n" +
    "\n" +
    "---------------- PROGRAM BASELINE ---------------" +
    "\n\n" +
    "Contracts";

  var n = cs.length;
  if (n === 0) s = s + ": none" + "\n";
  else {
    s = s + " (" + n + "):\n";
    cs.forEach((c) => {
      s = s + " - .." + c.path.match(/\/contracts\/.*/) + "\n";
    });
  }

  s = s + "\n" + "Tests";
  n = ts.length;
  if (n === 0) s = s + ": none" + "\n";
  else {
    s = s + " (" + n + "):\n";
    ts.forEach((t) => {
      s = s + " - .." + t.path.match(/\/test\/.*/) + "\n";
    });
  }
  s = s + "\n\n";
  fs.appendFileSync(fileSys.report, s, { flags: "a" });
}

function logProgramDifferences(cc, ct) {
  var s =
    "-------------- PROGRAM DIFFERENCES --------------" +
    "\n\n" +
    "Changed contracts";

  var n = cc.length;
  if (n === 0) s = s + ": none" + "\n";
  else {
    s = s + " (" + n + "):\n";
    cc.forEach((c) => {
      s = s + " - .." + c.match(/\/contracts\/.*/) + "\n";
    });
  }

  s = s + "\n" + "Changed tests";
  n = ct.length;
  if (n === 0) s = s + ": none" + "\n";
  else {
    s = s + " (" + n + "):\n";
    ct.forEach((t) => {
      s = s + " - .." + t.match(/\/test\/.*/) + "\n";
    });
  }
  s = s + "\n\n";
  fs.appendFileSync(fileSys.report, s, { flags: "a" });
}

function logRTS(cm, rt) {
  var s =
    "--------- REGRESSION MUTATION SELECTION ---------" +
    "\n\n" +
    "Contracts to be mutated";

  var n = cm.length;
  if (n === 0) s = s + " none" + "\n";
  else {
    s = s + " (" + n + "):\n";
    cm.forEach((c) => {
      s = s + " - .." + c.match(/\/contracts\/.*/) + "\n";
    });
  }

  s = s + "\n" + "Regression tests";
  n = rt.length;
  if (n === 0) s = s + " none" + "\n";
  else {
    s = s + " (" + n + "):\n";
    rt.forEach((t) => {
      s = s + " - .." + t.match(/\/test\/.*/) + "\n";
    });
  }
  s = s + "\n\n";
  fs.appendFileSync(fileSys.report, s, { flags: "a" });
}

function logSuMo() {
  var s =
    "--------- SUMO MUTATION TESTING PROCESS ---------" +
    "\n" +
    ".\n" +
    ".\n" +
    ".\n" +
    ".\n" +
    ".\n" +
    ".\n" +
    ".\n" +
    "---------------- PROCESS ENDED ------------------";

  s = s + "\n\n\n";
  fs.appendFileSync(fileSys.report, s, { flags: "a" });
}

function logRTSResults(matrix, t, k, a, sc) {
  var s =
    "------- PARTIAL MUTATION TESTING RESULTS --------" +
    "\n\nPartial mutant execution matrix:\n";

  s =
    s +
    table(matrix) +
    "Total mutants: " +
    t +
    "\nKilled mutants: " +
    k +
    "\nAlive mutants: " +
    a +
    "\nMutation score: " +
    sc +
    "\n\n\n";
  fs.appendFileSync(fileSys.report, s, { flags: "a" });
}

function logPreviousMatrix(matrix, t, k, a, sc) {
  var s = "------- PREVIOUS MUTANT EXECUTION MATRIX --------" + "\n\n";

  s =
    s +
    table(matrix) +
    "Total mutants: " +
    t +
    "\nKilled mutants: " +
    k +
    "\nAlive mutants: " +
    a +
    "\nMutation score: " +
    sc + "\n\n";
  fs.appendFileSync(fileSys.report, s, { flags: "a" });
}

function logRemResults(matrix, t, k, a, sc) {
  var s =
    "------ REGRESSION MUTATION TESTING RESULTS ------" +
    "\n\nUpdated mutant execution matrix:\n";

  s =
    s +
    table(matrix) +
    "Total mutants: " +
    t +
    "\nKilled mutants: " +
    k +
    "\nAlive mutants: " +
    a +
    "\nMutation score: " +
    sc;
  fs.appendFileSync(fileSys.report, s, { flags: "a" });
}

module.exports = {
  logPathsOnConsole: logPathsOnConsole,
  logJsonOnReport: logJsonOnReport,
  logTileOnReport: logTileOnReport,
  logBaseline: logBaseline,
  logProgramDifferences: logProgramDifferences,
  logRTS: logRTS,
  logSuMo: logSuMo,
  logRTSResults: logRTSResults,
  logPreviousMatrix: logPreviousMatrix,
  logRemResults: logRemResults
};
