const Mutation = require('../../mutation')

function SFROperator() {}

SFROperator.prototype.ID = 'SFR'
SFROperator.prototype.name = 'safemath-function-replacement'

SFROperator.prototype.getMutations = function(file, source, visit) {
  const mutations = []

  visit({
    MemberAccess: (node) => {
       if(node.expression.name ==='SafeMath'){
       const start = node.range[0];
       const end = node.range[1];
       var text = source.slice(start, end+1);

       var replacement
       var replacement2
       var replacement3
       var replacement4
       let rule;
       let rule2;
       let rule3;
       let rule4;

       switch (node.memberName) {
        case 'add':
          rule =  "SFR-t1r1";
          rule2 =  "SFR-t1r2";
          rule3 =  "SFR-t1r3";
          rule4 =  "SFR-t1r4";
          replacement = text.replace('add','sub');
          replacement2 = text.replace('add','div');
          replacement3 = text.replace('add','mul');
          replacement4 = text.replace('add','mod');
          break;
        case 'sub':
          rule =  "SFR-t2r1";
          rule2 =  "SFR-t2r2";
          rule3 =  "SFR-t2r3";
          rule4 =  "SFR-t2r4";
          replacement = text.replace('sub','add');
          replacement2 = text.replace('sub','div');
          replacement3 = text.replace('sub','mul');
          replacement4 = text.replace('sub','mod');
          break;
        case 'mul':
          rule =  "SFR-t3r1";
          rule2 =  "SFR-t3r2";
          rule3 =  "SFR-t3r3";
          rule4 =  "SFR-t3r4";
          replacement = text.replace('mul','div');
          replacement2 = text.replace('mul','add');
          replacement3 = text.replace('mul','sub');
          replacement4 = text.replace('mul','mod');
          break;
        case 'div':
          rule =  "SFR-t4r1";
          rule2 =  "SFR-t4r2";
          rule3 =  "SFR-t4r3";
          rule4 =  "SFR-t4r4";
          replacement = text.replace('div','mul');
          replacement2 = text.replace('div','add');
          replacement3 = text.replace('div','sub');
          replacement4 = text.replace('div','mod');
          break;
        case 'mod':
          rule =  "SFR-t5r1"
          rule2 =  "SFR-t5r2"
          rule3 =  "SFR-t5r3"
          rule4 =  "SFR-t5r4"
          replacement = text.replace('mod','mul');
          replacement2 = text.replace('mod','add');
          replacement3 = text.replace('mod','sub');
          replacement4 = text.replace('mod','div');
          break;
        }
        if (replacement) {
          mutations.push(new Mutation(file, start, end+1, replacement, this.ID, rule))
        }
        if(replacement2){
          mutations.push(new Mutation(file, start, end+1, replacement2, this.ID, rule2))
        }
        if (replacement3) {
          mutations.push(new Mutation(file, start, end+1, replacement3, this.ID, rule3))
        }
        if(replacement4){
          mutations.push(new Mutation(file, start, end+1, replacement4, this.ID, rule4))
        }
      }
    }
  })
  return mutations
}

module.exports = SFROperator
