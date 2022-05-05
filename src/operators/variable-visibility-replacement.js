const Mutation = require("../mutation");

function VVRoperator() {
}

VVRoperator.prototype.ID = "VVR";
VVRoperator.prototype.name = "variable-visibility-replacement";

VVRoperator.prototype.getMutations = function(file, source, visit) {
  const mutations = [];

  visit({
    StateVariableDeclaration: (node) => {
      if (node.variables[0].typeName.type != "Mapping") {

        let replacement;
        let replacement2;
        let rule;
        let rule2;
        var varDeclaration = source.substring(node.range[0], node.range[1]);

        switch (node.variables[0].visibility) {
          case "public":
            rule = "VVR-t1r1"
            rule2 = "VVR-t1r2"
            replacement = varDeclaration.replace("public", "internal");
            replacement2 = varDeclaration.replace("public", "private");
            break;
          case "internal":
            rule = "VVR-t2r1"
            rule2 = "VVR-t2r2"
            replacement = varDeclaration.replace("internal", "public");
            replacement2 = varDeclaration.replace("internal", "private");
            break;
          case "private":
            rule = "VVR-t3r1"
            rule2 = "VVR-t3r2"
            replacement = varDeclaration.replace("private", "public");
            replacement2 = varDeclaration.replace("private", "internal");
            break;
          case "default": //No visibility specified
            var varName = node.variables[0].name.toString();
            if (node.variables[0].typeName.name) {  //Typename
              var varType = node.variables[0].typeName.name.toString();
            } else if (node.variables[0].typeName.namePath) { //User defined typename
              var varType = node.variables[0].typeName.namePath.toString();
            }
            var slice1 = varDeclaration.split(varName)[0];
            var slice2 = varDeclaration.split(varType)[1];
            rule = "VVR-t4r1"
            rule2 = "VVR-t4r2"
            replacement = slice1 + "public" + slice2;
            replacement2 = slice1 + "private" + slice2;
            break;
        }
        mutations.push(new Mutation(file, node.range[0], node.range[1], replacement, this.ID, rule));
        mutations.push(new Mutation(file, node.range[0], node.range[1], replacement2, this.ID, rule2));
      }
    }
  });
  return mutations;
};

module.exports = VVRoperator;
