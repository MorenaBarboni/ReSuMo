const fs = require('fs')
const configFileName = '../operators.config.json'
const configFile = require(configFileName)
const config = require('../config')

const Reporter = require('../reporter')
const reporter = new Reporter()

//Init operator version
var AOROperator
var BOROperator
var EROperator
var FVROperator
var GVROperator
var RVSOperator
var SFROperator
var VUROperator
var VVROperator

if (config.optimized) {
  AOROperator = require('./assignment-replacement')
  BOROperator = require('./binary-replacement')
  EROperator = require('./enum-replacement')
  FVROperator = require('./function-visibility-replacement')
  GVROperator = require('./global-variable-replacement')
  RVSOperator = require('./return-values-swap')
  SFROperator = require('./safemath-function-replacement')
  VUROperator = require('./variable-unit-replacement')
  VVROperator = require('./variable-visibility-replacement')

} else {
  AOROperator = require('./non-optimized/assignment-replacement')
  BOROperator = require('./non-optimized/binary-replacement')
  EROperator = require('./non-optimized/enum-replacement')
  FVROperator = require('./non-optimized/function-visibility-replacement')
  GVROperator = require('./non-optimized/global-variable-replacement')
  RVSOperator = require('./non-optimized/return-values-swap')
  SFROperator = require('./non-optimized/safemath-function-replacement')
  VUROperator = require('./non-optimized/variable-unit-replacement')
  VVROperator = require('./non-optimized/variable-visibility-replacement')

}

const ACMOperator = require('./argument-change-overloaded-call')
const AVROperator = require('./address-value-replacement')
const BCRDOperator = require('./break-continue-replacement')
const BLROperator = require('./boolean-literal-replacement')
const CBDOperator = require('./catch-block-deletion')
const CCDOperator = require('./constructor-deletion')
const CSCOperator = require('./conditional-statement-change')
const DLROperator = require('./data-location-replacement')
const DODOperator = require('./delete-operator-deletion')
const ECSOperator = require('./explicit-conversion-smaller')
const EEDOperator = require('./event-emission-deletion')
const EHCOperator = require('./exception-handling-change')
const ETROperator = require('./ether-transfer-function-replacement')
const ICMOperator = require('./increments-mirror')
const ILROperator = require('./integer-literal-replacement')
const LSCOperator = require('./loop-statement-change')
const HLROperator = require('./hex-literal-replacement')
const MCROperator = require('./math-crypto-function-replacement')
const MOCOperator = require('./modifier-order-change')
const MODOperator = require('./modifier-deletion')
const MOIOperator = require('./modifier-insertion')
const MOROperator = require('./modifier-replacement')
const OLFDOperator = require('./overloaded-function-deletion')
const OMDOperator = require('./overridden-modifier-deletion')
const ORFDOperator = require('./overridden-function-deletion')
const PKDOperator = require('./payable-deletion')
const RSDOperator = require('./return-statement-deletion')
const SCECOperator = require('./switch-call-expression-casting')
const SFDOperator = require('./selfdestruct-deletion')
const SFIOperator = require('./selfdestruct-insertion')
const SKDOperator = require('./super-keyword-deletion')
const SKIOperator = require('./super-keyword-insertion')
const SLROperator = require('./string-literal-replacement')
const TOROperator = require('./transaction-origin-replacement')
const UORDOperator = require('./unary-replacement')

function CompositeOperator(operators) {
  this.operators = operators
}

/**
 * Generates the mutations and saves them to report.
 * @param {*} file the path of the smart contract to be mutated
 * @param {*} source the content of the smart contract to be mutated
 * @param {*} visit the visitor
 * @param {*} overwrite  overwrite the generated mutation reports
 * @returns 
 */
CompositeOperator.prototype.getMutations = function (file, source, visit, overwrite) {
  let mutations = [];
  var fileString = "\n Mutants generated for file: " + file + ": \n";
  var mutantString = "";

  for (const operator of this.operators) {

    var enabled = Object.entries(configFile)
      .find(pair => pair[0] === operator.ID && pair[1] === true);

    if (enabled) {
      var opMutations = operator.getMutations(file, source, visit);
      if (overwrite) {
        opMutations.forEach(m => {
          mutantString = mutantString + "- Mutant " + m.hash() + " was generated by " + operator.ID + " (" + operator.name + "). \n";
        });
      }
      mutations = mutations.concat(opMutations);
    }
  }

  if (overwrite && mutantString != "") {
    reporter.saveGeneratedMutants(fileString, mutantString);
  }
  return mutations;
}

//Retrieve list of enabled mutation operators
CompositeOperator.prototype.getEnabledOperators = function () {
  var enabled = Object.entries(configFile)
    .filter(pair => pair[1] === true);

  var printString = "Enabled mutations operators:";
  for (const pair of enabled) {
    printString = printString + '\n  - ' + pair[0];
  }
  if (printString === "Enabled mutations operators:")
    printString = printString + "\nNone"
  return printString
}

//Enables a mutation operator
CompositeOperator.prototype.enable = function (ID) {
  var exists = Object.entries(configFile)
    .find(pair => pair[0] === ID);

  if (exists) {
    configFile[ID] = true;
    fs.writeFileSync('./src/operators.config.json', JSON.stringify(configFile, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });
    return true;
  }
  return false;
}

//Enables all mutation operators
CompositeOperator.prototype.enableAll = function () {
  Object.entries(configFile).forEach(pair => {
    configFile[pair[0]] = true;
  });
  fs.writeFileSync('./src/operators.config.json', JSON.stringify(configFile, null, 2), function writeJSON(err) {
    if (err) return false;
  });
  return true
}

//Disables a mutation operator
CompositeOperator.prototype.disable = function (ID) {
  var exists = Object.entries(configFile)
    .find(pair => pair[0] === ID);

  if (exists) {
    configFile[ID] = false;
    fs.writeFileSync('./src/operators.config.json', JSON.stringify(configFile, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
    });
    return true;
  }
  return false;
}

//Disables all mutation operators
CompositeOperator.prototype.disableAll = function () {
  Object.entries(configFile).forEach(pair => {
    configFile[pair[0]] = false;
  });
  fs.writeFileSync('./src/operators.config.json', JSON.stringify(configFile, null, 2), function writeJSON(err) {
    if (err) return false;
  });
  return true
}

module.exports = {
  ACMOperator: ACMOperator,
  AOROperator: AOROperator,
  AVROperator: AVROperator,
  BCRDOperator: BCRDOperator,
  BLROperator: BLROperator,
  BOROperator: BOROperator,
  CBDOperator: CBDOperator,
  CCDOperator: CCDOperator,
  CSCOperator: CSCOperator,
  DLROperator: DLROperator,
  DODOperator: DODOperator,
  ECSOperator: ECSOperator,
  EEDOperator: EEDOperator,
  EHCOperator: EHCOperator,
  EROperator: EROperator,
  ETROperator: ETROperator,
  FVROperator: FVROperator,
  GVROperator: GVROperator,
  HLROperator: HLROperator,
  ICMOperator: ICMOperator,
  ILROperator: ILROperator,
  LSCOperator: LSCOperator,
  MCROperator: MCROperator,
  MOCOperator: MOCOperator,
  MODOperator: MODOperator,
  MOIOperator: MOIOperator,
  MOROperator: MOROperator,
  OLFDOperator: OLFDOperator,
  OMDOperator: OMDOperator,
  ORFDOperator: ORFDOperator,
  PKDOperator: PKDOperator,
  RSDOperator: RSDOperator,
  RVSOperator: RVSOperator,
  SCECOperator: SCECOperator,
  SFDOperator: SFDOperator,
  SFIOperator: SFIOperator,
  SFROperator: SFROperator,
  SKDOperator: SKDOperator,
  SKIOperator: SKIOperator,
  SLROperator: SLROperator,
  TOROperator: TOROperator,
  UORDOperator: UORDOperator,
  VUROperator: VUROperator,
  VVROperator: VVROperator,
  CompositeOperator: CompositeOperator,
}
