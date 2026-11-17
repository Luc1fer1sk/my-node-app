const groupModel = require('../models/group');

const groupController = {
  async list(ctx) {
    const groups = await groupModel.findAll();
    ctx.body = { data: groups };
  },

  async create(ctx) {
    const { group_name } = ctx.request.body;
    if (!group_name) { ctx.status = 400; ctx.body = { error: 'group_name obyazatelen' }; return; }
    const result = await groupModel.create(group_name);
    ctx.status = 201;
    ctx.body = result;
  },

  async getStudents(ctx) {
    const students = await groupModel.getStudentsByGroup(ctx.params.id);
    ctx.body = { data: students, group: ctx.params.id, count: students.length };
  },
};

module.exports = groupController;
