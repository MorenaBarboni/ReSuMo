const { spawnSync, spawn } = require("child_process");
const config = require("./config");
const targetDir = config.targetDir;
const personalTimeOut=config.testingTimeOutInSec


function spawnCompile(packageManager, testingFramework, runScript) {
    var compileChild;
  
    //Run a custom compile script
    if (config.customTestScript) {
  
      if (process.platform === "win32") {
        compileChild = spawnSync(packageManager + ".cmd", [runScript, "compile"], {
          stdio: "inherit",
          cwd: targetDir
        });
      } else if (process.platform === "linux") {
        compileChild = spawnSync(packageManager, [runScript, "compile"], { stdio: "inherit", cwd: targetDir });
      } else if (process.platform === "darwin") {
        compileChild = spawnSync(packageManager, [runScript, "compile"], { stdio: "inherit", cwd: targetDir });
      } else if (process.platform === "darwin") {
        compileChild = spawnSync(packageManager, [runScript, "compile"], { stdio: "inherit", cwd: targetDir });
      }
    }   //Spawn a default compile script
    else {
      if (process.platform === "win32") {
        compileChild = spawnSync(testingFramework + ".cmd", ["compile"], { stdio: "inherit", cwd: targetDir });
      } else if (process.platform === "linux") {
        compileChild = spawnSync(testingFramework, ["compile"], { stdio: "inherit", cwd: targetDir });
      } else if (process.platform === "darwin") {
        compileChild = spawnSync(testingFramework, ["compile"], { stdio: "inherit", cwd: targetDir });
      } else if (process.platform === "darwin") {
        compileChild = spawnSync(testingFramework, ["compile"], { stdio: "inherit", cwd: targetDir });
      }
    }
    return compileChild.status === 0;
  }
  
  function spawnTest(packageManager, testingFramework, runScript) {
  
    var testChild;
    //Run a custom test script
    if (config.customTestScript) {
      if (process.platform === "win32") {
        testChild = spawnSync(packageManager + ".cmd", [runScript, "test"], {
          stdio: "inherit",
          cwd: targetDir,
          timeout: 300000
        });
  
      } else if (process.platform === "linux") {
        testChild = spawnSync(packageManager, [runScript, "test"], {
          stdio: "inherit",
          cwd: targetDir,
          timeout: 300000
        });
      } else if (process.platform === "darwin") {
        testChild = spawnSync(packageManager, [runScript, "test"], {
          stdio: "inherit",
          cwd: targetDir,
          timeout: 300000
        });
      } else if (process.platform === "darwin") {
        testChild = spawnSync(packageManager, [runScript, "test"], {
          stdio: "inherit",
          cwd: targetDir,
          timeout: 300000
        });
      }
    }
    //Spawn a default test process
    else {
      if (process.platform === "win32") {
        testChild = spawnSync(testingFramework + ".cmd", ["test"], { stdio: "inherit", cwd: targetDir, timeout: (personalTimeOut*1000) });
      } else if (process.platform === "linux") {
        testChild = spawnSync(testingFramework, ["test"], { stdio: "inherit", cwd: targetDir, timeout: (personalTimeOut*1000) });
      } else if (process.platform === "darwin") {
        testChild = spawnSync(testingFramework, ["test"], { stdio: "inherit", cwd: targetDir, timeout: (personalTimeOut*1000) });
      }
    }
  
    let status;
    if (testChild.error && testChild.error.code === "ETIMEDOUT") {
      status = 999;
    } else {
      status = testChild.status;
    }
    //0 = live, !=0 killed, 999 = timedout
    return status;
  }
  

//spawn new ganache process
function spawnGanache() {
    var child;
    if (config.ganache) {
      if (process.platform === "win32") {
        child = spawn("ganache-cli.cmd", { stdio: "inherit", cwd: targetDir, detached: true });
      } else if (process.platform === "linux") {
        child = spawn("ganache-cli", { stdio: "inherit", cwd: targetDir, detached: true });
      } else if (process.platform === "darwin") {
        child = spawn("ganache-cli", { stdio: "inherit", cwd: targetDir, detached: true });
      }
      child.unref;
      const waitForGanache = () => {
        if (!isRunning(child)) {
          console.log("Waiting for Ganache ...");
          setTimeout(() => {
            waitForGanache();
          }, 250);
        } else {
          resolve();
        }
      };
    }
    return child;
  }


function killGanache() {
    if (config.ganache) {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", ganacheChild.pid, "/f", "/t"]);
      } else if (process.platform === "linux") {
        ganacheChild.kill("SIGHUP");
      } else if (process.platform === "darwin") {
        ganacheChild.kill("SIGHUP");
      }
    }
  }

  module.exports = {
    spawnCompile: spawnCompile,
    spawnTest: spawnTest,
    spawnGanache: spawnGanache,
    killGanache: killGanache
  };
  