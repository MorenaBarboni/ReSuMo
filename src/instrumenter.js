const fs = require("fs");
const config = require("./config");
const baselineDir = config.baselineDir;

function Instrumenter() {
  this.testConfigFile;
}

/* Set configuration file */
Instrumenter.prototype.setConfig = function (config) {
  this.testConfigFile = config;
};

/* Start instrumentation */
Instrumenter.prototype.instrumentConfig = function () {
  if (!this.testConfigFile.startsWith("/hardhat")) {
    console.log("Instrumenting configuration file:  " + config.targetDir + this.testConfigFile);
    console.log("\n");

    const newConfig = require(config.targetDir + this.testConfigFile);

    //Instrument truffle-config
    if (config.regression === true) {
      addMochawesome(newConfig);
    }
    if (config.tce === true) {
      addSolcSettings(newConfig);
    }

    //Overwrite target truffle-config
    let jsonData = JSON.stringify(newConfig);
    let codeStr = `module.exports = ${jsonData}`;

    fs.writeFileSync(config.targetDir + this.testConfigFile, codeStr, "utf8", function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("Done.");
    });
  } else {
    console.log("Instrumentation of configuration file:  " + config.targetDir + this.testConfigFile + " skipped.");
  }
};


/* Restore original config file */
Instrumenter.prototype.restoreConfig = function () {
  console.log("Restoring " + config.targetDir + this.testConfigFile);
  const original = fs.readFileSync("./" + baselineDir + this.testConfigFile, "utf8");
  fs.writeFileSync(config.targetDir + this.testConfigFile, original, "utf8");
};

/* Add mochawesome reporter */
function addMochawesome(testConfigFile) {

  if (testConfigFile.mocha) {

    testConfigFile.mocha.reporter = "mochawesome";
    testConfigFile.mocha.reporterOptions = {
      reportDir: config.absoluteArtifactsDir + "/mochawesome-report",
      html: false,
      quiet: true
    };
  } else {

    testConfigFile.mocha = {
      reporter: "mochawesome",
      reporterOptions: {
        reportDir: config.absoluteArtifactsDir + "/mochawesome-report",
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
