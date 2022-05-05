#!/usr/bin/env node

const yargs = require('yargs')
var argv = require('yargs/yargs')(process.argv.slice(2))
const commands = require('./src/commands')
const utils = require('./src/utils')
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
  .command('cleanSumo', 'clean .sumo directory', (argv) => {
    utils.cleanSumo()
  })
  .command('cleanResume','clean .resume directory',(argv)=>{
    utils.cleanResumeCLI()
  })
  .command('restore', 'restore SUT files', (argv) => {
    utils.restore()
  })
  .command('generateExcel','generate xlsx with test results info', (argv)=>{
    commands.generateExcel()
  })
  .help()
  .argv
