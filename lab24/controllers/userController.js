const { userService } = require('../services/userService');

async function getUsers(ctx) {
  const result = await userService.getAllUsers(ctx.query);
  ctx.body = result;
}

async function getUserById(ctx) {
  const user = await userService.getUserById(ctx.params.id);
  ctx.body = { data: user };
}

async function createUser(ctx) {
  const user = await userService.createUser(ctx.request.body);
  ctx.status = 201;
  ctx.body = { data: user };
}

async function updateUser(ctx) {
  const updated = await userService.updateUser(ctx.params.id, ctx.request.body);
  ctx.body = { data: updated };
}

async function deleteUser(ctx) {
  await userService.deleteUser(ctx.params.id);
  ctx.body = { success: true, deleted: true };
}

async function searchUsers(ctx) {
  const q = ctx.query.search || ctx.query.q || '';
  const result = await userService.searchUsers(q);
  ctx.body = result;
}

async function getStats(ctx) {
  const stats = await userService.getStats();
  ctx.body = stats;
}

async function exportCSV(ctx) {
  const csv = await userService.exportCSV();
  ctx.set('Content-Type', 'text/csv');
  ctx.set('Content-Disposition', 'attachment; filename="users.csv"');
  ctx.body = csv;
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getStats,
  exportCSV
};
