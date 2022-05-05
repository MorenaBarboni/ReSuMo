const Mutation = require('../../mutation')

function EROperator() {}

EROperator.prototype.ID = 'ER'
EROperator.prototype.name = 'enum-replacement'

EROperator.prototype.getMutations = function(file, source, visit) {
  const mutations = []
  var ranges = [] //Visited node ranges

  visit({
    EnumDefinition: (node) => {

      var thisEnum = node;

      //ERs - Enum Replacement - default value switch
      if(node.members.length>1){
        let rule = "ER-S-t1r1";   
        var start1 = node.members[0].range[0];
        var end2 = node.members[1].range[1];
        var deafultValue = node.members[0].name;
        var secondValue = node.members[1].name;

        var replacement =source.slice(start1, end2+1);
        replacement = replacement.replace(deafultValue, "*").replace(secondValue, deafultValue).replace("*", secondValue);
        mutations.push(new Mutation(file, node.members[0].range[0], node.members[1].range[1]+1, replacement, this.ID, rule))
      }
      //ERr - Enum Replacement - Member replacement
    visit({
     MemberAccess: (node) => {
      if(!ranges.includes(node.range)){
        ranges.push(node.range);
       if(node.expression.name === thisEnum.name){
          let rule = "ER-R-t1r1";     
          var text = source.slice(node.range[0], node.range[1]+1 )
          //Replace a member with each existing member
          thisEnum.members.forEach(m => {
            if(m.name !== node.memberName){
              var replacement = text.replace(node.memberName, m.name);
              mutations.push(new Mutation(file, node.range[0], node.range[1] + 1, replacement, this.ID, rule))
            }
          });
       }
      }
    }
    })
    }

  })
  return mutations
}

module.exports = EROperator
