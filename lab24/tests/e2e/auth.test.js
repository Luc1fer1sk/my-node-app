const assert = require('assert');
const { authService } = require('../../services/authService');

async function testAuthE2E() {
  const reg = await authService.register({
    name: 'E2E Tester',
    email: 'e2e_test_' + Date.now() + '@example.com',
    password: 'password123'
  });
  assert(reg.accessToken, 'AccessToken dolzhen byt sgenerirovan');
  assert(reg.refreshToken, 'RefreshToken dolzhen byt sgenerirovan');
  return true;
}

module.exports = { testAuthE2E };
