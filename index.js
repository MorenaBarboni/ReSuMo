#!/usr/bin/env node

const yargs = require('yargs')
var argv = require('yargs/yargs')(process.argv.slice(2))
const commands = require('./src/commands')
const resume = require('./src/resume/resume')

yargs
  .usage('$0 <cmd> [args]')
  .command('preflight', 'print preflight summary', commands.preflight)
  .command('mutate', 'save mutants to file', commands.mutate)
  .command('regression', 'starting regression testing process...', resume.regressionTesting)
  .command('pretest', 'run tests on the original contracts', (argv) => {
    commands.preTest()
  })
  .command('test', 'run tests', (yargs) => {
    yargs.option('failfast', {
      type: 'bool',
      default: false,
      describe: 'abort on first surviving mutant'
    })
  }, commands.test)
  .command('diff <hash>', 'show diff for a given hash', (yargs) => {
    yargs.positional('hash', {
      type: 'string',
      describe: 'hash of mutant'
    })
  }, commands.diff)
  .command('list', 'print list of enabled mutation operators', commands.list)
  .command('enable [ID]', 'enable a mutation operator', (yargs) => {
    yargs
      .positional('ID', {
        type: 'string',
        describe: 'ID of the mutation operator to be enabled',
      })
  }, (argv) => {
    commands.enable(argv.ID)
  })
  .command('disable [ID]', 'disable a mutation operator', (yargs) => {
    yargs
      .positional('ID', {
        type: 'string',
        describe: 'ID of the mutation operator to be disabled.',
      })
  }, (argv) => {
    commands.disable(argv.ID)
  })
  .command('clean', 'clean .sumo directory', (argv) => {
    commands.clean()
  })
  .command('delete','clean .resume directory',(argv)=>{
    commands.delete()
  })
  .command('restore', 'restore SUT files', (argv) => {
    commands.restore()
  })
  .command('generateExcel','generate xlsx with test results info', (argv)=>{
    commands.generateExcel()
  })
  .help()
  .argv
