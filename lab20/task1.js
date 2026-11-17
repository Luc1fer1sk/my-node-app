const http = require('http');

const PORT = process.env.PORT || 3000;

function formatTimestamp(d) {
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const min = pad(d.getMinutes());
  const sec = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hours}:${min}:${sec}`;
}

function handleRequest(req, res) {
  const url = req.url;
  const method = req.method;

  let statusCode = 200;
  let body = '';

  if (method === 'GET' && url === '/') {
    statusCode = 200;
    body = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Lab 20</title></head>
<body>
<h1>=== Laboratornaya rabota No 20 ===</h1>
<p>Gruppa: 477</p>
<p>Metod: ${method}</p>
<p>URL: ${url}</p>
</body>
</html>`;
    res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(body);
  } else if (method === 'GET' && url === '/about') {
    statusCode = 200;
    body = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>O studente</title></head>
<body>
<h1>=== O studente ===</h1>
<p>Gruppa: 477</p>
<p>Student: Ovchinnikov Denis Vladimirovich</p>
</body>
</html>`;
    res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(body);
  } else {
    statusCode = 404;
    body = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>404</title></head>
<body>
<h1>=== 404 Not Found ===</h1>
<p>Put ${url} ne nayden</p>
</body>
</html>`;
    res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(body);
  }

  console.log(`[${formatTimestamp(new Date())}] ${method} ${url} ${statusCode}`);
}

const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  handleRequest
};
