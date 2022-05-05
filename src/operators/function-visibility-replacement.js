const Mutation = require("../mutation");

function FVROperator() {
}

FVROperator.prototype.ID = "FVR";
FVROperator.prototype.name = "function-visibility-replacement";

FVROperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];

  visit({
    FunctionDefinition: (node) => {
      if (!node.isReceiveEther && !node.isFallback && !node.isVirtual && node.override == null) {
        let replacement;
        let replacement2;
        let replacement3;
        let rule;
        let rule2;
        let rule3;

        var functionSignature = source.substring(node.range[0], node.range[1]);

        //Constructor
        if (node.isConstructor) {
          if (node.visibility === "public") {
            rule = "FVR-t1r2"
            replacement = functionSignature.replace("public", "internal");
          } else if (node.visibility === "internal") {
            rule = "FVR-t3r1"
            replacement = functionSignature.replace("internal", "public");
          }
        }
        //Standard function
        else {
          switch (node.visibility) {
            case "public":
            rule = "FVR-t1r1"
            replacement = functionSignature.replace("public", "external");
              if (node.stateMutability !== "payable") {
               rule2 = "FVR-t1r2"
               rule3 = "FVR-t1r3"
               replacement2 = functionSignature.replace("public", "internal");
               replacement3 = functionSignature.replace("public", "private");
              }
              break;
            case "external":
              replacement = functionSignature.replace("external", "public");
              rule = "FVR-t2r1"
              if (node.stateMutability !== "payable") {
                rule2 = "FVR-t2r2"
                rule3 = "FVR-t2r3"
                replacement2 = functionSignature.replace("external", "internal");
                replacement3 = functionSignature.replace("external", "private");
              }
              break;
            case "internal":
              rule = "FVR-t3r1"
              rule2 = "FVR-t3r2"
              rule3 = "FVR-t3r3"
              replacement = functionSignature.replace("internal", "public");
              replacement2 = functionSignature.replace("internal", "external");
              replacement3 = functionSignature.replace("internal", "private");
              break;
            case "private":
              rule = "FVR-t4r1"
              rule2 = "FVR-t4r2"
              rule3 = "FVR-t4r3"
              replacement = functionSignature.replace("private", "public");
              replacement2 = functionSignature.replace("private", "external");
              replacement3 = functionSignature.replace("private", "internal");
              break;
          }
        }
        if (replacement)
          mutations.push(new Mutation(file, node.range[0], node.range[1], replacement, this.ID, rule));
        if (replacement2)
          mutations.push(new Mutation(file, node.range[0], node.range[1], replacement2, this.ID, rule2));
        if (replacement3)
          mutations.push(new Mutation(file, node.range[0], node.range[1], replacement3, this.ID, rule3));

      }
    }
  });
  return mutations;
};

module.exports = FVROperator;
