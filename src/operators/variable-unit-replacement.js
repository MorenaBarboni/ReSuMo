const Mutation = require("../mutation");

function VUROperator() {}

VUROperator.prototype.ID = "VUR";
VUROperator.prototype.name = "variable-unit-replacement";

VUROperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];
  var prevRange;

  visit({
    NumberLiteral: (node) => {
      if (node.subdenomination) {
        if (prevRange != node.range) {
          const start = node.range[0];
          const end = node.range[1];
          var replacement = source.slice(start, end + 1);
          let rule;

          switch (node.subdenomination) {
            //VURe - Ether Units Replacement
            case "wei":
              rule = "VUR-E-t1r1"
              replacement = replacement.replace("wei", "ether");
              break;
            case "ether":
              rule = "VUR-E-t2r1"
              replacement = replacement.replace("ether", "wei");
              break;
            //VURt - Time Units Replacement
            case "seconds":
              rule = "VUR-T-t1r1"
              replacement = replacement.replace("seconds", "minutes");
              break;
            case "minutes":
              rule = "VUR-T-t2r1"
              replacement = replacement.replace("minutes", "hours");
              break;
            case "hours":
              rule = "VUR-T-t3r1"
              replacement = replacement.replace("hours", "days");
              break;
            case "days":
              rule = "VUR-T-t4r1"
              replacement = replacement.replace("days", "weeks");
              break;
            case "weeks":
              rule = "VUR-T-t5r1"
              replacement = replacement.replace("weeks", "seconds");
              break;
            case "years":
              rule = "VUR-T-t6r1"
              replacement = replacement.replace("years", "seconds");
          }
          mutations.push(new Mutation(file, start, end + 1, replacement, this.ID, rule));
        }
        prevRange = node.range;
      }
    }
  });
  return mutations;
};

module.exports = VUROperator;
