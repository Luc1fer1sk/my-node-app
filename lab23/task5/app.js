require('dotenv').config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { connectDB } = require('./config/database');
const { dbMiddleware } = require('./middleware/db');
const { loggerMiddleware } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errors');
const { initWebSocket } = require('./streams/changeStream');
const router = require('./routes');

const app = new Koa();
const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

let server = null;
let wss = null;

async function startServer() {
  const { db } = await connectDB();
  console.log('[INFO] Change Stream zapushchen');

  app.use(errorHandler);
  app.use(loggerMiddleware);
  app.use(bodyParser());
  app.use(dbMiddleware(db));
  app.use(router.routes()).use(router.allowedMethods());

  server = app.listen(PORT, () => {
    console.log(`[INFO] Koa-server na portu ${PORT}`);
  });

  wss = initWebSocket(WS_PORT);

  return { app, server, wss };
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
