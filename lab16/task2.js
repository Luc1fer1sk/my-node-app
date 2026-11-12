const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let books = [
  { id: 1, title: 'Война и мир', author: 'Толстой', year: 1869 },
  { id: 2, title: 'Преступление и наказание', author: 'Достоевский', year: 1866 },
  { id: 3, title: 'Анна Каренина', author: 'Толстой', year: 1877 }
];
let nextId = 4;

app.get('/api/books', (req, res) => {
  res.status(200).json(books);
});

app.get('/api/books/search', (req, res) => {
  const { author } = req.query;
  if (!author || typeof author !== 'string' || !author.trim()) {
    return res.status(400).json({ error: 'Neobhodimo ukazat parametr author', status: 400 });
  }
  const filtered = books.filter((b) => b.author.toLowerCase().includes(author.trim().toLowerCase()));
  res.status(200).json(filtered);
});

app.get('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find((b) => b.id === id);
  if (!book) {
    return res.status(404).json({ error: 'Kniga ne naydena', status: 404 });
  }
  res.status(200).json(book);
});

app.post('/api/books', (req, res) => {
  const { title, author, year } = req.body || {};
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Pole title obyazatelno i dolzhno byt strokoy', status: 400 });
  }
  if (!author || typeof author !== 'string' || !author.trim()) {
    return res.status(400).json({ error: 'Pole author obyazatelno i dolzhno byt strokoy', status: 400 });
  }
  const parsedYear = Number(year);
  if (year === undefined || isNaN(parsedYear) || !Number.isInteger(parsedYear)) {
    return res.status(400).json({ error: 'Pole year obyazatelno i dolzhno byt celym chislom', status: 400 });
  }
  const newBook = {
    id: nextId++,
    title: title.trim(),
    author: author.trim(),
    year: parsedYear
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

app.put('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find((b) => b.id === id);
  if (!book) {
    return res.status(404).json({ error: 'Kniga ne naydena', status: 404 });
  }
  const { title, author, year } = req.body || {};
  if (title === undefined && author === undefined && year === undefined) {
    return res.status(400).json({ error: 'Net dannyh dlya obnovleniya', status: 400 });
  }
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
  res.status(200).json(book);
});

app.delete('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Kniga ne naydena', status: 404 });
  }
  const removed = books.splice(index, 1)[0];
  res.status(200).json({ message: 'Kniga uspeshno udalena', book: removed });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
  });
}

module.exports = app;
