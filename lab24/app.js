require('dotenv').config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { WebSocketServer } = require('ws');
const { connectDB } = require('./db');
const { errorMiddleware } = require('./middleware/errorMiddleware');
const { loggerMiddleware } = require('./middleware/loggerMiddleware');
const { dbMiddleware } = require('./middleware/dbMiddleware');
const { rateLimitMiddleware } = require('./middleware/rateLimitMiddleware');
const router = require('./routes');

const app = new Koa();
const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

let server = null;
let wss = null;

async function start() {
  await connectDB();
  console.log(`[INFO] Koa-server na portu ${PORT}`);
  console.log('[INFO] Gruppa: BBMO-01-23');

  app.use(errorMiddleware);
  app.use(loggerMiddleware);
  app.use(rateLimitMiddleware);
  app.use(dbMiddleware);
  app.use(bodyParser());

  app.use(router.routes()).use(router.allowedMethods());

  server = app.listen(PORT);

  wss = new WebSocketServer({ port: WS_PORT });
  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ event: 'connected', message: 'WS soedinenie aktivno' }));
  });

  return { app, server, wss };
}

if (require.main === module) {
  start();
}

module.exports = { app, start };
