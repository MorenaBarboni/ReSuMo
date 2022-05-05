const Mutation = require("../mutation");

function OMDOperator() {
}

OMDOperator.prototype.ID = "OMD";
OMDOperator.prototype.name = "overridden-modifier-deletion";

OMDOperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];

  visit({
    ContractDefinition: (node) => {
      if (node.baseContracts.length > 0)
        visit({
          ModifierDefinition: (node) => {
            if (node.override) {
              var start = node.range[0];
              var end = node.range[1] + 1;
              var text = source.slice(start, end);
              replacement = "/*" + text + "*/";
              let rule = "OMD-t1r1"
              mutations.push(new Mutation(file, start, end, replacement, this.ID, rule));
            }
          }
        });
    }
  });

  return mutations;
};

module.exports = OMDOperator;
