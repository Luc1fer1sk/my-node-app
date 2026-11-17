const studentModel = require('../models/student');
const cache = require('../services/cache');
const { validate } = require('../services/validation');
const { recordCacheHit } = require('../config/metrics');

const studentController = {
  async list(ctx) {
    const limit = parseInt(ctx.query.limit) || 10;
    const offset = parseInt(ctx.query.offset) || 0;
    const cacheKey = `students:list:${limit}:${offset}`;
    const cached = cache.get(cacheKey);
    recordCacheHit(!!cached);
    if (cached) { ctx.body = cached; return; }
    const result = await studentModel.findAll({ limit, offset });
    const body = { data: result.data, pagination: { total: result.total, limit, offset, pages: result.pages } };
    cache.set(cacheKey, body);
    ctx.body = body;
  },

  async getOne(ctx) {
    const student = await studentModel.findById(parseInt(ctx.params.id));
    if (!student) { ctx.status = 404; ctx.body = { error: 'Student ne nayden' }; return; }
    ctx.body = student;
  },

  async create(ctx) {
    const data = ctx.request.body;
    const errors = validate(data);
    if (errors.length) { ctx.status = 400; ctx.body = { error: 'Oshibka validatsii', details: errors }; return; }
    const student = await studentModel.create(data);
    cache.invalidate('students:');
    ctx.status = 201;
    ctx.body = student;
  },

  async update(ctx) {
    const id = parseInt(ctx.params.id);
    const existing = await studentModel.findById(id);
    if (!existing) { ctx.status = 404; ctx.body = { error: 'Student ne nayden' }; return; }
    const student = await studentModel.update(id, ctx.request.body);
    cache.invalidate('students:');
    ctx.body = student;
  },

  async remove(ctx) {
    const id = parseInt(ctx.params.id);
    const deleted = await studentModel.delete(id);
    if (!deleted) { ctx.status = 404; ctx.body = { error: 'Student ne nayden' }; return; }
    cache.invalidate('students:');
    ctx.status = 204;
  },

  async stats(ctx) {
    const cached = cache.get('students:stats');
    recordCacheHit(!!cached);
    if (cached) { ctx.body = cached; return; }
    const stats = await studentModel.getStats();
    cache.set('students:stats', stats);
    ctx.body = stats;
  },

  async batch(ctx) {
    const students = ctx.request.body;
    if (!Array.isArray(students)) { ctx.status = 400; ctx.body = { error: 'Ozhidaetsya massiv' }; return; }
    for (const s of students) {
      const errors = validate(s);
      if (errors.length) { ctx.status = 400; ctx.body = { error: 'Oshibka validatsii', details: errors }; return; }
    }
    try {
      const ids = await studentModel.createBatch(students);
      cache.invalidate('students:');
      ctx.status = 201;
      ctx.body = { created: ids.length, transaction: 'committed' };
    } catch (err) {
      ctx.status = 409;
      ctx.body = { error: 'Tranzaktsiya otkatana', details: err.message, transaction: 'rolled back' };
    }
  },
};

module.exports = studentController;
