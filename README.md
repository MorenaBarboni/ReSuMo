# ReSuMo

ReSuMo is a mutation testing tool for Solidity Smart Contracts. 

It advances the functionalities of the [SuMo](https://github.com/MorenaBarboni/SuMo-SOlidity-MUtator) tool through:
1. a static, file-level regression testing mechanism for evolving projects
2. the usage of the Trivial Compiler Equivalence (TCE) for automatically detecting and discarding mutant equivalencies

ReSuMo was designed to run mutation testing on Solidity projects in a NodeJS environment. It relies on the interface of the [Truffle](https://github.com/trufflesuite/truffle) testing framework to compile the mutants and run the tests, and it automatically spawns [Ganache](https://github.com/trufflesuite/ganache) instances to guarantee a clean-room testing environment between mutants.

## Installation
To install ReSuMo run ```npm install```.

## Configuration
Before using ReSuMo you must specify your desired configuration in the [config.js](https://github.com/MorenaBarboni/ReSuMo/blob/main/src/config.js) file.

##### 1) ReSuMo directories
These fields determine where ReSuMo stores data during the mutation testing process. Most paths are already set by default:
* ```sumoDir```: path of the directory where ReSuMo must save the mutation testing artifacts (.sumo by default)
* ```absoluteSumoDir```: absolute path of the sumoDir
* ```resumeDir```: path of the directory where ReSuMo must save the regression testing artifacts (.resume by default)
* ```baselineDir```: path of the directory where ReSuMo must save the baseline of the SUT (.sumo/baseline by default)
* ```killedDir```: path of the directory where ReSuMo must save the killed mutations (.sumo/killed by default)
* ```liveDir```: path of the directory where ReSuMo must save the live mutations (.sumo/live by default)
* ```mutantsDir```: path of the directory where ReSuMo must (optionally) save a copy of each mutated contract (.sumo/mutants by default)

##### 2) SUT directories
These fields specify the path to different artefacts of the System Under Test:
* ```targetDir```: path of the root directory of the SUT where the package.json is located
* ```contractsDir```: path of the directory where the contracts to be mutated are located
* ```testDir```: path of the directory where the tests to be evaluated are located
* ```buildDir```: path of the directory where Truffle saves the .json file containing the bytecode of the compiled contract(s).
 
##### 3) Mutation Process
These fields allow to set up the mutation testing process

* ```skipContracts```:  array of paths to contract files (or contract folders) that must be ignored by ReSuMo during mutation testing
* ```skipTests```:   array of paths to test files that must not be run by ReSuMo during regression mutation testing
* ```testUtils```:   array of paths to utility test files that must not be deleted by ReSuMo during regression mutation testing
* ```ganache```: automatically spawn Ganache instances during the testing process (true by default)
* ```optimized```: employ operator optimizations (true by default),
* ```tce```: apply the TCE (true by default). Note that projects that are not Truffle-based currently require a manual instrumentation of the test configuration file. 
* ```customTestScript```: use a custom test script specified in the package.json of the SUT, instead of relying on the Truffle interface (false by default)
* ```regression```: enable regression mutation testing (false by default),
* ```testingTimeOutInSec```: number of seconds after which a mutant is marked as timed-out during testing (300 by default)


## CLI Usage

#### Selecting Mutation Operators
Before starting the mutation process you can choose which mutation operators to use:
* ```npm run sumo list``` shows the currently enabled mutation operators
* ```npm run sumo enable``` enables all the mutation operators
* ```npm run sumo enable ID``` enables the mutation operator ID
* ```npm run sumo disable``` disables all the mutation operators
* ```npm run sumo disable ID``` disables the mutation operator ID

#### Viewing the available mutations
Once everything is set up you can use:
* ```npm run sumo preflight``` To view the available mutations and save a preliminary report  to ./sumo/report.txt
* ```npm run sumo mutate``` To view the available mutations, save a preliminary report  to ./sumo/report.txt, and save a copy of each mutant to ./sumo/mutants

#### Running Mutation Testing
Use:
* ```npm run sumo test``` To launch the mutation testing process;
* ```npm run sumo restore``` To restore the SUT files to a clean version if you suddenly interrupt the mutation process

#### Running Regression Mutation Testing
Regression mutation testing is automatically performed when the ``regression`` flag is set to true. You can simply run  ```sumo test```, and ReSuMo will analyze the SUT to:
1. mutate contract files impacted by the latest changes
2. re-run the test files impacted by the latest changes or the test files that exercise evolved contracts

#### Test Reports
ReSuMo stores test reports and other data in two different folders:
*  ```.sumo```: includes the final test reports and other artifacts (e.g., mutations) that are generated during the mutation testing process
*  ```.resume```: includes the reports generated by the regression mutation testing module

Use:
* ```npm run sumo cleanSumo``` to delete the ```.sumo``` folder;
* ```npm run sumo cleanResume``` to delete the ```.resume``` folder

## GUI Usage

To start the GUI:
* ```npm start```

## Mutation Operators 👾

ReSuMo inherits the mutation operators implemented by [SuMo](https://github.com/MorenaBarboni/SuMo-SOlidity-MUtator).

SuMo includes currently 25 Solidity-specific operators and 19 general operators, some of which foresee an Optimized version.

* The standard, **Non-Optimized** operators include extended mutation rules capable of generating a more comprehensive collection of mutants. The Non-Opt operators guarantee higher reliability at the price of a more expensive and time-consuming mutation testing process. 
* The **Optimized** operators consist of simplified rules to limit the generation of likely subsumed mutants and speed up the testing process.


### Traditional Operators
| Operator | Description | Optimization Available |
| ------ | ------ | :----: |
| ACM| Argument Change of overloaded Method call | N |
| AOR | Assignment Operator Replacement | Y |
| BCRD | Break and Continue Replacement and Deletion | N |
| BLR | Boolean Literal Replacement | N |
| BOR | Binary Operator Insertion | Y |
| CBD | Catch Block Deletion | N |
| CSC | Conditional Statement Change | N |
| ER | Enum Replacemet | Y |
| ECS | Explicit Conversion to Smaller type | N |
| HLR | Hexadecimal Literal Replacement | N |
| ICM | Increments Mirror | N |
| ILR | Integer Literal Replacement | N |
| LCS | Loop Statement Change | N |
| OLFD | Overloaded Function Deletion | N |
| ORFD | Overridden Function Deletion | N |
| SKI | Super Keyword Insertion | N |
| SKD | Super Keyword Deletion | N |
| SLR | String Literal Replacement | N |
| UORD | Unary Operator Replacement and Deletion | N |

### Solidity Operators
|Operator | Description | Optimization Available |
| ------ | ------ | :----: |
| AVR | Address Value Replacement | N |
| CSC | Contract Constructor Deletion | N |
| DLR | Data Location Keyword Replacement | N |
| DOD | Delete Operator Deletion | N |
| ETR | Ether Transfer function Replacement | N |
| EED |  Event Emission Deletion | N |
| EHC | Exception Handling Change | N |
| FVR | Function Visibility Replacement | Y |
| GVR | Global Variable Replacement | Y |
| MCR | Mathematical and Cryptographic function Replacement | N |
| MOD | Modifier Deletion | N |
| MOI | Modifier Insertion | N |
| MOC | Modifier Order Change | N |
| MOC | Modifier Order Change | N |
| MOR | Modifier Replacement | N |
| PKD | Payable Keyword Deletion | N |
| RSD | Return Statement Deletion | N |
| RVS | Return Values Swap | Y |
| SFD | Selfdestruct Deletion | N |
| SFI | Selfdestruct Insertion | N |
| SFR | SafeMath Function Replacement | Y |
| SCEC | Switch Call Expression Casting | N |
| TOR | Transaction Origin Replacement | N |
| VUR | Variable Unit Replacement | Y |
| VVR | Variable Visibility Replacement | Y |
