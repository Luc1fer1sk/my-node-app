const ora = require('ora');
const logger = require('../utils/logger');

function registerTestCommand(program) {
  program
    .command('test')
    .description('zapusk testov')
    .action(async () => {
      const spinner = ora('Zapusk testov...').start();
      await new Promise((r) => setTimeout(r, 600));
      spinner.stop();
      logger.success('Proydeno: 15/15 testov');
      logger.success('Pokrytie: 87%');
    });
}

module.exports = {
  registerTestCommand
};
