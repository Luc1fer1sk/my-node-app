const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
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

app.use((req, res, next) => {
  const start = new Date();
  res.on('finish', () => {
    const ms = Date.now() - start.getTime();
    console.log(`[${formatDateTime(start)}] ${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${ms}ms`);
  });
  next();
});

app.use(compression());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Slishkom mnogo zaprosov, pozhaluysta poprobuite pozzhe',
    status: 429
  }
});
app.use(limiter);

app.use(express.json());

let books = [
  { id: 1, title: 'Война и мир', author: 'Толстой', year: 1869 },
  { id: 2, title: 'Преступление и наказание', author: 'Достоевский', year: 1866 }
];

app.get('/books', (req, res) => {
  res.status(200).json(books);
});

app.post('/books', (req, res) => {
  const { title, author, year } = req.body || {};
  if (!title || !author) {
    const err = new Error('Polya title i author obyazatelny');
    err.status = 400;
    return next(err);
  }
  const newBook = { id: books.length + 1, title, author, year: year || 2024 };
  books.push(newBook);
  res.status(201).json(newBook);
});

app.get('/error', () => {
  throw new Error('Testovaya sinkhronnaya oshibka');
});

app.get('/async-error', (req, res, next) => {
  setImmediate(() => {
    const err = new Error('Testovaya asinkhronnaya oshibka');
    err.status = 500;
    next(err);
  });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Vnutrennyaya oshibka servera',
    status
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
  });
}

module.exports = app;
