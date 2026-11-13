const assert = require('assert');
const { execSync } = require('child_process');
const path = require('path');

const cliPath = path.resolve(__dirname, '../../bin/cli.js');

function runIntegrationTests() {
  const helpOut = execSync(`node "${cliPath}" --help`, { encoding: 'utf-8' });
  assert(helpOut.includes('Usage: my-cli') || helpOut.includes('my-cli [options]'));

  const verOut = execSync(`node "${cliPath}" --version`, { encoding: 'utf-8' });
  assert(verOut.includes('1.0.0'));

  let failedAsExpected = false;
  try {
    execSync(`node "${cliPath}" unknownCommand`, { stdio: 'pipe' });
  } catch (err) {
    failedAsExpected = err.status !== 0;
  }
  assert(failedAsExpected);

  return true;
}

module.exports = {
  runIntegrationTests
};
