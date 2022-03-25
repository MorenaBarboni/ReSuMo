const fs = require("fs");
const config = require("./config");


function Instrumenter() {
  this.testConfigFile;
}

/* Set configuration file */
Instrumenter.prototype.setConfig = function(config) {
  this.testConfigFile = config;
};

/* Start instrumentation */
Instrumenter.prototype.instrumentConfig = function() {
  console.log("Instrumenting " + config.targetDir + this.testConfigFile);

  if (this.testConfigFile === "/hardhat.config.js" || this.testConfigFile === "/hardhat.config.ts") {
    instrumentHardhatConfig(this.testConfigFile);
  } else if (this.testConfigFile === "/truffle-config.js") {
    instrumentTruffleConfig(this.testConfigFile);
  }
};

/* Instrument a HardHat configuration file */
function instrumentHardhatConfig(file) {
  console.log("HardHat config instrumentation currently not supported");
  console.log("Instrumentation skipped ...");
}

/* Instrument a Truffle configuration file */
function instrumentTruffleConfig(file) {

  const newConfig = require(config.targetDir + file);

  //Instrument truffle-config
  addMochawesome(newConfig);

  if (config.tce === true) {
    addSolcSettings(newConfig);
  }

  //Overwrite target truffle-config
  let jsonData = JSON.stringify(newConfig);
  let codeStr = `module.exports = ${jsonData}`;
  fs.writeFileSync(config.targetDir + "/truffle-config.js", codeStr, "utf8", function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("Done.");
  });
}

/* Restore original config file */
Instrumenter.prototype.restoreConfig = function() {
  //hardhat not yet supported
  if (this.testConfigFile === "/truffle-config.js") {
    console.log("Restoring" + config.targetDir + this.testConfigFile);
    const original = fs.readFileSync("./" + config.baselineDir + this.testConfigFile, "utf8");
    fs.writeFileSync(config.targetDir + this.testConfigFile, original, "utf8");
  }
};

/* Add mochawesome reporter */
function addMochawesome(testConfigFile) {

  if (testConfigFile.mocha) {

    testConfigFile.mocha.reporter = "mochawesome";
    testConfigFile.mocha.reporterOptions = {
      reportDir: config.absoluteSumoDir + "/mochawesome-report",
      html: false,
      quiet: true
    };
  } else {

    testConfigFile.mocha = {
      reporter: "mochawesome",
      reporterOptions: {
        reportDir: config.absoluteSumoDir + "/mochawesome-report",
        html: false,
        quiet: false
      }
    };
  }
}

/* Add solc compiler settings */
function addSolcSettings(testConfigFile) {
  if (testConfigFile.compilers) {
    if (testConfigFile.compilers.solc) {
      testConfigFile.compilers.solc.settings = {
        optimizer: {
          enabled: true,
          details: {
            yul: false
          }
        },
        metadata: {
          bytecodeHash: "none"
        }
      };
    } else {
      testConfigFile.compilers.solc = {
        settings: {
          optimizer: {
            enabled: true,
            details: {
              yul: false
            }
          },
          metadata: {
            bytecodeHash: "none"
          }
        }
      };
    }
  } else {
    testConfigFile.compilers = {
      solc: {
        settings: {
          optimizer: {
            enabled: true,
            details: {
              yul: false
            }
          },
          metadata: {
            bytecodeHash: "none"
          }
        }
      }
    };
  }
}


module.exports = Instrumenter;
