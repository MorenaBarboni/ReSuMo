const Mutation = require("../mutation");

function ILROperator() {
}

ILROperator.prototype.ID = "ILR";
ILROperator.prototype.name = "integer-literal-replacement";

ILROperator.prototype.getMutations = function(file, source, visit) {

  const ID = this.ID;
  const mutations = [];

  var prevRange;
  var ranges = []; //Visited node ranges

  //Visit arrays
  visit({
    TupleExpression: (node) => {
      if (node.isArray) {
        if (node.components[0] && node.components[0].type == "NumberLiteral") {
          if (!ranges.includes(node.range)) {
            //Array range
            ranges.push(node.range);
            //Mutate the first component and exclude subsequent components
            mutateIntegerLiteral(node.components[0]);
            node.components.forEach(e => {
              //Component range
              ranges.push(e.range);
            });
          }
        }
      }
    }
  });

  //Visit number literals
  visit({
    NumberLiteral: (node) => {
      if (!ranges.includes(node.range)) {
        ranges.push(node.range);
        mutateIntegerLiteral(node);
      }
      prevRange = node.range;
    }
  });

  //Apply mutations
  function mutateIntegerLiteral(node) {
    let value = node.number.toString();
    //Check if it is hex
    if (!value.match(/^0x[0-9a-f]+$/i)) {
      if (node.number % 1 == 0) {
        var subdenomination = "";
        if (node.subdenomination) {
          subdenomination = " " + node.subdenomination;
        }
        if (node.number == 1) {
          var sliced = source.slice(node.range[0] - 1, node.range[0]);
          if (sliced === "-")
            mutations.push(new Mutation(file, node.range[0] - 1, node.range[1] + 1, "0" + subdenomination, ID));
          else
            mutations.push(new Mutation(file, node.range[0], node.range[1] + 1, "0" + subdenomination, ID));
        } else if (node.number == 0) {
          mutations.push(new Mutation(file, node.range[0], node.range[1] + 1, "1" + subdenomination, ID));
        } else {
          var num = Number(node.number);
          var inc;
          var dec;

          

          if (num < Number.MAX_SAFE_INTEGER) {
            inc = num + 1;
            dec = num - 1;
          } else {           
            let num;
            let inc;
            let dec;
            //Scientific notation
            if (node.number.toString().includes('e')) {
              let arr = node.number.toString().split("e");

              let mantissa = arr[0]
              let exponential = arr[1]
              let incMant = BigInt(parseInt(mantissa));
              incMant = incMant + 1n;
              inc = incMant.toString() +'e'+exponential.toString()
              let decMant = BigInt(parseInt(mantissa));
              decMant = decMant - 1n;
              dec = decMant.toString() +'e'+exponential.toString()

            } else {
              num = BigInt(node.number);
              inc = BigInt(num + 1n);
              dec = BigInt(num - 1n);
            }
          }
          mutations.push(new Mutation(file, node.range[0], node.range[1] + 1, dec + subdenomination, ID));
          mutations.push(new Mutation(file, node.range[0], node.range[1] + 1, inc + subdenomination, ID));
        }
      }
    }
  }


  return mutations;
};

module.exports = ILROperator;
