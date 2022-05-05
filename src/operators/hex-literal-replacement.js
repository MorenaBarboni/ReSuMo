const Mutation = require("../mutation");

function HLRoperator() {
}

HLRoperator.prototype.ID = "HLR";
HLRoperator.prototype.name = "hexadecimal-literal-replacement";

HLRoperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];
  var prevRange;

  visit({
    HexLiteral: (node) => {
      if (prevRange != node.range) { //Avoid duplicate mutants
        if (node.value) {
          var randomHex = Math.floor(Math.random() * 16777215).toString(16);
          let rule = "HLR-t1r1"
          let rule2 = "HLR-t1r2"
          mutations.push(new Mutation(file, node.range[0], node.range[1] + 1, "hex\"0\"", this.ID, rule));
          mutations.push(new Mutation(file, node.range[0], node.range[1] + 1, "hex\"" + randomHex + "\"", this.ID, rule2));
        }
      }
      prevRange = node.range;
    }
  });
  return mutations;
};

module.exports = HLRoperator;
