const Router = require('koa-router');
const usersRouter = require('./users');
const authRouter = require('./auth');
const adminRouter = require('./admin');
const statsCtrl = require('../controllers/statsController');

const router = new Router();

router.get('/health', statsCtrl.getHealth);
router.get('/metrics', statsCtrl.getMetrics);

router.get('/api-docs', async (ctx) => {
  ctx.type = 'html';
  ctx.body = `<!DOCTYPE html>
<html>
<head>
  <title>Swagger UI - Lab 24 REST API</title>
  <meta charset="utf-8"/>
</head>
<body style="font-family:sans-serif;background:#1e1e2e;color:#cdd6f4;padding:30px;">
  <h1>Swagger UI - Lab 24 API</h1>
  <p>Gruppa: BBMO-01-23</p>
  <h3>Endpoity:</h3>
  <ul>
    <li>GET /api/users</li>
    <li>POST /api/users</li>
    <li>GET /api/users/:id</li>
    <li>POST /api/auth/register</li>
    <li>POST /api/auth/login</li>
    <li>GET /api/admin/users</li>
    <li>GET /health</li>
    <li>GET /metrics</li>
  </ul>
</body>
</html>`;
});

router.use(usersRouter.routes(), usersRouter.allowedMethods());
router.use(authRouter.routes(), authRouter.allowedMethods());
router.use(adminRouter.routes(), adminRouter.allowedMethods());

module.exports = router;
