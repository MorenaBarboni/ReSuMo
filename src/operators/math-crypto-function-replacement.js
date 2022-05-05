const Mutation = require("../mutation");

function MCROperator() {
}

MCROperator.prototype.ID = "MCR";
MCROperator.prototype.name = "math-and-crypto-function-replacement";

MCROperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];
  const functions = ["addmod", "mulmod", "keccak256", "sha256", "ripemd160"];
  var ranges = []; //Visited node ranges

  visit({
    FunctionCall: (node) => {
      if (!ranges.includes(node.range)) {
        if (functions.includes(node.expression.name)) {
          ranges.push(node.range);
          const start = node.expression.range[0];
          const end = node.expression.range[1];
          var m;

          switch (node.expression.name) {
            case "addmod":
              let rule = "MCR-M-t1r1"  
              mutations.push(new Mutation(file, start, end + 1, "mulmod", this.ID, rule));
              break;
            case "mulmod":
              let rule2 = "MCR-M-t2r1"  
              mutations.push(new Mutation(file, start, end + 1, "addmod", this.ID, rule2));
              break;
            case "keccak256":
              let rule3 = "MCR-C-t1r1"  
              mutations.push(new Mutation(file, start, end + 1, "sha256", this.ID, rule3));
              break;
            case "sha256":
              let rule4 = "MCR-C-t2r1"  
              mutations.push(new Mutation(file, start, end + 1, "keccak256", this.ID, rule4));
              break;
            case "ripemd160":
              let rule5 = "MCR-C-t3r1"  
              mutations.push(new Mutation(file, start, end + 1, "sha256", this.ID, rule5));
              break;
          }
        }
      }
    }
  });
  return mutations;
};

module.exports = MCROperator;
