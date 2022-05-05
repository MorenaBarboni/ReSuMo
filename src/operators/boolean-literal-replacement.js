const Mutation = require("../mutation");

function BLROperator() {
}

BLROperator.prototype.ID = "BLR";
BLROperator.prototype.name = "boolean-literal-replacement";

BLROperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];
  var prevRange;

  visit({
    BooleanLiteral: (node) => {
      if (prevRange != node.range) { //Avoid duplicate mutants
        if (node.value) {
         let rule = "BLR-t1r1";
         mutations.push(new Mutation(file, node.range[0], node.range[1] + 1, "false", this.ID, rule));
        } else {
         let rule = "BLR-t2r1";
         mutations.push(new Mutation(file, node.range[0], node.range[1] + 1, "true", this.ID, rule));
        }
      }
      prevRange = node.range;
    }
  });
  return mutations;
};

module.exports = BLROperator;
