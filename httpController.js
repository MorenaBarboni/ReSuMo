
const mutationRunner = require('./src/mutationRunner')
const utils = require('./src/utils')
const host = 'localhost';
const port = 8000;
const http=require('http')
const fs = require('fs')
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const server = http.createServer(app);
const config = require("./src/config");
const Papa = require("truffle/build/324.bundled");
const { pathWalk } = require("truffle/build/52.bundled");
/**
 * Allow cors options for gets and posts
 * @type {{methods: string, origin: string, optionsSuccessStatus: number}}
 */
const corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 200,
  methods: "GET, POST"
};
app.use(cors(corsOptions));

/**
 * Opening server function
 */
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

/**
 * These functions allow the post request method in different path in order to start the main command's functions.
 */

app.post("/clean", function(req,res){
  if (!(fs.existsSync(config.baselineDir))) {
    res.end('No baseline available, you cannot run clean command')
  }else {
    mutationRunner.clean();
    res.end('".sumo" directory deleted')
  }
});

app.post("/deleteResume", function(req,res){
  if (!(fs.existsSync('./.resume'))) {
    res.end('No baseline available, you cannot run clean command')
  }else {
    utils.cleanResumeFromGUI();
    res.end('".resume" directory deleted')
  }
});

app.post("/preflight", function(req,res){
  mutationRunner.preflight();
  res.end('Preflight executed')
});

app.post("/mutate", function(req,res){

  mutationRunner.mutate();
  res.end('Mutations applied')
});

app.post("/test", function(req,res){
  mutationRunner.test()
  res.end("I'm running test, check your console...")
});

app.post("/restore", function(req,res){
  if (!(fs.existsSync(config.baselineDir))) {
    res.end('No baseline available, you cannot run restore command')
  }else {
    mutationRunner.restore();
    res.end('Contracts restored')
  }});

app.post("/enableOperator:id", function(req,res){
  const operator=req.params.id;
  mutationRunner.enable(operator);
  res.end()
});
app.post("/disableOperator:id", function(req,res){
  const operator=req.params.id;
  mutationRunner.disable(operator);
  res.end()
});

/**
 * This post request method allow rewriting 'confing.js' file that contains projects' setting.
 */
app.post('/saveOptions',function(req,res){
  const absoluteSumoDir = req.query.absoluteSumoDir;
  const targetDir = req.query.targetDir;
  const contractsDir = req.query.contractsDir;
  const testDir = req.query.testDir;
  const compiledDir = req.query.compiledDir;
  const arrayIgnore=req.query.ignore.split(",");
  const ganache=req.query.ganache;
  const optimized=req.query.optimized;
  const tce=req.query.tce;
  const customTestScript=req.query.customTestScript;
  const testingTimeOutInSec=req.query.testingTimeOutInSec;
  const regressionTestingActived=req.query.regrTest;

  fs.writeFileSync('./src/config.js',"module.exports ={\n absoluteSumoDir: \'" +absoluteSumoDir+ "\',\n sumoDir: \'.sumo\',\nbaselineDir: \'.sumo/baseline\',\n killedDir: \'.sumo/killed\',\n liveDir: \'.sumo/live\',\n mutantsDir: \'.sumo/mutants\',\n contractsGlob: \'/**/*.sol\',\n targetDir: \'"+targetDir+"\',\n contractsDir: \'"+contractsDir+"\',\n testDir: \'"+testDir+"\',\n compiledDir: \'"+compiledDir+"\',\n ignore: ["+handleIgnore(arrayIgnore)+"],\n testConfigGlob: ["+"\'/truffle-config.js\', \'/hardhat.config.js\', \'/hardhat.config.ts\'"+"],\n packageManagerGlob: ["+"\'/package-lock.json\', \'/yarn.lock\'"+"],\n ganache: "+ganache+",\n optimized: "+optimized+",\n tce: "+tce+",\n customTestScript: "+customTestScript+",\n regressionTestingActived: "+regressionTestingActived+",\n testingTimeOutInSec: "+testingTimeOutInSec+",\n skipTests: [''],\n  testsGlob: '/**/*.{js,sol,ts}',\nresumeDir: '',\n}")
  res.end()
});

/**
 * This get request method provides to find automatically contracts in directory and subdirectory. It also provides to select contracts' path to ignore.
 */
app.get('/getIgnores',function(req,res) {
  const queryPath=req.query.path
  let data=""

  function *walkSync(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        yield* walkSync(path.join(dir, file.name));
      } else {
        yield path.join(dir, file.name);
      }
    }
  }

  try {
    for (const filePath of walkSync(queryPath)) {
      data = data.concat(filePath + ",")
    }
    res.end(data)
  }
  catch (err){
    res.end("file not found")
  }
})

/**
 * This get request methods provides to return data of the two main report.
 */
app.get('/getReport',function(req,res) {
  try {
    const data=fs.readFileSync('./.sumo/report.txt', 'binary')
    res.end(data)
  }
  catch (err) {
    res.end("File not found")
  }
})

app.get('/getRegressionReport',function(req,res) {
  try {
    const data=fs.readFileSync('./.resume/report.txt', 'binary')
    res.end(data)
  }
  catch (err) {
    res.end("File not found")
  }
})

app.get('/getCSVReport',function(req,res) {
  try {
    const data=fs.readFileSync('./.resume/report.csv', 'binary')
    res.end(data)
  }
  catch (err) {
    res.end("File not found")
  }
})

app.get('/getOperatorsReport',function(req,res) {
  try {
    const data=fs.readFileSync('./.sumo/operators.xlsx', 'binary')
    res.end(data)
  }
  catch (err) {
    res.end("File not found")
  }
})



function handleIgnore(ignore){
  const array=[]
  for (let item of ignore){
    item="'"+item+"'";
    array.push(item)
  }
  return array;
}




