const Mutation = require("../mutation");

function MODOperator() {
}

MODOperator.prototype.ID = "MOD";
MODOperator.prototype.name = "modifier-deletion";

MODOperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];

  visit({
    FunctionDefinition: (node) => {
      let replacement;
      if (node.modifiers.length > 0) {
        var functionSignature = source.substring(node.range[0], node.range[1]);
        node.modifiers.forEach(m => {
          let rule = "MOD-t1r1"
          var mod = source.slice(m.range[0], m.range[1] + 1);
          replacement = functionSignature.replace(mod, "");
          mutations.push(new Mutation(file, node.range[0], node.range[1], replacement, this.ID, rule));
        });
      }
    }
  });
  return mutations;
};

module.exports = MODOperator;
