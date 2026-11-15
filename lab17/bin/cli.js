#!/usr/bin/env node

const { Command } = require('commander');
const logger = require('../utils/logger');
const { registerInitCommand } = require('../commands/init');
const { registerBuildCommand } = require('../commands/build');
const { registerTestCommand } = require('../commands/test');
const { registerDeployCommand } = require('../commands/deploy');

process.on('uncaughtException', (err) => {
  logger.error(err.message, err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  logger.error(err.message, err);
  process.exit(1);
});

const program = new Command();

program
  .name('my-cli')
  .description('Polnocennoe CLI-prilozhenie s arhitekturoy')
  .version('1.0.0', '-V, --version', 'vyvesti versiyu prilozheniya');

registerInitCommand(program);
registerBuildCommand(program);
registerTestCommand(program);
registerDeployCommand(program);

program.parse(process.argv);
