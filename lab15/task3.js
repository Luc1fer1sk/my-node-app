const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 3000;

function formatDateTime(date) {
  const pad = (num) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message || 'Vnutrennyaya oshibka servera',
      status: ctx.status
    };
  }
});

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const end = new Date();
  const ms = end.getTime() - start.getTime();
  console.log(`[${formatDateTime(start)}] ${ctx.method} ${ctx.url} - ${ms}ms`);
});

const authMiddleware = async (ctx, next) => {
  const authHeader = ctx.headers['authorization'];
  if (!authHeader) {
    ctx.status = 401;
    ctx.body = {
      error: 'Oshibka avtorizacii: otsutstvuet zagolovok Authorization',
      status: 401
    };
    return;
  }
  await next();
};

router.get('/users', (ctx) => {
  ctx.status = 200;
  ctx.body = [
    { id: 1, name: 'Овчинников Денис', group: '477' },
    { id: 2, name: 'Иванов Иван', group: '477' }
  ];
});

router.get('/protected', authMiddleware, (ctx) => {
  ctx.status = 200;
  ctx.body = {
    message: 'Dostup k zashchishchennomu marshrutu poluchen uspeshno',
    user: 'Ovchinnikov Denis',
    group: '477'
  };
});

router.get('/error', () => {
  throw new Error('Testovaya vnutrennyaya oshibka servera');
});

app.use(router.routes());
app.use(router.allowedMethods());

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
  });
}

module.exports = app;
