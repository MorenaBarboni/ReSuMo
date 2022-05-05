const Mutation = require("../mutation");

function ICMOperator() {
}

ICMOperator.prototype.ID = "ICM";
ICMOperator.prototype.name = "increments-mirror";

ICMOperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];

  visit({
    BinaryOperation: (node) => {
      const start = node.left.range[1] + 1;
      const end = node.right.range[0];
      const text = source.slice(start, end);

      let replacement;

      if (node.operator == "-=") {
        replacement = text.replace("-=", "=-");
      }

      if (replacement) {
        let rule = "ICM-t1r1"
        mutations.push(new Mutation(file, start, end, replacement, this.ID, rule));
      }
    }
  });

  return mutations;
};

module.exports = ICMOperator;
