const Mutation = require("../mutation");

function SFDOperator() {
}

SFDOperator.prototype.ID = "SFD";
SFDOperator.prototype.name = "selfdestruct-function-deletion";

SFDOperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];
  visit({
    FunctionCall: (node) => {
      if (node.expression.name == "selfdestruct") {
        const start = node.range[0];
        const temp = source.slice(start);
        const delimiter = temp.indexOf(";");
        const end = start + delimiter;
        const text = source.slice(start, end + 1);
        let rule =  "SFD-t1r1"
        mutations.push(new Mutation(file, start, end + 1, "/* " + text + " */", this.ID, rule));
      }
    }
  });
  return mutations;
};

module.exports = SFDOperator;
