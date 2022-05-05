# ReSuMO

ReSuMo is a mutation testing tool for Solidity Smart Contracts. 

It advances the functionalities of the [SuMo](https://github.com/MorenaBarboni/SuMo-SOlidity-MUtator) tool through:
1. a static, file-level regression testing mechanism for evolving projects
2. the usage of the Trivial Compiler Equivalence (TCE) for automatically detecting and discarding mutant equivalencies

ReSuMo was designed to run mutation testing on Solidity projects in a NodeJS environment. It relies on the interface of the [Truffle](https://github.com/trufflesuite/truffle) testing framework to compile the mutants and run the tests, and it automatically spawns [Ganache](https://github.com/trufflesuite/ganache) instances to guarantee a clean-room testing environment between mutants.

## Installation
To install ReSuMo simply run ```npm install```.

## Configuration
Before using ReSuMo you must specify your desired configuration in the ```./src/config.js``` file.

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

*  ```ignore```:  array of paths to contract files (or contract folders) that must be ignored by ReSuMo during mutation testing
* ```skipTests```:   array of paths to test files that must be ignored by ReSuMo during regression mutation testing
* ```ganache```: automatically spawn Ganache instances during the testing process (true by default)
* ```optimized```: employ operator optimizations (true by default),
* ```tce```: apply the TCE (true by default). Note that projects that are not Truffle-based currently require a manual instrumentation of the test configuration file. 
* ```customTestScript```: use a custom test script specified in the package.json of the SUT, instead of relying on the Truffle interface (false by default)
* ```regression```: enable regression mutation testing (false by default),
* ```testingTimeOutInSec```: number of seconds after which a mutant is marked as timed-out during testing (300 by default)


## Usage

#### Selecting Mutation Operators
Before starting the mutation process you can choose which mutation operators to use:
* ```sumo list``` shows the currently enabled mutation operators
* ```sumo enable``` enables all the mutation operators
* ```sumo enable ID``` enables the mutation operator ID
* ```sumo disable``` disables all the mutation operators
* ```sumo disable ID``` disables the mutation operator ID

#### Viewing the available mutations
Once everything is set up you can use:
* ```sumo preflight``` To view the available mutations and save a preliminary report  to ./sumo/report.txt
* ```sumo mutate``` To view the available mutations, save a preliminary report  to ./sumo/report.txt, and save a copy of each mutant to ./sumo/mutants

#### Running Mutation Testing
Use:
* ```sumo test``` To launch the mutation testing process;
* ```sumo restore``` To restore the SUT files to a clean version if you suddenly interrupt the mutation process

#### Running Regression Mutation Testing
Regression mutation testing is automatically performed when the ``regression`` flag is set to true. You can simply run  ```sumo test```, and ReSuMo will analyze the SUT to:
1. mutate contract files impacted by the latest changes
2. re-run the test files impacted by the latest changes or the test files that exercise evolved contracts

#### Test Reports
ReSuMo stores test reports and other data in two different folders:
*  ```.sumo```: includes the final test reports and other artifacts (e.g., mutations) that are generated during the mutation testing process
*  ```.resume```: includes the reports generated by the regression mutation testing module


## Mutation Operators 👾

ReSuMo inherits the mutation operators implemented by [SuMo](https://github.com/MorenaBarboni/SuMo-SOlidity-MUtator).

### Traditional Operators
| Operator | Description |
| ------ | ------ |
| ACM| Argument Change of overloaded Method call |
| AOR | Assignment Operator Replacement |
| BCRD | Break and Continue Replacement and Deletion |
| BLR | Boolean Literal Replacement |
| BOR | Binary Operator Insertion |
| CBD | Catch Block Deletion |
| CSC | Conditional Statement Change |
| ER | Enum Replacemet |
| ECS | Explicit Conversion to Smaller type |
| HLR | Hexadecimal Literal Replacement |
| ICM | Increments Mirror |
| ILR | Integer Literal Replacement |
| LCS | Loop Statement Change |
| OLFD | Overloaded Function Deletion |
| ORFD | Overridden Function Deletion |
| SKI | Super Keyword Insertion |
| SKD | Super Keyword Deletion |
| SLR | String Literal Replacement |
| UORD | Unary Operator Replacement and Deletion |

### Solidity Operators
|Operator | Description |
| ------ | ------ |
| AVR | Address Value Replacement |
| CSC | Contract Constructor Deletion |
| DLR | Data Location Keyword Replacement |
| DOD | Delete Operator Deletion |
| ETR | Ether Transfer function Replacement |
| EED |  Event Emission Deletion |
| EHC | Exception Handling Change |
| FVR | Function Visibility Replacement |
| GVR | Global Variable Replacement |
| MCR | Mathematical and Cryptographic function Replacement |
| MOD | Modifier Deletion |
| MOI | Modifier Insertion |
| MOC | Modifier Order Change |
| MOC | Modifier Order Change |
| MOR | Modifier Replacement |
| PKD | Payable Keyword Deletion |
| RSD | Return Statement Deletion |
| RVS | Return Values Swap |
| SFD | Selfdestruct Deletion |
| SFI | Selfdestruct Insertion |
| SFR | SafeMath Function Replacement |
| SCEC | Switch Call Expression Casting |
| TOR | Transaction Origin Replacement |
| VUR | Variable Unit Replacement |
| VVR | Variable Visibility Replacement |

