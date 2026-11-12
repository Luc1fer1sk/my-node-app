const express = require('express');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_bbmo_477';

app.use(express.json());

const cache = new Map();
function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.data;
}
function setCache(key, data, ttlMs = 5 * 60 * 1000) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}
function clearCache() {
  cache.clear();
}

const titles = [
  'Война и мир', 'Анна Каренина', 'Преступление и наказание', 'Идиот',
  'Братья Карамазовы', 'Отцы и дети', 'Дворянское гнездо', 'Евгений Онегин',
  'Капитанская дочка', 'Герой нашего времени', 'Мертвые души', 'Ревизор',
  'Вишневый сад', 'Чайка', 'Палата №6', 'Мастер и Маргарита',
  'Белая гвардия', 'Собачье сердце', 'Тихий Дон', 'Судьба человека',
  'Доктор Живаго', 'Один день Ивана Денисовича', 'Котлован', 'Чевенгур',
  'Мы', 'Двенадцать стульев', 'Золотой теленок', 'Аэлита'
];

const authors = [
  'Лев Толстой', 'Федор Достоевский', 'Иван Тургенев', 'Александр Пушкин',
  'Михаил Лермонтов', 'Николай Гоголь', 'Антон Чехов', 'Михаил Булгаков',
  'Михаил Шолохов', 'Борис Пастернак', 'Александр Солженицын', 'Андрей Платонов',
  'Евгений Замятин', 'Илья Ильф', 'Евгений Петров', 'Алексей Толстой'
];

const genres = ['роман', 'повесть', 'поэма', 'драма', 'пьеса', 'фантастика', 'сатира'];

function generateInitialBooks() {
  const list = [];
  for (let i = 1; i <= 100; i++) {
    const title = `${titles[(i * 3) % titles.length]} (Том ${(i % 4) + 1})`;
    const author = authors[(i * 5) % authors.length];
    const genre = genres[i % genres.length];
    const year = 1820 + (i * 2);
    const isbn = `978-5-477-${String(i).padStart(5, '0')}-${(i * 3) % 10}`;
    const available = (i % 4) !== 0;
    const copies = (i % 6) + 1;
    list.push({
      id: i,
      title,
      author,
      genre,
      year,
      isbn,
      available,
      copies,
      reviews: [
        { id: 1, author: 'Студент 477', rating: 5, comment: 'Otlichnaya kniga dlya izucheniya' }
      ]
    });
  }
  return list;
}

let books = generateInitialBooks();
let nextBookId = 101;

let users = [
  { id: 1, email: 'admin@example.com', password: 'admin123', name: 'Овчинников Денис', role: 'admin' },
  { id: 2, email: 'user@example.com', password: 'user123', name: 'Иванов Иван', role: 'user' }
];
let nextUserId = 3;

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Library REST API - Laboratornaya 16',
    version: '1.0.0',
    description: 'Dokumentaciya API biblioteki dlya gruppy 477'
  },
  servers: [{ url: `http://localhost:${PORT}` }],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Registraciya novogo polzovatelya',
        responses: { 201: { description: 'Uspeshnaya registraciya' } }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Vhod v sistemu i poluchenie JWT',
        responses: { 200: { description: 'Uspeshnyi vhod s tokenom' } }
      }
    },
    '/api/books': {
      get: {
        summary: 'Poluchenie spiska knig s paginatsiey i filtrami',
        responses: { 200: { description: 'Spisok knig' } }
      },
      post: {
        summary: 'Dobavlenie knigi (tolko admin)',
        responses: { 201: { description: 'Kniga sozdana' } }
      }
    },
    '/api/books/{id}': {
      get: {
        summary: 'Poluchenie knigi po ID',
        responses: { 200: { description: 'Kniga naydena' }, 404: { description: 'Kniga ne naydena' } }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/auth/register', (req, res) => {
  const { email, password, name, role } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Polya email, password i name obyazatelny', status: 400 });
  }
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: 'Polzovatel s takim email uzhe sushchestvuet', status: 409 });
  }
  const newUser = {
    id: nextUserId++,
    email: email.trim().toLowerCase(),
    password,
    name: name.trim(),
    role: role === 'admin' ? 'admin' : 'user'
  };
  users.push(newUser);
  res.status(201).json({ message: 'Polzovatel uspeshno zaregistrirovan', id: newUser.id, email: newUser.email, role: newUser.role });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Neverny email ili parol', status: 401 });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
  res.status(200).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Oshibka avtorizacii: otsutstvuet token', status: 401 });
  }
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Oshibka avtorizacii: neverny ili prosrochenny token', status: 403 });
    }
    req.user = decoded;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Dostup zapreshchen: trebuetsya rol administratora', status: 403 });
  }
  next();
}

app.get('/api/admin/status', authenticateToken, requireAdmin, (req, res) => {
  res.status(200).json({
    message: 'Dostup v panel administratora razreshen',
    admin: req.user.name,
    totalBooks: books.length,
    totalUsers: users.length
  });
});

app.get('/api/books/export', authenticateToken, (req, res) => {
  const format = (req.query.format || 'json').toLowerCase();
  if (format === 'csv') {
    let csv = 'id,title,author,genre,year,isbn,available\n';
    books.forEach((b) => {
      csv += `${b.id},"${b.title}","${b.author}","${b.genre}",${b.year},"${b.isbn}",${b.available}\n`;
    });
    res.type('text/csv').send(csv);
    return;
  }
  res.status(200).json(books);
});

app.post('/api/books/import', authenticateToken, requireAdmin, (req, res) => {
  const { books: importedList } = req.body || {};
  if (!Array.isArray(importedList) || importedList.length === 0) {
    return res.status(400).json({ error: 'Ozhidalsya ne pustoy massiv knig v pole books', status: 400 });
  }
  let addedCount = 0;
  importedList.forEach((b) => {
    if (b.title && b.author) {
      books.push({
        id: nextBookId++,
        title: String(b.title).trim(),
        author: String(b.author).trim(),
        genre: b.genre || 'raznoe',
        year: Number(b.year) || 2024,
        isbn: b.isbn || `978-5-477-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        available: true,
        copies: 1,
        reviews: []
      });
      addedCount++;
    }
  });
  clearCache();
  res.status(201).json({ message: `Uspeshno importirovano knig: ${addedCount}`, totalBooks: books.length });
});

app.get('/api/books/available', authenticateToken, (req, res) => {
  const availableBooks = books.filter((b) => b.available);
  res.status(200).json({ total: availableBooks.length, data: availableBooks });
});

app.get('/api/books/recommendations', authenticateToken, (req, res) => {
  const { genre } = req.query;
  const filtered = genre
    ? books.filter((b) => b.genre.toLowerCase() === genre.toLowerCase()).slice(0, 5)
    : books.slice(0, 5);
  res.status(200).json({ genre: genre || 'vse', recommendations: filtered });
});

app.get('/api/books', authenticateToken, (req, res) => {
  const cacheKey = req.originalUrl || req.url;
  const cached = getCache(cacheKey);
  if (cached) {
    return res.status(200).json({ cached: true, ...cached });
  }

  let result = [...books];
  const { search, sort, limit = '10', page = '1', genre } = req.query;

  if (genre) {
    result = result.filter((b) => b.genre.toLowerCase() === genre.toLowerCase());
  }

  if (search) {
    const s = String(search).toLowerCase();
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

  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 10);
  const startIndex = (p - 1) * l;
  const paginated = result.slice(startIndex, startIndex + l);

  const responsePayload = {
    total: result.length,
    page: p,
    limit: l,
    totalPages: Math.ceil(result.length / l),
    data: paginated
  };

  setCache(cacheKey, responsePayload);
  res.status(200).json(responsePayload);
});

app.get('/api/books/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find((b) => b.id === id);
  if (!book) {
    return res.status(404).json({ error: 'Kniga ne naydena', status: 404 });
  }
  res.status(200).json(book);
});

app.post('/api/books', authenticateToken, requireAdmin, (req, res) => {
  const { title, author, year, genre, isbn } = req.body || {};
  if (!title || !author || !year || !isbn) {
    return res.status(400).json({ error: 'Polya title, author, year i isbn obyazatelny', status: 400 });
  }
  const parsedYear = Number(year);
  if (isNaN(parsedYear) || !Number.isInteger(parsedYear)) {
    return res.status(400).json({ error: 'Pole year dolzhno byt celym chislom', status: 400 });
  }
  const newBook = {
    id: nextBookId++,
    title: String(title).trim(),
    author: String(author).trim(),
    year: parsedYear,
    genre: genre || 'raznoe',
    isbn: String(isbn).trim(),
    available: true,
    copies: 1,
    reviews: []
  };
  books.push(newBook);
  clearCache();
  res.status(201).json(newBook);
});

app.put('/api/books/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find((b) => b.id === id);
  if (!book) {
    return res.status(404).json({ error: 'Kniga ne naydena', status: 404 });
  }
  const { title, author, year, genre, available } = req.body || {};
  if (title !== undefined) book.title = String(title).trim();
  if (author !== undefined) book.author = String(author).trim();
  if (year !== undefined) book.year = Number(year);
  if (genre !== undefined) book.genre = String(genre).trim();
  if (available !== undefined) book.available = Boolean(available);
  clearCache();
  res.status(200).json(book);
});

app.delete('/api/books/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Kniga ne naydena', status: 404 });
  }
  const removed = books.splice(index, 1)[0];
  clearCache();
  res.status(200).json({ message: 'Kniga uspeshno udalena administratorom', book: removed });
});

app.post('/api/books/:id/reviews', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find((b) => b.id === id);
  if (!book) {
    return res.status(404).json({ error: 'Kniga ne naydena', status: 404 });
  }
  const { rating, comment } = req.body || {};
  if (!rating || !comment) {
    return res.status(400).json({ error: 'Polya rating i comment obyazatelny', status: 400 });
  }
  const review = {
    id: book.reviews.length + 1,
    author: req.user.name,
    rating: Number(rating),
    comment: String(comment).trim(),
    createdAt: new Date().toISOString()
  };
  book.reviews.push(review);
  clearCache();
  res.status(201).json({ message: 'Otzyv uspeshno dobavlen', review });
});

if (require.main === module) {
  console.log('Generaciya dannyh: sozdano 100 knig dlya gruppy 477');
  app.listen(PORT, () => {
    console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
    console.log(`Swagger dokumentaciya dostupna: http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
