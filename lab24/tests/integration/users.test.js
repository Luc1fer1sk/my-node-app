const assert = require('assert');
const { User } = require('../../models/user');

async function testUsersIntegration() {
  const user = await User.findById('65a50f12a3b4c5d6e7f80001');
  assert(user !== null, 'Polzovatel dolzhen sushchestvovat');
  assert(user.name === 'Ivan', 'Imya dolzhno byt Ivan');
  return true;
}

module.exports = { testUsersIntegration };
