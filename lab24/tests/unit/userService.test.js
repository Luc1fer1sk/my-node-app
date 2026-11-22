const assert = require('assert');
const { userService } = require('../../services/userService');

async function testUserService() {
  const users = await userService.getAllUsers();
  assert(Array.isArray(users.data), 'Users data dolzhno byt massivom');
  assert(users.pagination.total >= 0, 'Total dolzhen byt neotricatelnym');
  return true;
}

module.exports = { testUserService };
