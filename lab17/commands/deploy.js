const readline = require('readline');
const ora = require('ora');
const logger = require('../utils/logger');
const { deployProject } = require('../services/deployService');

function registerDeployCommand(program) {
  program
    .command('deploy')
    .description('razvertyvanie prilozheniya')
    .option('--env <env>', 'okruzhenie (development, staging, production)', 'production')
    .option('-f, --force', 'prinuditelnoe razvertyvanie bez podtverzhdeniya')
    .action(async (options) => {
      const env = options.env;
      if (env === 'production' && !options.force) {
        logger.warn('Vy sobiraetes razvernut proekt v production!');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        const answer = await new Promise((resolve) => {
          rl.question('Prodolzhit? (y/N) ', (ans) => {
            rl.close();
            resolve(ans.trim());
          });
        });
        if (answer.toLowerCase() !== 'y') {
          console.log('Razvertyvanie otmeneno.');
          return;
        }
      }

      const spinner = ora('Razvertyvanie...').start();
      await new Promise((r) => setTimeout(r, 700));
      spinner.succeed('Razvernyto uspeshno');

      const info = deployProject(env);
      console.log(`URL: ${info.url}`);
    });
}

module.exports = {
  registerDeployCommand
};
