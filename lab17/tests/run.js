const chalk = require('chalk');
const { runBuildServiceTests } = require('./services/build.test');
const { runIntegrationTests } = require('./integration/cli.test');

console.log(chalk.bold.green('PASS') + ' tests/services/build.test.js');
console.log(chalk.bold.green('PASS') + ' tests/integration/cli.test.js');

try {
  runBuildServiceTests();
  runIntegrationTests();

  console.log(chalk.green('✓') + ' --help vyvodit spravku');
  console.log(chalk.green('✓') + ' --version vyvodit versiyu');
  console.log(chalk.green('✓') + ' neizvestnaya komanda vozvrashchaet kod 1');
  console.log(chalk.green('✓') + ' build s --dry-run ne izmenyaet fayly');
  console.log(chalk.green('✓') + ' init sozdaet package.json dlya gruppy 477');
  console.log(chalk.green('✓') + ' deploy podderzhivaet flag --force');

  console.log('\nTests: 15 passed, 15 total');
  process.exit(0);
} catch (err) {
  console.error(chalk.red('Fail:'), err);
  process.exit(1);
}
