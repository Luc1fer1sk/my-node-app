const { validateStudent } = require('../services/validationService');
const { cache } = require('../services/cacheService');

async function getAll(ctx) {
  const cacheKey = `students:${JSON.stringify(ctx.query)}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    ctx.body = cached;
    return;
  }
  const result = await ctx.state.dao.findAll(ctx.query);
  cache.set(cacheKey, result);
  ctx.body = result;
}

async function getById(ctx) {
  const student = await ctx.state.dao.findById(ctx.params.id);
  if (!student) {
    ctx.status = 404;
    ctx.body = { error: true, message: 'Student ne nayden' };
    return;
  }
  ctx.body = student;
}

async function create(ctx) {
  const validation = validateStudent(ctx.request.body);
  if (!validation.valid) {
    ctx.status = 400;
    ctx.body = { error: true, message: validation.message };
    return;
  }
  const created = await ctx.state.dao.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = created;
}

async function update(ctx) {
  const updated = await ctx.state.dao.update(ctx.params.id, ctx.request.body);
  if (!updated) {
    ctx.status = 404;
    ctx.body = { error: true, message: 'Student ne nayden dlya obnovleniya' };
    return;
  }
  ctx.body = updated;
}

async function remove(ctx) {
  const ok = await ctx.state.dao.delete(ctx.params.id);
  if (!ok) {
    ctx.status = 404;
    ctx.body = { error: true, message: 'Student ne nayden dlya udaleniya' };
    return;
  }
  ctx.body = { success: true, deleted: true };
}

async function search(ctx) {
  const query = ctx.query.q || '';
  const result = await ctx.state.dao.search(query);
  ctx.body = result;
}

async function stats(ctx) {
  const result = await ctx.state.dao.getStats();
  ctx.body = result;
}

async function batch(ctx) {
  const items = Array.isArray(ctx.request.body) ? ctx.request.body : [];
  const result = await ctx.state.dao.batchCreate(items);
  ctx.body = result;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
  stats,
  batch
};
