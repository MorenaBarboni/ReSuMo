const Mutation = require('../../mutation')

function BOROperator() {}

BOROperator.prototype.ID = 'BOR'
BOROperator.prototype.name = 'binary-operator-replacement'

BOROperator.prototype.getMutations = function(file, source, visit) {
  const mutations = []
  var ranges = [] //Visited node ranges

  visit({
    BinaryOperation: (node) => {
     if(!ranges.includes(node.range)){
       ranges.push(node.range);
        const start = node.left.range[1] + 1
        const end = node.right.range[0]
        const text = source.slice(start, end)

        let rule;
        let rule2;
        let rule3;
        let rule4;
        let rule5;
        let replacement;
        let replacement2;
        let replacement3;
        let replacement4;
        let replacement5;


        switch (node.operator) {
        //BORa - Binary Operator Replacement (Arithmetic)
          case '+':
            replacement = text.replace('+', '-');
            replacement2 = text.replace('+', '*');
            replacement3 = text.replace('+', '/');
            replacement4 = text.replace('+', '**');
            replacement5 = text.replace('+', '%');
            rule = ("BOR-A-t1r1");
            rule2 = ("BOR-A-t1r2");            
            rule3 = ("BOR-A-t1r3");
            rule4 = ("BOR-A-t1r4");
            rule5 = ("BOR-A-t1r5");
            break;
          case '-':
            replacement = text.replace('-', '+')
            replacement2 = text.replace('-', '*')
            replacement3 = text.replace('-', '/')
            replacement4 = text.replace('-', '**')
            replacement5 = text.replace('-', '%')
            rule = ("BOR-A-t2r1");
            rule2 = ("BOR-A-t2r2");            
            rule3 = ("BOR-A-t2r3");
            rule4 = ("BOR-A-t2r4");
            rule5 = ("BOR-A-t2r5");
            break;
          case '*':
            replacement = text.replace('*', '/')
            replacement2 = text.replace('*', '**')
            replacement3 = text.replace('*', '+')
            replacement4 = text.replace('*', '-')
            replacement5 = text.replace('*', '%')
            rule = ("BOR-A-t3r1");
            rule2 = ("BOR-A-t3r2");
            rule3 = ("BOR-A-t3r3");
            rule4 = ("BOR-A-t3r4");
            rule5 = ("BOR-A-t3r5");          
            break;
          case '**':
            replacement = text.replace('**', '*')
            replacement2 = text.replace('**', '-')
            replacement3 = text.replace('**', '+')
            replacement4 = text.replace('**', '/')
            replacement5 = text.replace('**', '%')
            rule = ("BOR-A-t4r1");
            rule2 = ("BOR-A-t4r2");
            rule3 = ("BOR-A-t4r3");
            rule4 = ("BOR-A-t4r4");
            rule5 = ("BOR-A-t4r5");
            break;
          case '/':
            replacement = text.replace('/', '*')
            replacement2 = text.replace('/', '-')
            replacement3 = text.replace('/', '+')
            replacement4 = text.replace('/', '**')
            replacement5 = text.replace('/', '%')
            rule = ("BOR-A-t5r1");
            rule2 = ("BOR-A-t5r2");
            rule3 = ("BOR-A-t5r3");
            rule4 = ("BOR-A-t5r4");
            rule5 = ("BOR-A-t5r5");
            break;
          case '%':
            replacement = text.replace('%', '*')
            replacement2 = text.replace('%', '-')
            replacement3 = text.replace('%', '+')
            replacement4 = text.replace('%', '/')
            replacement5 = text.replace('%', '**')
            rule = ("BOR-A-t6r1");
            rule2 = ("BOR-A-t6r2");
            rule3 = ("BOR-A-t6r3");
            rule4 = ("BOR-A-t6r4");
            rule5 = ("BOR-A-t6r5");
            break;
          //BORs - Binary Operator Replacement (Shift)                    
          case '<<':
            replacement = text.replace('<<', '>>')
            rule = ("BOR-S-t1r1");
            break;
          case '>>':
            replacement = text.replace('>>', '<<')
            rule = ("BOR-S-t2r1");
            break;
        //BORb - Binary Operator Replacement (Bitwise)
          case '|':
            replacement = text.replace('|', '&')
            replacement2 = text.replace('|', '^')
            rule = ("BOR-B-t1r1");
            rule2 = ("BOR-B-t1r2");
            break;
          case '&':
            replacement = text.replace('&', '|')
            replacement2 = text.replace('&', '^')
            rule = ("BOR-B-t2r1");
            rule = ("BOR-B-t2r2");
            break;
          case '^':
            replacement = text.replace('^', '&')
            replacement = text.replace('^', '|')
            rule = ("BOR-B-t3r1");
            rule2 = ("BOR-B-t3r2");
            break;
        //BORc - Binary Operator Replacement (Conditional)
        case '&&':
            replacement = text.replace('&&', '||')
            rule = ("BOR-C-t1r1");
            break;
          case '||':
            replacement = text.replace('||', '&&')
            rule = ("BOR-C-t2r1");
            break;
        //BORr - Binary Operator Replacement (Relational)
          case '<':
            replacement = text.replace('<', '<=')
            replacement2 = text.replace('<', '>= ')
            replacement3 = text.replace('<', '>')
            replacement4 = text.replace('<', '!=')
            replacement5 = text.replace('<', '==')
            rule = ("BOR-R-t1r1");
            rule2 = ("BOR-R-t1r2");
            rule3 = ("BOR-R-t1r3");
            rule4 = ("BOR-R-t1r4");
            rule5 = ("BOR-R-t1r5");
            break;
          case '>':
            replacement = text.replace('>', '>= ')
            replacement2 = text.replace('>', '<= ')
            replacement3 = text.replace('>', '<')
            replacement4 = text.replace('>', '!=')
            replacement5 = text.replace('>', '==')
            rule = ("BOR-R-t2r1");
            rule2 = ("BOR-R-t2r2");
            rule3 = ("BOR-R-t2r3");
            rule4 = ("BOR-R-t2r4");
            rule5 = ("BOR-R-t2r5");
            break;
          case '<=':
            replacement = text.replace('<=', ' <')
            replacement2 = text.replace('<=', ' >')
            replacement3 = text.replace('<=', '>=')
            replacement4 = text.replace('<=', '!=')
            replacement5 = text.replace('<=', '==')
            rule = ("BOR-R-t3r1");
            rule2 = ("BOR-R-t3r2");
            rule3 = ("BOR-R-t3r3");
            rule4 = ("BOR-R-t3r4");
            rule5 = ("BOR-R-t3r5");
            break;
          case '>=':
            replacement = text.replace('>=', ' >')
            replacement2 = text.replace('>=', ' <')
            replacement3 = text.replace('>=', '<=')
            replacement4 = text.replace('>=', '!=')
            replacement5 = text.replace('>=', '==')
            rule = ("BOR-R-t4r1");
            rule2 = ("BOR-R-t4r2");
            rule3 = ("BOR-R-t4r3");
            rule4 = ("BOR-R-t4r4");
            rule5 = ("BOR-R-t4r5");
            break;
          case '!=':
            replacement = text.replace('!=', '==')
            replacement2 = text.replace('!=', '> ')
            replacement3 = text.replace('!=', ' <')
            replacement4 = text.replace('!=', '<=')
            replacement5 = text.replace('!=', '>=')
            rule = ("BOR-R-t5r1");
            rule2 = ("BOR-R-t5r2");
            rule3 = ("BOR-R-t5r3");
            rule4 = ("BOR-R-t5r4");
            rule5 = ("BOR-R-t5r5");
          break;
          case '==':
            replacement = text.replace('==', '!=')
            replacement2 = text.replace('==', '<=')
            replacement3 = text.replace('==', '>=')
            replacement4 = text.replace('==', ' <')
            replacement5 = text.replace('==', ' >')
            rule = ("BOR-R-t6r1");
            rule2 = ("BOR-R-t6r2");
            rule3 = ("BOR-R-t6r3");
            rule4 = ("BOR-R-t6r4");
            rule5 = ("BOR-R-t6r5");
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
    }}
  })

  return mutations
}

module.exports = BOROperator
