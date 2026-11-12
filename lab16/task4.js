const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = path.join(__dirname, 'operations.log');

app.use(express.json());

function logOperation(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line, 'utf-8');
}

let books = [
  { id: 1, title: 'Война и мир', author: 'Толстой', year: 1869, genre: 'роман' },
  { id: 2, title: 'Анна Каренина', author: 'Толстой', year: 1877, genre: 'роман' },
  { id: 3, title: 'Преступление и наказание', author: 'Достоевский', year: 1866, genre: 'роман' },
  { id: 4, title: 'Идиот', author: 'Достоевский', year: 1869, genre: 'роман' },
  { id: 5, title: 'Отцы и дети', author: 'Тургенев', year: 1862, genre: 'роман' },
  { id: 6, title: 'Евгений Онегин', author: 'Пушкин', year: 1833, genre: 'поэма' },
  { id: 7, title: 'Капитанская дочка', author: 'Пушкин', year: 1836, genre: 'повесть' },
  { id: 8, title: 'Герой нашего времени', author: 'Лермонтов', year: 1840, genre: 'роман' },
  { id: 9, title: 'Мертвые души', author: 'Гоголь', year: 1842, genre: 'поэма' },
  { id: 10, title: 'Ревизор', author: 'Гоголь', year: 1836, genre: 'комедия' },
  { id: 11, title: 'Вишневый сад', author: 'Чехов', year: 1904, genre: 'пьеса' },
  { id: 12, title: 'Чайка', author: 'Чехов', year: 1896, genre: 'пьеса' },
  { id: 13, title: 'Собачье сердце', author: 'Булгаков', year: 1925, genre: 'повесть' }
];
let nextId = 14;

app.get('/api/books/stats', (req, res) => {
  const totalBooks = books.length;
  const byAuthor = {};
  const byGenre = {};
  let oldestYear = books.length ? books[0].year : 0;
  let newestYear = books.length ? books[0].year : 0;

  books.forEach((b) => {
    byAuthor[b.author] = (byAuthor[b.author] || 0) + 1;
    byGenre[b.genre] = (byGenre[b.genre] || 0) + 1;
    if (b.year < oldestYear) oldestYear = b.year;
    if (b.year > newestYear) newestYear = b.year;
  });

  const stats = {
    totalBooks,
    oldestYear,
    newestYear,
    byAuthor,
    byGenre
  };
  logOperation('GET /api/books/stats - Uspeshno poluchena statistika');
  res.status(200).json(stats);
});

app.get('/api/books', (req, res) => {
  let result = [...books];
  const { author, year, yearFrom, yearTo, limit, page, sort, search } = req.query;

  if (author) {
    result = result.filter((b) => b.author.toLowerCase().includes(author.toLowerCase()));
  }

  if (year) {
    const y = parseInt(year, 10);
    result = result.filter((b) => b.year === y);
  }

  if (yearFrom !== undefined || yearTo !== undefined) {
    const from = yearFrom ? parseInt(yearFrom, 10) : -Infinity;
    const to = yearTo ? parseInt(yearTo, 10) : Infinity;
    result = result.filter((b) => b.year >= from && b.year <= to);
  }

  if (search) {
    const s = search.toLowerCase();
    result = result.filter((b) => b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s));
  }

  if (sort) {
    if (sort === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    } else if (sort === '-title') {
      result.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
    } else if (sort === 'year') {
      result.sort((a, b) => a.year - b.year);
    } else if (sort === '-year') {
      result.sort((a, b) => b.year - a.year);
    }
  }

  logOperation(`GET /api/books - Naideno ${result.length} knig`);

  if (limit !== undefined || page !== undefined) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, parseInt(limit, 10) || 10);
    const startIndex = (p - 1) * l;
    const paginated = result.slice(startIndex, startIndex + l);
    return res.status(200).json({
      total: result.length,
      page: p,
      limit: l,
      totalPages: Math.ceil(result.length / l),
      data: paginated
    });
  }

  res.status(200).json(result);
});

app.get('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find((b) => b.id === id);
  if (!book) {
    logOperation(`GET /api/books/${id} - Kniga ne naydena (404)`);
    return res.status(404).json({ error: 'Kniga ne naydena', status: 404 });
  }
  logOperation(`GET /api/books/${id} - Kniga uspeshno poluchena`);
  res.status(200).json(book);
});

app.post('/api/books', (req, res) => {
  const { title, author, year, genre } = req.body || {};
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Pole title dolzhno byt ne pustoy strokoy', status: 400 });
  }
  if (!author || typeof author !== 'string' || !author.trim()) {
    return res.status(400).json({ error: 'Pole author dolzhno byt ne pustoy strokoy', status: 400 });
  }
  const parsedYear = Number(year);
  if (year === undefined || isNaN(parsedYear) || !Number.isInteger(parsedYear)) {
    return res.status(400).json({ error: 'Pole year dolzhno byt celym chislom', status: 400 });
  }

  const isDuplicate = books.some(
    (b) => b.title.toLowerCase() === title.trim().toLowerCase() && b.author.toLowerCase() === author.trim().toLowerCase()
  );
  if (isDuplicate) {
    logOperation(`POST /api/books - Dublikat knigi: ${title}`);
    return res.status(409).json({ error: 'Kniga s takim nazvaniem i avtorom uzhe sushchestvuet', status: 409 });
  }

  const newBook = {
    id: nextId++,
    title: title.trim(),
    author: author.trim(),
    year: parsedYear,
    genre: (genre && typeof genre === 'string') ? genre.trim() : 'neukazan'
  };
  books.push(newBook);
  logOperation(`POST /api/books - Uspeshno sozdana kniga ID=${newBook.id}`);
  res.status(201).json(newBook);
});

app.put('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find((b) => b.id === id);
  if (!book) {
    logOperation(`PUT /api/books/${id} - Kniga ne naydena (404)`);
    return res.status(404).json({ error: 'Kniga ne naydena', status: 404 });
  }
  const { title, author, year, genre } = req.body || {};
  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Pole title dolzhno byt ne pustoy strokoy', status: 400 });
    }
    book.title = title.trim();
  }
  if (author !== undefined) {
    if (typeof author !== 'string' || !author.trim()) {
      return res.status(400).json({ error: 'Pole author dolzhno byt ne pustoy strokoy', status: 400 });
    }
    book.author = author.trim();
  }
  if (year !== undefined) {
    const parsedYear = Number(year);
    if (isNaN(parsedYear) || !Number.isInteger(parsedYear)) {
      return res.status(400).json({ error: 'Pole year dolzhno byt celym chislom', status: 400 });
    }
    book.year = parsedYear;
  }
  if (genre !== undefined) {
    book.genre = String(genre).trim();
  }
  logOperation(`PUT /api/books/${id} - Uspeshno obnovlena kniga`);
  res.status(200).json(book);
});

app.delete('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    logOperation(`DELETE /api/books/${id} - Kniga ne naydena (404)`);
    return res.status(404).json({ error: 'Kniga ne naydena', status: 404 });
  }
  const removed = books.splice(index, 1)[0];
  logOperation(`DELETE /api/books/${id} - Uspeshno udalena kniga`);
  res.status(200).json({ message: 'Kniga uspeshno udalena', book: removed });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
  });
}

module.exports = app;
