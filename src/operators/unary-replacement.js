const Mutation = require("../mutation");

function UORDOperator() {
}

UORDOperator.prototype.ID = "UORD";
UORDOperator.prototype.name = "unary-operator-replacement";

UORDOperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];
  var ranges = []; //Visited node ranges

  visit({
    UnaryOperation: (node) => {
      if (!ranges.includes(node.range)) {
        ranges.push(node.range);
        let replacement;
        let replacement2;

        var start;
        var end;

        if (node.isPrefix) {
          start = node.range[0];
          end = node.range[1];
        } else {
          start = node.range[0] + 1;
          end = node.range[1] + 1;
        }
        const text = source.slice(start, end);

        let rule;
        let rule2;

        switch (node.operator) {
          //UORDa - Unary Operator Replacement (Arithmetic)
          case "++":
            rule = "UORD-A-t1r1"
            rule2 = "UORD-A-t1r2"
            replacement = text.replace("++", "--");
            replacement2 = text.replace("++", " ");
            break;
          case "--":
            rule = "UORD-A-t2r1"
            rule2 = "UORD-A-t2r2"
            replacement = text.replace("--", "++");
            replacement2 = text.replace("--", " ");
            break;
          case "-":
            rule = "UORD-A-t3r1"
            replacement = text.replace("-", " ");
            break;
          //UORDb - Unary Operator Replacement (Bitwise)
          case "~":
            rule = "UORD-B-t1r1"
            replacement = text.replace("~", " ");
            break;
          //UORDc - Unary Operator Replacement (Conditional)
          case "!":
            rule = "UORD-C-t1r1"
            replacement = text.replace("!", " ");
            break;
        }
        if (replacement)
          mutations.push(new Mutation(file, start, end, replacement, this.ID, rule));
        if (replacement2)
          mutations.push(new Mutation(file, start, end, replacement2, this.ID, rule2));
      }
    }
  });

  return mutations;
};

module.exports = UORDOperator;
