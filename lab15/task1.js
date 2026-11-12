const Koa = require('koa');

const app = new Koa();
const PORT = process.env.PORT || 3000;

app.use(async (ctx) => {
  if (ctx.path === '/' && ctx.method === 'GET') {
    const now = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    ctx.type = 'html';
    ctx.body = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Laboratornaya rabota 15</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f6f9; margin: 40px; color: #333; }
    .card { background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 600px; margin: auto; }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    p { font-size: 16px; line-height: 1.5; }
    .time { color: #16a085; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Лабораторная работа №15</h1>
    <p><strong>Студент:</strong> Овчинников Денис Владимирович</p>
    <p><strong>Группа:</strong> 477</p>
    <p><strong>Текущая дата и время:</strong> <span class="time">${now}</span></p>
    <p><strong>Приветственное сообщение:</strong> Добро пожаловать! Базовый HTTP-сервер на Koa.js успешно настроен и работает.</p>
  </div>
</body>
</html>`;
  } else {
    ctx.status = 404;
    ctx.body = 'Stranica ne naydena';
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
  });
}

module.exports = app;
