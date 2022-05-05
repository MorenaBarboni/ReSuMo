const Mutation = require("../mutation");

function BCRDOperator() {
}

BCRDOperator.prototype.ID = "BCRD";
BCRDOperator.prototype.name = "break-continue-replacement-deletion";

BCRDOperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];

  visit({
    BreakStatement: (node) => {
      var start = node.range[0];
      var end = node.range[1];
      let rule = "BCRD-t1r1";
      let rule2 = "BLR-t1r2";
      mutations.push(new Mutation(file, start, end, "continue", this.ID, rule));
      mutations.push(new Mutation(file, start, end + 1, "", this.ID, rule2));

    }
  }),
    visit({
      ContinueStatement: (node) => {
        var start = node.range[0];
        var end = node.range[1];
        let rule = "BCRD-t2r1";
        let rule2 = "BLR-t2r2";
        mutations.push(new Mutation(file, start, end, "break", this.ID, rule));
        mutations.push(new Mutation(file, start, end + 1, "", this.ID, rule2));
      }
    });

  return mutations;
};

module.exports = BCRDOperator;
