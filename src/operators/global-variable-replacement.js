const Mutation = require("../mutation");

function GVROperator() {
}

GVROperator.prototype.ID = "GVR";
GVROperator.prototype.name = "global-variable-replacement";

GVROperator.prototype.getMutations = function(file, source, visit) {

  const ID = this.ID;
  const mutations = [];

  visit({
    MemberAccess: (node) => {
      var keywords = ["timestamp", "number", "gasLimit", "difficulty", "gasprice", "value", "blockhash", "coinbase"];
      if (keywords.includes(node.memberName)) {
        const start = node.range[0];
        const end = node.range[1];

        if (node.memberName === "value") {
          if (node.expression.name === "msg") {
            let rule = "GVR-t1r1"
            mutations.push(new Mutation(file, start, end + 1, "tx.gasprice", ID, rule));
          }
        } else if (node.expression.name === "block") {
          if (node.memberName === "difficulty") {
            let rule = "GVR-t2r1"
            let rule2 = "GVR-t2r2"
            mutations.push(new Mutation(file, start, end + 1, "block.number", ID, rule));
            mutations.push(new Mutation(file, start, end + 1, "block.timestamp", ID, rule2));
          } else if (node.memberName === "number") {
            let rule = "GVR-t3r1"
            let rule2 = "GVR-t3r2"
            mutations.push(new Mutation(file, start, end + 1, "block.difficulty", ID, rule));
            mutations.push(new Mutation(file, start, end + 1, "block.timestamp", ID, rule2));
          } else if (node.memberName === "timestamp") {
            let rule = "GVR-t4r1"
            let rule2 = "GVR-t4r2"
            mutations.push(new Mutation(file, start, end + 1, "block.difficulty", ID, rule));
            mutations.push(new Mutation(file, start, end + 1, "block.number", ID, rule2));
          } else if (node.memberName === "coinbase") {
            let rule = "GVR-t5r1"
            let rule2 = "GVR-t5r2"
            mutations.push(new Mutation(file, start, end + 1, "tx.origin", ID, rule));
            mutations.push(new Mutation(file, start, end + 1, "msg.sender", ID, rule2));
          } else if (node.memberName === "gaslimit") {
            let rule = "GVR-t6r1"
            let rule2 = "GVR-t6r2"
            mutations.push(new Mutation(file, start, end + 1, "tx.gasprice", ID, rule));
            mutations.push(new Mutation(file, start, end + 1, "gasleft()", ID, rule2));
          }
        } else if (node.expression.name === "tx" && node.memberName === "gasprice") {
          let rule = "GVR-t7r1"
          let rule2 = "GVR-t7r2"
          mutations.push(new Mutation(file, start, end + 1, "gasleft()", ID, rule));
          mutations.push(new Mutation(file, start, end + 1, "block.gaslimit", ID, rule2));
        }
      }
    }
  });

  visit({
    FunctionCall: (node) => {
      const start = node.range[0];
      const end = node.range[1];
      if (node.expression.name) {
        if (node.expression.name === "gasleft") {
          let rule = "GVR-t8r1"
          let rule2 = "GVR-t8r2"
          mutations.push(new Mutation(file, start, end + 1, "tx.gasprice", ID, rule));
          mutations.push(new Mutation(file, start, end + 1, "block.gaslimit", ID, rule2));
        } else {
          if (node.expression.name === "blockhash") {
            let rule = "GVR-t9r1"
            mutations.push(new Mutation(file, start, end + 1, "msg.sig", ID, rule));
          }
        }
      }
    }
  });

  visit({
    Identifier: (node) => {
      //Alias for block.timestamp
      if (node.name === "now") {
        let rule = "GVR-t10r1"
        let rule2 = "GVR-t10r2"

        const start = node.range[0];
        const end = node.range[1];
        mutations.push(new Mutation(file, start, end + 1, "block.difficulty", ID, rule));
        mutations.push(new Mutation(file, start, end + 1, "block.number", ID, rule2));
      }
    }
  });

  return mutations;
};
module.exports = GVROperator;
