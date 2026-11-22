const { StudentDAO } = require('../dao/studentDao');

function dbMiddleware(db) {
  const dao = new StudentDAO(db);
  return async (ctx, next) => {
    ctx.state.dao = dao;
    await next();
  };
}

module.exports = { dbMiddleware };
