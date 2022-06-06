const fs = require("fs");
const os = require("os");
const readline = require('readline');
const rimraf = require('rimraf')
const fsExtra = require("fs-extra");
const config = require("./config");
const glob = require("glob");
const path = require("path");
const mkdirp = require("mkdirp");
const copy = require("recursive-copy");
const { testsGlob } = require("./config");
const sumoDir = config.sumoDir;
const resumeDir = config.resumeDir;
const targetDir = config.targetDir;
const baselineDir = config.baselineDir;
const testDir = config.testDir;
const contractsDir = config.contractsDir;
const contractsGlob = config.contractsGlob;
const testConfigGlob = config.testConfigGlob;
const packageManagerGlob = config.packageManagerGlob;


/**
 * deletes the .sumo folder
 */
function cleanSumo() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  if (!fs.existsSync(sumoDir)) {
    console.log("Nothing to delete")
    process.exit(0)
  }
  rl.question("If you delete the '.sumo' directory you will lose the mutation testing data. Do you want to proceed? y/n > ", function (response) {
    response = response.trim()
    response = response.toLowerCase()
    if (response === 'y' || response === 'yes') {
      fsExtra.remove(sumoDir);
      console.log("'.sumo directory' deleted!")
      rl.close()
    }
    else {
      rl.close()
    }
  })
}

/**
 * saves the .sumo/baseline folder
 */
function saveBaseline(callback) {
  if (fs.existsSync(baselineDir)) {
    rimraf(baselineDir, function () {
      //console.log("Baseline deleted");
      mkdirp(baselineDir, () =>
      copy(targetDir + config.targetConfigFile, baselineDir + config.targetConfigFile,
      copy(testDir, baselineDir + '/test', { dot: true },
      copy(contractsDir, baselineDir + '/contracts', { dot: true }, callback)))
    );
    })
  }else{

  mkdirp(baselineDir, () =>
    copy(targetDir + config.targetConfigFile, baselineDir + config.targetConfigFile,
    copy(testDir, baselineDir + '/test', { dot: true },
    copy(contractsDir, baselineDir + '/contracts', { dot: true }, callback)))
  );}
}

//Checks the package manager used by the SUT
function getPackageManager() {
  let pmConfig = {};

  for (const lockFile of packageManagerGlob) {
    if (fs.existsSync(targetDir + lockFile)) {
      let packageManagerFile = lockFile;
      if (!packageManagerFile) {
        console.error("Target project does not contain a suitable lock file.");
        process.exit(1);
      }

      if (lockFile.includes("yarn")) {
        pmConfig.packageManager = "yarn";
        pmConfig.runScript = "run";
      } else {
        pmConfig.packageManager = "npm";
        pmConfig.runScript = "run-script";
      }
      break;
    }
  }

  return pmConfig;
}

//Checks the testing framework used by the SUT
function getTestConfig() {
  let targetConfigFile = {};

  for (const configFile of testConfigGlob) {
    if (fs.existsSync(targetDir + configFile)) {
      targetConfigFile = configFile;
      if (!targetConfigFile) {
        console.error("Target project does not contain a suitable test configuration file.");
        process.exit(1);
      }
      break;
    }
  }
  return targetConfigFile;
}

/**
 * deletes the .resume folder
 */
function cleanResumeFromCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  if (!fs.existsSync(resumeDir)) {
    console.log("Nothing to delete")
    process.exit(0)
  }
  rl.question("If you delete the '.resume' directory you will lose all the regression testing information. do yant to proceed? y/n > ", function (response) {
    response = response.trim()
    response = response.toLowerCase()
    if (response === 'y' || response === 'yes') {
      fsExtra.remove(resumeDir);
      console.log("'.resume directory' deleted!")
      rl.close()
    }
    else {
      rl.close()
    }
  })
}

/**
 * Cleans the build dir
 */
 function cleanBuildDir() {
  if (fs.existsSync(config.buildDir)) {
    fsExtra.emptyDirSync(config.buildDir);
    console.log("Build directory cleaned.");
  } else {
    console.log("Build directory is already empty.");
  }
}

/**
 * deletes the .resume folder
 */
function cleanResumeFromGUI() {
  fsExtra.remove(resumeDir);
}

/**
 * restores the SUT files
 */
function restore() {

  if (fs.existsSync(baselineDir)) {

    //Restore config file
    let targetConfigFile;
    for (const configFile of testConfigGlob) {
      if (fs.existsSync(baselineDir + configFile)) {
        targetConfigFile = configFile;
        break;
      }
    }
    fs.copyFile(baselineDir + targetConfigFile, targetDir + targetConfigFile, (err) => {
      if (err) throw err;
    });
    
    //Restore contracts
    glob(baselineDir + '/contracts' + contractsGlob, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        let relativeFilePath = file.split(".sumo/baseline/contracts")[1];
        let fileDir = path.dirname(relativeFilePath);
        fs.mkdir(contractsDir + fileDir, { recursive: true }, function (err) {
          if (err) return cb(err);

          fs.copyFile(file, contractsDir + relativeFilePath, (err) => {
            if (err) throw err;
          });
        });
      }
    });
    
    //Restore tests
    glob(baselineDir + '/test' + testsGlob, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        let relativeFilePath = file.split(".sumo/baseline/test")[1];
        let fileDir = path.dirname(relativeFilePath);
        fs.mkdir(testDir + fileDir, { recursive: true }, function (err) {
          if (err) return cb(err);

          fs.copyFile(file, testDir + relativeFilePath, (err) => {
            if (err) throw err;
          });
        });
      }
    });

    console.log("Project restored.");
  } else {

    console.log("No baseline available.");
  }
}

/**
* Cleans the temporary files generated by Ganache
*/
function cleanTmp() {
  var dir = os.tmpdir();
  fs.readdirSync(dir).forEach(f => {
    if (f.substring(0, 4) === 'tmp-') {
      rimraf.sync(`${dir}/${f}`)
      //console.log(f + ' deleted')
    }
  });
  console.log("Ganache temporary files deleted.");
}

/**
* Restore test files
*/
function restoreTestDir() {
  const baselineTest = ".sumo/baseline/test";
  if (fs.existsSync(baselineTest)) {
    fsExtra.copySync(baselineTest, testDir);
    console.log("Test files restored");
  } else
    console.log("No baseline exist ");
}


module.exports = {
  cleanSumo: cleanSumo,
  saveBaseline: saveBaseline,
  cleanResumeCLI: cleanResumeFromCLI,
  cleanResumeFromGUI: cleanResumeFromGUI,
  getTestConfig: getTestConfig,
  getPackageManager: getPackageManager,
  restore: restore,
  restoreTestDir: restoreTestDir,
  cleanTmp: cleanTmp,
  cleanBuildDir: cleanBuildDir
};

