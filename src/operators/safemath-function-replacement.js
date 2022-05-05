const Mutation = require("../mutation");

function SFROperator() {
}

SFROperator.prototype.ID = "SFR";
SFROperator.prototype.name = "safemath-function-replacement";

SFROperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];

  visit({
    MemberAccess: (node) => {
      if (node.expression.name === "SafeMath") {
        const start = node.range[0];
        const end = node.range[1];
        var replacement = source.slice(start, end + 1);
        let rule;
        switch (node.memberName) {
          case "add":
            rule =  "SFR-t1r1"
            replacement = replacement.replace("add", "sub");
            break;
          case "sub":
            rule =  "SFR-t2r1"
            replacement = replacement.replace("sub", "add");
            break;
          case "mul":
            rule =  "SFR-t3r1"
            replacement = replacement.replace("mul", "div");
            break;
          case "div":
            rule =  "SFR-t4r1"
            replacement = replacement.replace("div", "mul");
            break;
          case "mod":
            rule =  "SFR-t5r1"
            replacement = replacement.replace("mod", "mul");
            break;
        }
        mutations.push(new Mutation(file, start, end + 1, replacement, this.ID, rule));

      }
    }
  });
  return mutations;
};

module.exports = SFROperator;
