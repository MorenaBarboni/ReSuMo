const Mutation = require('../../mutation')

function AOROperator() {}

AOROperator.prototype.ID = 'AOR'
AOROperator.prototype.name = 'assignment-operator-replacement'

AOROperator.prototype.getMutations = function(file, source, visit) {
  const mutations = []

  visit({
    BinaryOperation: (node) => {
      const start = node.left.range[1] + 1
      const end = node.right.range[0]
      const text = source.slice(start, end)

      let replacement;
      let replacement2;
      let replacement3;
      let replacement4;
      let replacement5;
      let rule;
      let rule2;
      let rule3;
      let rule4;
      let rule5;

      switch (node.operator) {
        case '+=':
          replacement = text.replace('+=', '-=')
          replacement2 = text.replace('+=', ' =')
          replacement3 = text.replace('+=', '/=')
          replacement4 = text.replace('+=', '*=')
          replacement5 = text.replace('+=', '%=')
          rule = "AOR-t1r1";
          rule2 = "AOR-t1r2";
          rule3 = "AOR-t1r3";
          rule4 = "AOR-t1r4";
          rule5 = "AOR-t1r5";
          break;
        case '-=':
          replacement = text.replace('-=', '+=')
          replacement2 = text.replace('-=', ' =')
          replacement3 = text.replace('-=', '/=')
          replacement4 = text.replace('-=', '*=')
          replacement5 = text.replace('-=', '%=')
          rule = "AOR-t2r1";
          rule2 = "AOR-t2r2";
          rule3 = "AOR-t2r3";
          rule4 = "AOR-t2r4";
          rule5 = "AOR-t2r5";
          break;
        case '*=':
          replacement = text.replace('*=', '/=')
          replacement2 = text.replace('*=', ' =')
          replacement3 = text.replace('*=', '+=')
          replacement4 = text.replace('*=', '-=')
          replacement5 = text.replace('*=', '%=')
          rule = "AOR-t3r1";
          rule2 = "AOR-t3r2";
          rule3 = "AOR-t3r3";
          rule4 = "AOR-t3r4";
          rule5 = "AOR-t3r5";
          break;
        case '/=':
          replacement = text.replace('/=', '*=')
          replacement2 = text.replace('/=', ' =')
          replacement3 = text.replace('/=', '+=')
          replacement4 = text.replace('/=', '-=')
          replacement5 = text.replace('/=', '%=')
          rule = "AOR-t4r1";
          rule2 = "AOR-t4r2";
          rule3 = "AOR-t4r3";
          rule4 = "AOR-t4r4";
          rule5 = "AOR-t4r5";
          break;
        case '%=':
          replacement = text.replace('%=', '*=')
          replacement2 = text.replace('%=', ' =')
          replacement3 = text.replace('%=', '+=')
          replacement4 = text.replace('%=', '-=')
          replacement5 = text.replace('%=', '/=')
          rule = "AOR-t5r1";
          rule2 = "AOR-t5r2";
          rule3 = "AOR-t5r3";
          rule4 = "AOR-t5r4";
          rule5 = "AOR-t5r5";
          break;
        case '<<=':
          replacement = text.replace('<<=', '>>=')
          replacement2 = text.replace('<<=', ' =')
          rule = "AOR-t6r1";
          rule2 = "AOR-t6r2";
          break;
        case '>>=':
          replacement = text.replace('>>=', '<<=')
          replacement2 = text.replace('>>=', ' =')
          rule = "AOR-t7r1";
          rule2 = "AOR-t7r2"; 
          break;
        case '|=':
          replacement = text.replace('|=', '&=')
          replacement2 = text.replace('|=', ' =')
          replacement3 = text.replace('|=', '^=')
          rule = "AOR-t8r1";
          rule2 = "AOR-t8r2";
          rule3 = "AOR-t8r3";
          break;
        case '&=':
          replacement = text.replace('&=', '|=')
          replacement2 = text.replace('&=', ' =')
          replacement3 = text.replace('&=', '^=')
          rule = "AOR-t9r1";
          rule2 = "AOR-t9r2";
          rule3 = "AOR-t9r3";
          break;
        case '^=':
          replacement = text.replace('^=', '&=')
          replacement2 = text.replace('^=', ' =')
          replacement3 = text.replace('^=', '|=')
          rule = "AOR-t10r1";
          rule2 = "AOR-t10r2";
          rule3 = "AOR-t10r3";
          break;
        }

        if (replacement) {
          mutations.push(new Mutation(file, start, end, replacement, this.ID, rule))
        }
        if(replacement2){
          mutations.push(new Mutation(file, start, end, replacement2, this.ID, rule2))
        }
        if (replacement3) {
          mutations.push(new Mutation(file, start, end, replacement3, this.ID, rule3))
        }
        if(replacement4){
          mutations.push(new Mutation(file, start, end, replacement4, this.ID, rule4))
        }
        if (replacement5) {
          mutations.push(new Mutation(file, start, end, replacement5, this.ID, rule5))
        }
    },
  })

  return mutations
}

module.exports = AOROperator
