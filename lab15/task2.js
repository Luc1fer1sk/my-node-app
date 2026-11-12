const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 3000;

let users = [
  { id: 1, name: 'Овчинников Денис', group: '477' },
  { id: 2, name: 'Иванов Иван', group: '477' },
  { id: 3, name: 'Петров Петр', group: '477' }
];
let nextId = 4;

router.get('/api/users', (ctx) => {
  ctx.status = 200;
  ctx.body = users;
});

router.get('/api/users/:id', (ctx) => {
  const id = parseInt(ctx.params.id, 10);
  const user = users.find((u) => u.id === id);
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: 'Polzovatel ne nayden', status: 404 };
    return;
  }
  ctx.status = 200;
  ctx.body = user;
});

router.post('/api/users', (ctx) => {
  const body = ctx.request.body;
  if (!body || typeof body.name !== 'string' || !body.name.trim() || typeof body.group !== 'string' || !body.group.trim()) {
    ctx.status = 400;
    ctx.body = { error: 'Nekorrektnye dannye zaprosa. Trebuyutsya polya name i group', status: 400 };
    return;
  }
  const newUser = {
    id: nextId++,
    name: body.name.trim(),
    group: body.group.trim()
  };
  users.push(newUser);
  ctx.status = 201;
  ctx.body = newUser;
});

router.put('/api/users/:id', (ctx) => {
  const id = parseInt(ctx.params.id, 10);
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    ctx.status = 404;
    ctx.body = { error: 'Polzovatel ne nayden', status: 404 };
    return;
  }
  const body = ctx.request.body;
  if (!body || (!body.name && !body.group)) {
    ctx.status = 400;
    ctx.body = { error: 'Nekorrektnye dannye dlya obnovleniya', status: 400 };
    return;
  }
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      ctx.status = 400;
      ctx.body = { error: 'Pole name dolzhno byt nestustoy strokoy', status: 400 };
      return;
    }
    users[userIndex].name = body.name.trim();
  }
  if (body.group !== undefined) {
    if (typeof body.group !== 'string' || !body.group.trim()) {
      ctx.status = 400;
      ctx.body = { error: 'Pole group dolzhno byt nestustoy strokoy', status: 400 };
      return;
    }
    users[userIndex].group = body.group.trim();
  }
  ctx.status = 200;
  ctx.body = users[userIndex];
});

router.delete('/api/users/:id', (ctx) => {
  const id = parseInt(ctx.params.id, 10);
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    ctx.status = 404;
    ctx.body = { error: 'Polzovatel ne nayden', status: 404 };
    return;
  }
  users.splice(userIndex, 1);
  ctx.status = 200;
  ctx.body = { message: 'Polzovatel uspeshno udalen', id };
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
  });
}

module.exports = app;
