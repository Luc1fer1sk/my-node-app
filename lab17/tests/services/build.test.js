const assert = require('assert');
const { buildProject } = require('../../services/buildService');

function runBuildServiceTests() {
  const result = buildProject({ dryRun: true });
  assert.strictEqual(result.dryRun, true);
  assert(result.output.includes('my-app.js'));
  return true;
}

module.exports = {
  runBuildServiceTests
};
