const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const now = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  res.type('html').send(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Laboratornaya rabota 16</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f6f9; margin: 40px; color: #333; }
    .card { background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 650px; margin: auto; }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    p { font-size: 16px; line-height: 1.5; }
    .time { color: #16a085; font-weight: bold; }
    ul { list-style-type: none; padding-left: 0; }
    li { margin: 8px 0; }
    a { color: #2980b9; text-decoration: none; font-weight: bold; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Лабораторная работа №16</h1>
    <p><strong>Студент:</strong> Овчинников Денис Владимирович</p>
    <p><strong>Группа:</strong> 477</p>
    <p><strong>Текущая дата и время:</strong> <span class="time">${now}</span></p>
    <p><strong>Приветственное сообщение:</strong> Добро пожаловать! Базовый HTTP-сервер на Express.js успешно настроен и функционирует.</p>
    <h3>Доступные маршруты:</h3>
    <ul>
      <li><a href="/">/</a> - Главная страница</li>
      <li><a href="/about">/about</a> - Информация о разработчике</li>
      <li><a href="/contacts">/contacts</a> - Контактная информация</li>
    </ul>
  </div>
</body>
</html>`);
});

app.get('/about', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>O razrabotchike</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f6f9; margin: 40px; color: #333; }
    .card { background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 650px; margin: auto; }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    p { font-size: 16px; line-height: 1.5; }
    a { color: #2980b9; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Информация о разработчике</h1>
    <p><strong>ФИО:</strong> Овчинников Денис Владимирович</p>
    <p><strong>Группа:</strong> 477</p>
    <p><strong>Специализация:</strong> Backend-разработка на Node.js / Express.js</p>
    <p><a href="/">&larr; Вернуться на главную</a></p>
  </div>
</body>
</html>`);
});

app.get('/contacts', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Kontakty</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f6f9; margin: 40px; color: #333; }
    .card { background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 650px; margin: auto; }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    p { font-size: 16px; line-height: 1.5; }
    a { color: #2980b9; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Контактная информация</h1>
    <p><strong>Email:</strong> ovchinnikov.denis@example.com</p>
    <p><strong>GitHub:</strong> <a href="https://github.com/Luc1fer1sk" target="_blank">github.com/Luc1fer1sk</a></p>
    <p><strong>Группа:</strong> 477</p>
    <p><a href="/">&larr; Вернуться на главную</a></p>
  </div>
</body>
</html>`);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
  });
}

module.exports = app;
