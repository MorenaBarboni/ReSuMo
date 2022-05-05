const Mutation = require("../mutation");

function TOROperator() {
}

TOROperator.prototype.ID = "TOR";
TOROperator.prototype.name = "transaction-origin-replacement";

TOROperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];

  visit({
    MemberAccess: (node) => {
      if ((node.memberName == "origin")) {
        let rule =  "TOR-t1r1"
        mutations.push(new Mutation(file, node.range[0], node.range[1] + 1, "msg.sender", this.ID, rule));
      } else if (node.memberName == "sender") {
        let rule2 =  "TOR-t2r1"
        mutations.push(new Mutation(file, node.range[0], node.range[1] + 1, "tx.origin", this.ID, rule2));
      }
    }
  });

  return mutations;
};
module.exports = TOROperator;
