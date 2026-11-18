const { authService } = require('../services/authService');

async function register(ctx) {
  const result = await authService.register(ctx.request.body);
  ctx.status = 201;
  ctx.body = result;
}

async function login(ctx) {
  const { email, password } = ctx.request.body;
  const result = await authService.login(email, password);
  ctx.body = result;
}

async function refresh(ctx) {
  const { refreshToken } = ctx.request.body;
  const result = await authService.refresh(refreshToken);
  ctx.body = result;
}

async function logout(ctx) {
  ctx.body = { message: 'Uspeshny vyhod' };
}

module.exports = { register, login, refresh, logout };
