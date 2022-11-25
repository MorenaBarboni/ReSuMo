<p align="center">
      <img src="https://github.com/MorenaBarboni/ReSuMo/blob/main/src/SuMo-logos/Resumo.png?raw=true" alt="ReSuMo" style="max-width:100%;" width="350">
</p>


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
* ```absoluteArtifactsDir```: absolute path of the artifactsDir
* ```baselineDir```: path of the directory where ReSuMo must save the baseline of the SUT (.sumo/baseline by default)
* ```resultsDir```: path of the directory where ReSuMo must save results (.sumo/results by default)
* ```artifactsDir```: path of the directory where ReSuMo must save the artifacts of regression testing (.sumo/artifacts by default)
  

##### 2) SUT directories
These fields specify the path to different artefacts of the System Under Test:
* ```targetDir```: path of the root directory of the SUT where the package.json is located
* ```contractsDir```: path of the directory where the contracts to be mutated are located
* ```testDir```: path of the directory where the tests to be evaluated are located
* ```buildDir```: path of the directory where Truffle saves the .json file containing the bytecode of the compiled contract(s).
 
##### 3) Mutation Process
These fields allow to set up the mutation testing process
* ```bail```: bail after the first test failure (false by default)
* ```customTestScript```: use a custom test script specified in the package.json of the SUT, instead of relying on the Truffle interface (false by default). Note that if ```customTestScript``` is true you must specify a ```test``` and ```compile``` script in your ```package.json``` file. Moreover, the ```bail``` option is ignored; it must be added to the custom test script itself.
* ```ganache```: automatically spawn Ganache instances during the testing process (true by default)
* ```optimized```: employ operator optimizations (true by default),
* ```regression```: enable regression mutation testing (false by default). Note that if ```regression``` is true the ```bail``` option is disabled to run regression mutation testing. 
* ```skipContracts```:  array of paths to contract files (or contract folders) that must be ignored by ReSuMo during mutation testing
* ```skipTests```:   array of paths to test files that must not be run by ReSuMo during regression mutation testing. 
* ```tce```: apply the TCE (true by default). Note that projects that are not Truffle-based currently require a manual instrumentation of the test configuration file. 
* ```testingTimeOutInSec```: number of seconds after which a mutant is marked as timed-out during testing (300 by default)
* ```testUtils```:   array of paths to utility test files that must not be deleted by ReSuMo during regression mutation testing

##### 4) Trivial Compiler Equivalence

The Trivial Compiler Equivalence compares the bytecode produced by the compiler to detect equivalences between mutants, thus it can only work if:
1. the solc compiler optimization is enabled;
2. no metadata hash is appended to the contract bytecode.

To this end, ReSuMo automatically adds the necessary fields to your Truffle configuration file. However, if you are using a different testing framework (e.g, Hardhat) you must manually add the following options to the configuration file: 

```
 compilers: {
        solc: {
            optimizer: {
                enabled: true,
                ...
            },
	      metadata: {
                bytecodeHash: "none"
            }
        }
    }
```

##### 4) Regression Mutation Testing

ReSuMo relies on the [mochawesome](https://github.com/adamgruber/mochawesome) reporter to save test reports and enable regression mutation testing. To use mochawesome, ReSuMo automatically adds the necessary fields to your Truffle configuration file.
If you are using a different testing framework (e.g, Hardhat) you must manually add the following options to the configuration file: 

```
mocha : {
      reporter: "mochawesome",
      reporterOptions: {
            reportDir: absoluteArtifactsDir + "/mochawesome-report",
            html: false
      }
}
```

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
* ```npm run sumo preflight``` To view the available mutations and save a preliminary report  to ./sumo/results/report.txt
* ```npm run sumo mutate``` To view the available mutations, save a preliminary report  to ./sumo/results/report.txt, and save a copy of each mutant to ./sumo/results/mutants

#### Running Mutation Testing
Use:
* ```npm run sumo test``` To launch the mutation testing process;
* ```npm run sumo restore``` To restore the SUT files to a clean version if you suddenly interrupt the mutation process

Note that the restore command overwrites the content of the project under test with the files stored in the ```.sumo/baseline``` folder.
If you need to restore the project files, make sure to do so before performing other operations as the baseline is automatically refreshed on subsequent preflight or test runs.

#### Running Regression Mutation Testing
Regression mutation testing is automatically performed when the ``regression`` flag is set to true. You can simply run  ```sumo test```, and ReSuMo will analyze the SUT to:
1. mutate contract files impacted by the latest changes
2. re-run the test files impacted by the latest changes or the test files that exercise evolved contracts

#### Test Reports and artifacts
ReSuMo stores test reports and other data in the ```.sumo``` folder:
* ```.sumo/artifacts```: contains the artifacts generated during regression mutation testing (e.g., file checksums, file dependencies and the mochawesome test reports). These are necessary to keep track of the project evolution and to integrate the mutation testing results.
*  ```.sumo/baseline```: contains a copy of the project baseline for restoring the original files of the SUT.
*  ```.sumo/results```: stores the final test reports and other artifacts (e.g., mutations) that are generated during the testing process.

Use:
* ```npm run sumo cleanSumo``` to delete the ```.sumo``` folder;
* ```npm run sumo cleanResume``` to delete the ```.sumo/artifacts``` folder

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


### Publications

To cite ReSuMo, please use the following:

```
@InProceedings{10.1007/978-3-031-14179-9_5,
author="Barboni, Morena and Casoni, Francesco and Morichetta, Andrea and Polini, Andrea",
title="ReSuMo: Regression Mutation Testing for Solidity Smart Contracts",
booktitle="Quality of Information and Communications Technology",
year="2022",
publisher="Springer International Publishing",
address="Cham",
pages="61--76"
}

```