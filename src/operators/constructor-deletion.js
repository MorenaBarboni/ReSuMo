const Mutation = require("../mutation");

function CCDOperator() {
}

CCDOperator.prototype.ID = "CCD";
CCDOperator.prototype.name = "contract-constructor-deletion";

CCDOperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];

  visit({
    FunctionDefinition: (node) => {
      if (node.isConstructor) {
        let rule = "CCD-t1r1";
        const start = node.range[0];
        const end = node.range[1];

        const text = source.slice(start, end + 1);
        const replacement = "/* " + text + " */";
        mutations.push(new Mutation(file, start, end + 1, replacement, this.ID, rule));
      }
    }
  });
  return mutations;
};

module.exports = CCDOperator;
