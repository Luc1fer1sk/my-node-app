const chalk = require('chalk');

const isDebug = process.env.NODE_ENV === 'development';

function success(msg) {
  console.log(chalk.green(`✔ ${msg}`));
}

function info(msg) {
  console.log(chalk.blue(`ℹ ${msg}`));
}

function warn(msg) {
  console.log(chalk.yellow(`⚠ ${msg}`));
}

function error(msg, err) {
  console.error(chalk.red(`✖ Oshibka: ${msg}`));
  if (isDebug && err && err.stack) {
    console.error(chalk.gray(err.stack));
  }
}

module.exports = {
  success,
  info,
  warn,
  error
};
