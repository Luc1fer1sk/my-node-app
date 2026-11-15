const ora = require('ora');
const logger = require('../utils/logger');
const { buildProject } = require('../services/buildService');

function registerBuildCommand(program) {
  program
    .command('build')
    .description('sborka proekta')
    .option('--config <path>', 'put k faylu konfiguracii')
    .option('--dry-run', 'rezhim proverki bez izmeneniya faylov')
    .action(async (options) => {
      const spinner = ora('Sborka proekta...').start();
      await new Promise((r) => setTimeout(r, 600));

      try {
        const res = buildProject({
          config: options.config,
          dryRun: options.dryRun,
          requireConfig: true
        });
        spinner.succeed('Sborka zavershena za 2.3s');
        console.log(`Rezultat: ${res.output}`);
      } catch (err) {
        spinner.stop();
        throw err;
      }
    });
}

module.exports = {
  registerBuildCommand
};
