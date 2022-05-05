const Mutation = require('../../mutation')

function GVROperator() { }

GVROperator.prototype.ID = 'GVR'
GVROperator.prototype.name = 'global-variable-replacement'

GVROperator.prototype.getMutations = function (file, source, visit) {
  const ID = this.ID
  const mutations = []

  visit({
    MemberAccess: (node) => {
      var keywords = ['timestamp', 'number', 'gasLimit', 'difficulty', 'gasprice', 'value', 'blockhash', 'coinbase']
      if (keywords.includes(node.memberName)) {
        const start = node.range[0]
        const end = node.range[1]

        if (node.memberName === 'value') {
          if (node.expression.name === 'msg') {
            let rule = "GVR-t1r1"
            mutations.push(new Mutation(file, start, end + 1, 'tx.gasprice', ID, rule))
          }
        } else if (node.expression.name === 'block') {
          if (node.memberName === 'difficulty') {
            let rule = "GVR-t2r1"
            let rule2 = "GVR-t2r2"
            let rule3 = "GVR-t2r3"
            let rule4 = "GVR-t2r4"
            let rule5 = "GVR-t2r5"
            let rule6 = "GVR-t2r6"
            mutations.push(new Mutation(file, start, end + 1, 'block.number', ID, rule))
            mutations.push(new Mutation(file, start, end + 1, 'block.timestamp', ID, rule2))
            mutations.push(new Mutation(file, start, end + 1, 'block.gaslimit', ID, rule3))
            mutations.push(new Mutation(file, start, end + 1, 'tx.gasprice', ID, rule4))
            mutations.push(new Mutation(file, start, end + 1, 'gasleft()', ID, rule5))
            mutations.push(new Mutation(file, start, end + 1, 'msg.value', ID, rule6))
          } else if (node.memberName === 'number') {
            let rule = "GVR-t3r1"
            let rule2 = "GVR-t3r2"
            let rule3 = "GVR-t3r3"
            let rule4 = "GVR-t3r4"
            let rule5 = "GVR-t3r5"
            let rule6 = "GVR-t3r6"
            mutations.push(new Mutation(file, start, end + 1, 'block.difficulty', ID, rule))
            mutations.push(new Mutation(file, start, end + 1, 'block.timestamp', ID, rule2))
            mutations.push(new Mutation(file, start, end + 1, 'block.gaslimit', ID, rule3))
            mutations.push(new Mutation(file, start, end + 1, 'tx.gasprice', ID, rule4))
            mutations.push(new Mutation(file, start, end + 1, 'gasleft()', ID, rule5))
            mutations.push(new Mutation(file, start, end + 1, 'msg.value', ID, rule6))
          } else if (node.memberName === 'timestamp') {
            let rule = "GVR-t4r1"
            let rule2 = "GVR-t4r2"
            let rule3 = "GVR-t4r3"
            let rule4 = "GVR-t4r4"
            let rule5 = "GVR-t4r5"
            let rule6 = "GVR-t4r6"
            mutations.push(new Mutation(file, start, end + 1, 'block.difficulty', ID, rule))
            mutations.push(new Mutation(file, start, end + 1, 'block.number', ID, rule2))
            mutations.push(new Mutation(file, start, end + 1, 'block.gaslimit', ID, rule3))
            mutations.push(new Mutation(file, start, end + 1, 'tx.gasprice', ID, rule4))
            mutations.push(new Mutation(file, start, end + 1, 'gasleft()', ID, rule5))
            mutations.push(new Mutation(file, start, end + 1, 'msg.value', ID, rule6))
          }
          else if (node.memberName === 'coinbase') {
            let rule = "GVR-t5r1"
            let rule2 = "GVR-t5r2"
            mutations.push(new Mutation(file, start, end + 1, 'tx.origin', ID, rule))
            mutations.push(new Mutation(file, start, end + 1, 'msg.sender', ID, rule2))
          }
          else if (node.memberName === 'gaslimit') {
            let rule = "GVR-t6r1";
            let rule2 = "GVR-t6r2";
            let rule3 = "GVR-t6r3";
            let rule4 = "GVR-t6r4";
            let rule5 = "GVR-t6r5";
            let rule6 = "GVR-t6r6";
            mutations.push(new Mutation(file, start, end + 1, 'tx.gasprice', ID, rule))
            mutations.push(new Mutation(file, start, end + 1, 'gasleft()', ID, rule2))
            mutations.push(new Mutation(file, start, end + 1, 'block.number', ID, rule3))
            mutations.push(new Mutation(file, start, end + 1, 'block.difficulty', I, rule4))
            mutations.push(new Mutation(file, start, end + 1, 'block.timestamp', ID, rule5))
            mutations.push(new Mutation(file, start, end + 1, 'msg.value', ID, rule6))
          }
        } else if (node.expression.name === 'tx' && node.memberName === 'gasprice') {
          let rule = "GVR-t7r1";
          let rule2 = "GVR-t7r2";
          let rule3 = "GVR-t7r3";
          let rule4 = "GVR-t7r4";
          let rule5 = "GVR-t7r5";
          let rule6 = "GVR-t7r6";
          mutations.push(new Mutation(file, start, end + 1, 'gasleft()', ID, rule))
          mutations.push(new Mutation(file, start, end + 1, 'block.gaslimit', ID, rule2))
          mutations.push(new Mutation(file, start, end + 1, 'block.number', ID, rule3))
          mutations.push(new Mutation(file, start, end + 1, 'block.difficulty', ID, rule4))
          mutations.push(new Mutation(file, start, end + 1, 'block.timestamp', ID, rule5))
          mutations.push(new Mutation(file, start, end + 1, 'msg.value', ID, rule6))
        }
      }
    },
  })

  visit({
    FunctionCall: (node) => {
      const start = node.range[0]
      const end = node.range[1]
      if (node.expression.name) {
        if (node.expression.name === 'gasleft') {
          let rule = "GVR-t8r1"
          let rule2 = "GVR-t8r2"
          let rule3 = "GVR-t8r3"
          let rule4 = "GVR-t8r4"
          let rule5 = "GVR-t8r5"
          let rule6 = "GVR-t8r6"
          mutations.push(new Mutation(file, start, end + 1, 'tx.gasprice', ID, rule))
          mutations.push(new Mutation(file, start, end + 1, 'block.gaslimit', ID, rule2))
          mutations.push(new Mutation(file, start, end + 1, 'block.number', ID, rule3))
          mutations.push(new Mutation(file, start, end + 1, 'block.difficulty', ID, rule4))
          mutations.push(new Mutation(file, start, end + 1, 'block.timestamp', ID, rule5))
          mutations.push(new Mutation(file, start, end + 1, 'msg.value', ID, rule6))
        } else {
          if (node.expression.name === 'blockhash') {
            let rule = "GVR-t9r1"
            mutations.push(new Mutation(file, start, end + 1, 'msg.sig', ID, rule))
          }
        }
      }
    },
  })

  visit({
    Identifier: (node) => {
      //Alias for block.timestamp
      if (node.name === 'now') {
        let rule = "GVR-t10r1"
        let rule2 = "GVR-t10r2"
        let rule3 = "GVR-t10r3"
        let rule4 = "GVR-t10r4"
        let rule5 = "GVR-t10r5"
        let rule6 = "GVR-t10r6"
        const start = node.range[0]
        const end = node.range[1]
        mutations.push(new Mutation(file, start, end + 1, 'block.difficulty', ID, rule))
        mutations.push(new Mutation(file, start, end + 1, 'block.number', ID, rule2))
        mutations.push(new Mutation(file, start, end + 1, 'block.gaslimit', ID, rule3))
        mutations.push(new Mutation(file, start, end + 1, 'msg.value', ID, rule4))
        mutations.push(new Mutation(file, start, end + 1, 'tx.gasprice', ID, rule5))
        mutations.push(new Mutation(file, start, end + 1, 'gasleft()', ID, rule6))
      }
    },
  })

  return mutations
}
module.exports = GVROperator
