const chalk = require("chalk");
const jsdiff = require("diff");
const fs = require("fs");
const sha1 = require("sha1");
const path = require("path");
const config = require("./config");

const baselineDir = config.baselineDir;
const contractsDir = config.contractsDir;
const mutantsDir = config.resultsDir+'/mutants';

function splice(str, start, length, replacement) {
  return str.substring(0, start) + replacement + str.substring(start + length);
}

function Mutation(file, start, end, startLine, endLine, original, replace, operator, status = null, killers = [], nonKillers = [], bytecode, testingTime=null, id = null) {
  this.file = file;
  this.start = start;
  this.end = end;
  this.startLine = startLine;
  this.endLine = endLine;
  this.original = original;
  this.replace = replace;
  this.operator = operator;
  this.status = status;
  this.killers = killers,
  this.nonKillers = nonKillers,
  this.bytecode = bytecode;
  this.testingTime = testingTime;
  this.id = this.hash();
}

Mutation.prototype.hash = function() {
  const input = [path.basename(this.file), this.start, this.end, this.replace].join(":");
  return sha1(input).slice(0, 8);
};

Mutation.prototype.apply = function() {
  const original = fs.readFileSync(this.file, "utf8");
  const mutated = this.applyToString(original);

  fs.writeFileSync(this.file, mutated, "utf8");
};


//Saves a mutant to file (apply and restore)
Mutation.prototype.save = function() {
  const original = fs.readFileSync(this.file, "utf8");
  const mutated = this.applyToString(original);

  var contractName = path.basename(this.file);

  fs.writeFileSync(mutantsDir + "/" + contractName + "-" + this.hash() + ".sol", mutated, function(err) {
    if (err) return console.log(err);
  });

  //console.log('Restoring ' + this.file)
  fs.writeFileSync(this.file, original, "utf8");
};

Mutation.prototype.applyToString = function(original) {
  return splice(original, this.start, this.end - this.start, this.replace);
};

Mutation.prototype.restore = function() {
  const baseline = this.baseline();

  console.log("Restoring " + this.file);

  const original = fs.readFileSync(baseline, "utf8");
  fs.writeFileSync(this.file, original, "utf8");
};

Mutation.prototype.baseline = function() {
  return baselineDir+"/contracts" + this.file.substr(contractsDir.length);
};

Mutation.prototype.diff = function() {
  const original = fs.readFileSync(this.baseline(), "utf8");
  const mutated = this.applyToString(original);

  let diff = jsdiff.diffLines(original, mutated);
  const lineNumber = this.getLineNumber();
  const context = 2;

  diff = diff
    .filter(part => part.added || part.removed)
    .map(function(part) {
      // green for additions, red for deletions
      // grey for common parts
      const color = part.added ? "green" : part.removed ? "red" : "grey";

      let num;
      if (part.removed) {
        num = lineNumber.toString().padStart(4);
        num = chalk.gray(num + " | ");
      } else {
        num = chalk.gray("     | ");
      }

      return num + chalk[color](part.value.replace(/\n$/, ""));
    });

  let lines = mutated.split("\n").map((line, i) => {
    const num = (i + 1).toString().padStart(4);
    return chalk.gray(num + " | " + line);
  });

  lines.splice(lineNumber - 1, 1, diff[0], diff[1]);

  lines = lines.slice(Math.max(0, lineNumber - context - 1), lineNumber + context + 1);

  return lines.join("\n") + "\n";
};

Mutation.prototype.printMutation = function() {
  const original = fs.readFileSync(this.baseline(), "utf8");
  const mutated = this.applyToString(original);

  let diff = jsdiff.diffLines(original, mutated);
  const lineNumber = this.getLineNumber();
  const context = 2;

  diff = diff
    .filter(part => JSON.stringify(part.added) || JSON.stringify(part.removed))
    .map(function(part) {

      let num;
      if (part.removed) {
        num = lineNumber.toString().padStart(4);
        num = (num + " | ---");
      } else {
        num = ("     | +++");
      }
      return num + (part.value.replace(/\n$/, ""));
    });

  let lines = mutated.split("\n").map((line, i) => {
    const num = (i + 1).toString().padStart(4);
    return (num + " | " + line);
  });

  lines.splice(lineNumber - 1, 1, diff[0], diff[1]);

  lines = lines.slice(Math.max(0, lineNumber - context - 1), lineNumber + context + 1);

  return lines.join("\n") + "\n";
};

/**
 * Converts the mutation to json
 * @returns the json representation of a mutation
 */
 Mutation.prototype.toJson = function () {
  var m = new Mutation(this.file, this.start, this.end, this.startLine, this.endLine, this.original, this.replace, this.operator,  this.status, this.killers, this.nonKillers, this.bytecode, this.testingTime);
  m.bytecode = null;
  return JSON.stringify(m, null, "\t");
}

/**
 * Gets the mutation file name
 * @returns the name of the mutated contract
 */
 Mutation.prototype.fileName = function () {

  const lastIndex = this.file.lastIndexOf('/');
  let fileName = this.file.slice(lastIndex+1);
  
  return fileName;
}


Mutation.prototype.getLineNumber = function() {
  const source = fs.readFileSync(this.baseline(), "utf8");
  const indexes = [];

  for (let i = 0; i < source.length; i++) {
    if (source[i] == "\n") {
      indexes.push(i);
    }
  }

  return indexes.findIndex(idx => idx > this.start) + 1;
};

Mutation.prototype.patch = function() {
  const original = fs.readFileSync(this.baseline(), "utf8");
  const mutated = this.applyToString(original);

  return jsdiff.createPatch(this.file, original, mutated);
};

module.exports = Mutation;
