const Mutation = require("../mutation");

function BOROperator() {
}

BOROperator.prototype.ID = "BOR";
BOROperator.prototype.name = "binary-operator-replacement";

BOROperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];
  var ranges = []; //Visited node ranges

  visit({
    BinaryOperation: (node) => {
      if (!ranges.includes(node.range)) {
        ranges.push(node.range);
        const start = node.left.range[1] + 1;
        const end = node.right.range[0];
        const text = source.slice(start, end);

        let rule;
        let rule2;
        let replacement;
        let replacement2;

        switch (node.operator) {
          //BORa - Binary Operator Replacement (Arithmetic)
          case "+":
            replacement = text.replace("+", "-");
            rule = ("BOR-A-t1r1");
            break;
          case "-":
            replacement = text.replace("-", "+");
            rule = ("BOR-A-t2r1");
            break;
          case "*":
            replacement = text.replace("*", "/");
            replacement2 = text.replace("*", "**");
            rule = ("BOR-A-t3r1");
            rule2 = ("BOR-A-t3r2");
            break;
          case "**":
            replacement = text.replace("**", "*");
            rule = ("BOR-A-t4r1");
            break;
          case "/":
            replacement = text.replace("/", "*");
            rule = ("BOR-A-t5r1");
            break;
          case "%":
            replacement = text.replace("%", "*");
            rule = ("BOR-A-t6r1");
            break;
          //BORs - Binary Operator Replacement (Shift)                    
          case "<<":
            replacement = text.replace("<<", ">>");
            rule = ("BOR-S-t1r1");
            break;
          case ">>":
            replacement = text.replace(">>", "<<");
            rule = ("BOR-S-t2r1");
            break;
          //BORb - Binary Operator Replacement (Bitwise)                    
          case "|":
            replacement = text.replace("|", "&");
            rule = ("BOR-B-t1r1");
            break;
          case "&":
            replacement = text.replace("&", "|");
            rule = ("BOR-B-t2r1");
            break;
          case "^":
            replacement = text.replace("^", "&");
            rule = ("BOR-B-t3r1");
            break;
          //BORc - Binary Operator Replacement (Conditional)
          case "&&":
            replacement = text.replace("&&", "||");
            rule = ("BOR-C-t1r1");
            break;
          case "||":
            replacement = text.replace("||", "&&");
            rule = ("BOR-C-t2r1");
            break;
          //BORr - Binary Operator Replacement (Relational)
          case "<":
            replacement = text.replace("<", "<=");
            replacement2 = text.replace("<", ">= ");
            rule = ("BOR-R-t1r1");
            rule2 = ("BOR-R-t1r2");
            break;
          case ">":
            replacement = text.replace(">", ">= ");
            replacement2 = text.replace(">", "<= ");
            rule = ("BOR-R-t2r1");
            rule2 = ("BOR-R-t2r2");
            break;
          case "<=":
            replacement = text.replace("<=", " <");
            replacement2 = text.replace("<=", " >");
            rule = ("BOR-R-t3r1");
            rule2 = ("BOR-R-t3r2");
            break;
          case ">=":
            replacement = text.replace(">=", " >");
            replacement2 = text.replace(">=", " <");
            rule = ("BOR-R-t4r1");
            rule2 = ("BOR-R-t4r2");
            break;
          case "!=":
            replacement = text.replace("!=", "==");
            rule = ("BOR-R-t5r1");
            break;
          case "==":
            replacement = text.replace("==", "!=");
            rule = ("BOR-R-t6r1");
            break;
        }

        if (replacement) {
          mutations.push(new Mutation(file, start, end, replacement, this.ID, rule));
        }
        if (replacement2) {
          mutations.push(new Mutation(file, start, end, replacement2, this.ID,  rule2));
        }
      }
    }
  });

  return mutations;
};

module.exports = BOROperator;
