const Mutation = require("../mutation");

function AOROperator() {
}

AOROperator.prototype.ID = "AOR";
AOROperator.prototype.name = "assignment-operator-replacement";

AOROperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];

  visit({
    BinaryOperation: (node) => {
      const start = node.left.range[1] + 1;
      const end = node.right.range[0];
      const text = source.slice(start, end);

      let replacement;
      let replacement2;
      let rule;
      let rule2;

      switch (node.operator) {
        case "+=":
          replacement = text.replace("+=", "-=");
          replacement2 = text.replace("+=", " =");
          rule = "AOR-t1r1";
          rule2 = "AOR-t1r2";
          break;
        case "-=":
          replacement = text.replace("-=", "+=");
          replacement2 = text.replace("-=", " =");
          rule = "AOR-t2r1";
          rule2 = "AOR-t2r2";
          break;
        case "*=":
          replacement = text.replace("*=", "/=");
          replacement2 = text.replace("*=", " =");
          rule = "AOR-t3r1";
          rule2 = "AOR-t3r2";
          break;
        case "/=":
          replacement = text.replace("/=", "*=");
          replacement2 = text.replace("/=", " =");
          rule = "AOR-t4r1";
          rule2 = "AOR-t4r2";
          break;
        case "%=":
          replacement = text.replace("%=", "*=");
          replacement2 = text.replace("%=", " =");
          rule = "AOR-t5r1";
          rule2 = "AOR-t5r2";
          break;
        case "<<=":
          replacement = text.replace("<<=", ">>=");
          replacement2 = text.replace("<<=", " =");
          rule = "AOR-t6r1";
          rule2 = "AOR-t6r2";
          break;
        case ">>=":
          replacement = text.replace(">>=", "<<=");
          replacement2 = text.replace(">>=", " =");
          rule = "AOR-t7r1";
          rule2 = "AOR-t7r2"; 
          break;
        case "|=":
          replacement = text.replace("|=", "&=");
          replacement2 = text.replace("|=", " =");
          rule = "AOR-t8r1";
          rule2 = "AOR-t8r2";
          break;
        case "&=":
          replacement = text.replace("&=", "|=");
          replacement2 = text.replace("&=", " =");
          rule = "AOR-t9r1";
          rule2 = "AOR-t9r2";
          break;
        case "^=":
          replacement = text.replace("^=", "&=");
          replacement2 = text.replace("^=", " =");
          rule = "AOR-t10r1";
          rule2 = "AOR-t10r2";
          break;
      }

      if (replacement)
        mutations.push(new Mutation(file, start, end, replacement, this.ID, rule));
      if (replacement2)
        mutations.push(new Mutation(file, start, end, replacement2, this.ID, rule2));

    }
  });

  return mutations;
};

module.exports = AOROperator;
