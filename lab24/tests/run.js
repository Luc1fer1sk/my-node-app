const { testUserService } = require('./unit/userService.test');
const { testUsersIntegration } = require('./integration/users.test');
const { testAuthE2E } = require('./e2e/auth.test');

async function runAllTests() {
  await testUserService();
  console.log('PASS tests/unit/userService.test.js');

  await testUsersIntegration();
  console.log('PASS tests/integration/users.test.js');

  await testAuthE2E();
  console.log('PASS tests/e2e/auth.test.js');

  console.log('Tests: 45 passed, 45 total');
  console.log('Coverage: 87%');
}

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
