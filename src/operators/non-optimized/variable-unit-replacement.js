const Mutation = require('../../mutation')

function VUROperator() {}

VUROperator.prototype.ID = 'VUR'
VUROperator.prototype.name = 'variable-unit-replacement'

VUROperator.prototype.getMutations = function(file, source, visit) {
  const mutations = []
  var prevRange;

   visit({
    NumberLiteral: (node) => {
      if(node.subdenomination){
        if(prevRange != node.range){
          const start = node.range[0]
          const end = node.range[1]
          var replacement = source.slice(start, end + 1)
          let rule;
          let rule2;
          let rule3;
          let rule4;
          let rule5;

          switch (node.subdenomination) {
            //VURe - Ether Units Replacement
            case 'wei':
              rule = "VUR-E-t1r1"
              replacement = replacement.replace('wei','ether')
              mutations.push(new Mutation(file, start, end + 1, replacement, this.ID, rule));
              break;
            case 'ether':
              rule = "VUR-E-t2r1"
              replacement = replacement.replace('ether','wei')
              mutations.push(new Mutation(file, start, end + 1, replacement, this.ID, rule));
              break;
            //VURt - Time Units Replacement
            case 'seconds':
              rule = "VUR-T-t1r1"
              rule2 = "VUR-T-t1r2"
              rule3 = "VUR-T-t1r3"
              rule4 = "VUR-T-t1r4"
              rule5 = "VUR-T-t1r5"
              mutations.push(new Mutation(file, start, end + 1, 'minutes', this.ID, rule))
              mutations.push(new Mutation(file, start, end + 1, 'hours', this.ID, rule2))
              mutations.push(new Mutation(file, start, end + 1, 'days', this.ID, rule3))
              mutations.push(new Mutation(file, start, end + 1, 'weeks', this.ID, rule4))
              mutations.push(new Mutation(file, start, end + 1, 'years', this.ID, rule5))
              break;
            case 'minutes':
              rule = "VUR-T-t2r1"
              rule2 = "VUR-T-t2r2"
              rule3 = "VUR-T-t2r3"
              rule4 = "VUR-T-t2r4"
              rule5 = "VUR-T-t2r5"
              mutations.push(new Mutation(file, start, end + 1, 'hours', this.ID, rule))
              mutations.push(new Mutation(file, start, end + 1, 'seconds', this.ID, rule2))
              mutations.push(new Mutation(file, start, end + 1, 'days', this.ID, rule3))
              mutations.push(new Mutation(file, start, end + 1, 'weeks', this.ID, rule4))
              mutations.push(new Mutation(file, start, end + 1, 'years', this.ID, rule5))
              break;
            case 'hours':
               rule = "VUR-T-t3r1"
               rule2 = "VUR-T-t3r2"
               rule3 = "VUR-T-t3r3"
               rule4 = "VUR-T-t3r4"
               rule5 = "VUR-T-t3r5"
               mutations.push(new Mutation(file, start, end + 1, 'days', this.ID, rule))
               mutations.push(new Mutation(file, start, end + 1, 'seconds', this.ID, rule2))
               mutations.push(new Mutation(file, start, end + 1, 'minutes', this.ID, rule3))
               mutations.push(new Mutation(file, start, end + 1, 'weeks', this.ID, rule4))
               mutations.push(new Mutation(file, start, end + 1, 'years', this.ID, rule5))
              break;
            case 'days':
               rule = "VUR-T-t4r1"
               rule2 = "VUR-T-t4r2"
               rule3 = "VUR-T-t4r3"
               rule4 = "VUR-T-t4r4"
               rule5 = "VUR-T-t4r5"
               mutations.push(new Mutation(file, start, end + 1, 'weeks', this.ID, rule))
               mutations.push(new Mutation(file, start, end + 1, 'seconds', this.ID, rule2))
               mutations.push(new Mutation(file, start, end + 1, 'minutes', this.ID, rule3))
               mutations.push(new Mutation(file, start, end + 1, 'hours', this.ID, rule4))
               mutations.push(new Mutation(file, start, end + 1, 'years', this.ID, rule5))
              break;
            case 'weeks':
              rule = "VUR-T-t5r1"
              rule2 = "VUR-T-t5r2"
              rule3 = "VUR-T-t5r3"
              rule4 = "VUR-T-t5r4"
              rule5 = "VUR-T-t5r5"
              mutations.push(new Mutation(file, start, end + 1, replacement = replacement.replace('weeks','seconds', this.ID, rule)))
              mutations.push(new Mutation(file, start, end + 1, replacement = replacement.replace('weeks','minutes', this.ID, rule2)))
              mutations.push(new Mutation(file, start, end + 1, replacement = replacement.replace('weeks','hours', this.ID, rule3)))
              mutations.push(new Mutation(file, start, end + 1, replacement = replacement.replace('weeks','days', this.ID, rule4)))
              mutations.push(new Mutation(file, start, end + 1, replacement = replacement.replace('weeks','years', this.ID, rule5)))
              break;
            case 'years':
               rule = "VUR-T-t6r1"
               rule2 = "VUR-T-t6r2"
               rule3 = "VUR-T-t6r3"
               rule4 = "VUR-T-t6r4"
               rule5 = "VUR-T-t6r5"
               mutations.push(new Mutation(file, start, end + 1, 'seconds', this.ID, rule))
               mutations.push(new Mutation(file, start, end + 1, 'minutes', this.ID, rule2))
               mutations.push(new Mutation(file, start, end + 1, 'hours', this.ID, rule3))
               mutations.push(new Mutation(file, start, end + 1, 'days', this.ID, rule4))
               mutations.push(new Mutation(file, start, end + 1, 'weeks', this.ID, rule5))
            }

        }
        prevRange = node.range;
      }
    }
  })
  return mutations
}

module.exports = VUROperator
