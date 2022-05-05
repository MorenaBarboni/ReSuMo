const Mutation = require("../mutation");

function CSCOperator() {
}

CSCOperator.prototype.ID = "CSC";
CSCOperator.prototype.name = "conditional-statement-change";

CSCOperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];

  visit({
    IfStatement: (node) => {
      var start = node.condition.range[0];
      var end = node.condition.range[1];
      let rule = "CSC-t1r1";
      let rule2 = "CSC-t1r2";

      mutations.push(new Mutation(file, start, end + 1, "true", this.ID, rule));
      mutations.push(new Mutation(file, start, end + 1, "false", this.ID, rule2));

      if (node.falseBody && !node.falseBody.trueBody) { //If this is the last falseBody (else block)
       let rule = "CSC-t2r1";
        start = node.trueBody.range[1] + 1;
        end = node.falseBody.range[1];
        var text = source.slice(start, end + 1);
        var replacement = "/*" + text + "*/";
        mutations.push(new Mutation(file, start, end + 1, replacement, this.ID, rule));
      }

    }
  });

  return mutations;
};

module.exports = CSCOperator;
