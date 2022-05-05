const Mutation = require("../mutation");

function LSCOperator() {
}

LSCOperator.prototype.ID = "LSC";
LSCOperator.prototype.name = "loop-statement-change";

LSCOperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];

  visit({
    ForStatement: (node) => {
      let rule = "LSC-t1r1"
      let rule2 = "LSC-t1r2"
      var start = node.conditionExpression.range[0];
      var end = node.conditionExpression.range[1];
      mutations.push(new Mutation(file, start, end + 1, "true", this.ID, rule));
      mutations.push(new Mutation(file, start, end + 1, "false", this.ID, rule2));
    }
  }),
    visit({
      WhileStatement: (node) => {
        let rule3 = "LSC-t2r1"
        let rule4 = "LSC-t2r2"
        var start = node.condition.range[0];
        var end = node.condition.range[1];
        mutations.push(new Mutation(file, start, end + 1, "true", this.ID, rule3));
        mutations.push(new Mutation(file, start, end + 1, "false", this.ID, rule4));
      }
    });

  return mutations;
};

module.exports = LSCOperator;
