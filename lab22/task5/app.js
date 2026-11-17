require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { createPool } = require('./config/database');
const config = require('./config');
const router = require('./routes');
const dbMiddleware = require('./middleware/db');
const errorMiddleware = require('./middleware/errors');
const loggerMiddleware = require('./middleware/logger');

const app = new Koa();

createPool();
console.log(`[INFO] Pul MySQL sozdan (limit: ${config.db.connectionLimit})`);

app.use(errorMiddleware);
app.use(loggerMiddleware);
app.use(bodyParser({ jsonLimit: '1mb' }));
app.use(dbMiddleware);
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(config.port, () => {
  console.log(`[INFO] Koa-server zapushchen na portu ${config.port}`);
  console.log(`[INFO] Gruppa: BBMO-01-23`);
});

module.exports = app;
