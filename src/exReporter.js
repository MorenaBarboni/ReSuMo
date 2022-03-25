var excel = require("excel4node");
const fs = require("fs");
const config = require("./config");
const configFileName = "./operators.config.json";
const configFile = require(configFileName);


function exReporter() {
  this.operators = Object.entries(configFile);
  this.killed = [];
  this.live = [];
  this.stillborn = [];
  this.equivalent = [];
  this.redundant=[]
  this.timedout = []
}

exReporter.prototype.mutantStatus = function(mutant) {
  switch (mutant.status) {
    case "killed":
      this.killed.push(mutant);
      break;
    case "live":
      this.live.push(mutant);
      break;
    case "stillborn":
      this.stillborn.push(mutant)
      break;
    case "equivalent":
      this.equivalent.push(mutant);
      break;
    case "redundant":
      this.redundant.push(mutant);
      break;
    case "timedout":
      this.timedout.push(mutant);
      break;
  }

  exReporter.prototype.mutantKilled = function(mutant) {
    this.live.push(mutant);
  };

  exReporter.prototype.restore = function(){
    this.killed = [];
    this.live = [];
    this.stillborn = [];
    this.equivalent = [];
    this.redundant=[]
    this.timedout = []
  };

  exReporter.prototype.saveData = function() {

    var workbook = new excel.Workbook
    var worksheet = workbook.addWorksheet("Sheet 1");

    var headerStyle = workbook.createStyle({
      font: {
        color: "#000000",
        size: 12,
        bold: true
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        bgColor: "#e9e2d2",
        fgColor: "#e9e2d2"
      }
    });

    var operatorStyle = workbook.createStyle({
      font: {
        color: "#000000",
        size: 10,
        bold: true
      }
    });

    // Set Headers
    worksheet.cell(1, 1)
      .string("Operator")
      .style(headerStyle);

    worksheet.cell(1, 2)
      .string("Total")
      .style(headerStyle);

    worksheet.cell(1, 3)
      .string("Equivalent")
      .style(headerStyle);

    worksheet.cell(1, 4)
      .string("Redundant")
      .style(headerStyle);

    worksheet.cell(1, 5)
      .string("Valid")
      .style(headerStyle);

    worksheet.cell(1, 6)
      .string("Killed")
      .style(headerStyle);

    worksheet.cell(1, 7)
      .string("Live")
      .style(headerStyle);

    worksheet.cell(1,8)
      .string("Timedout")
      .style(headerStyle)

    worksheet.cell(1,9)
      .string("Stillborn")
      .style(headerStyle)

    worksheet.cell(1, 10)
      .string("Mutation Score")
      .style(headerStyle);

    worksheet.cell(1, 11)
      .string("time")
      .style(headerStyle);
    for (var i = 0; i < this.operators.length; i++) {
      worksheet.cell(i + 2, 1)
        .string(this.operators[i])
        .style(operatorStyle);
    }

    var style = workbook.createStyle({
      font: {
        color: "#000000",
        size: 10
      }
    });

    //Retrieve list of killed mutants for each operator
    var operators = Object.entries(configFile);
    for (var i = 0; i < operators.length; i++) {
      var time=0
      var operatorKilled = this.killed.filter(mutant => mutant.operator === operators[i][0]);
      var operatorLive = this.live.filter(mutant => mutant.operator === operators[i][0]);
      var operatorStillborn = this.stillborn.filter(mutant => mutant.operator === operators[i][0]);
      var operatorEquivalent = this.equivalent.filter(mutant => mutant.operator === operators[i][0]);
      var operatorRedundant = this.redundant.filter(mutant => mutant.operator === operators[i][0]);
      var operatorTimedout = this.timedout.filter(mutant => mutant.operator === operators[i][0]);
      this.killed.filter(mutant=> {if(mutant.operator===operators[i][0]){
        time=time+mutant.time
      }})
      this.live.filter(mutant=> {if(mutant.operator===operators[i][0]){
        time=time+mutant.time
      }})
      worksheet.cell(i + 2, 2)
        .number(operatorKilled.length + operatorLive.length + operatorEquivalent.length + operatorRedundant.length + operatorTimedout.length + operatorStillborn.length)
        .style(style);

      worksheet.cell(i + 2, 3)
        .number(operatorEquivalent.length)
        .style(style);

      worksheet.cell(i + 2, 4)
        .number(operatorRedundant.length)
        .style(style)

      worksheet.cell(i + 2, 5)
        .number(operatorKilled.length + operatorLive.length)
        .style(style);

      worksheet.cell(i + 2, 6)
        .number(operatorKilled.length)
        .style(style);

      worksheet.cell(i + 2, 7)
        .number(operatorLive.length)
        .style(style);

      worksheet.cell(i + 2, 8)
        .number(operatorTimedout.length)
        .style(style);

      worksheet.cell(i + 2, 9)
        .number(operatorStillborn.length)
        .style(style);

      var ms = (operatorKilled.length / (operatorKilled.length + operatorLive.length)) * 100;
      if (!isNaN(ms)) {
        worksheet.cell(i + 2, 10)
          .number(ms)
          .style(style);
      }
      worksheet.cell(i + 2, 11)
        .number(time/60000)
        .style(style)
      workbook.write("./.sumo/operators.xlsx");
    }
  };
};

module.exports = exReporter;
