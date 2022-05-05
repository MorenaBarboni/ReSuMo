const fs = require("fs");
const os = require("os");
const readline = require('readline');
const rimraf = require('rimraf')
const fsExtra = require("fs-extra");
const config = require("./config");
const glob = require("glob");
const path = require("path");
const sumoDir = config.sumoDir;
const resumeDir = config.resumeDir;
const targetDir = config.targetDir;
const baselineDir = config.baselineDir;
const testDir = config.testDir;
const contractsDir = config.contractsDir;
const contractsGlob = config.contractsGlob;
const testConfigGlob = config.testConfigGlob;

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

    let targetConfigFile;
    for (const configFile of testConfigGlob) {
      if (fs.existsSync(baselineDir + configFile)) {
        targetConfigFile = configFile;
        break;
      }
    }
    if (targetConfigFile) {
      fs.copyFile(baselineDir + targetConfigFile, targetDir + targetConfigFile, (err) => {
        if (err) throw err;
      });
    }

    glob(baselineDir + contractsGlob, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        let relativeFilePath = file.split(".sumo/baseline")[1];
        let fileDir = path.dirname(relativeFilePath);
        fs.mkdir(contractsDir + fileDir, { recursive: true }, function (err) {
          if (err) return cb(err);

          fs.copyFile(file, contractsDir + relativeFilePath, (err) => {
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
        console.log(f + ' deleted')
      }
    });
  }

 /**
 * Restore test files
 */
function restoreTestDir() {
  const baselineTest = "./.resume/baseline/tests";
  if (fs.existsSync(baselineTest)) {
    fsExtra.copySync(baselineTest, testDir);
    console.log("Test files restored");
  } else
    console.log("No baseline exist ");
}


module.exports = {
  cleanSumo: cleanSumo,
  cleanResumeCLI: cleanResumeFromCLI,
  cleanResumeFromGUI: cleanResumeFromGUI,
  restore:restore,
  restoreTestDir: restoreTestDir,
  cleanTmp: cleanTmp
};

