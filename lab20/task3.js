const http = require('http');
const querystring = require('querystring');

const PORT = process.env.PORT || 3000;
const MAX_SIZE = 1024 * 1024;

function handleBody(req, res) {
  const { method, url } = req;
  const contentType = req.headers['content-type'] || '';

  if (method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Metod ne podderzhivaetsya');
    return;
  }

  const chunks = [];
  let totalLength = 0;
  let isTooLarge = false;

  req.on('data', (chunk) => {
    totalLength += chunk.length;
    if (totalLength > MAX_SIZE) {
      isTooLarge = true;
      res.writeHead(413, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('413 Payload Too Large');
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });

  req.on('end', () => {
    if (isTooLarge) return;

    const buffer = Buffer.concat(chunks);
    console.log(`[${method} ${url}] Razmer tela zaprosa: ${buffer.length} bayt (Content-Type: ${contentType})`);

    if (url === '/echo') {
      if (contentType.includes('application/json')) {
        try {
          const parsed = JSON.parse(buffer.toString('utf-8'));
          parsed.group = '477';
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(parsed, null, 2));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Nekorrektnyi JSON' }));
        }
        return;
      }

      if (contentType.includes('text/plain')) {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(buffer.toString('utf-8'));
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType || 'application/octet-stream' });
      res.end(buffer);
      return;
    }

    if (url === '/form') {
      const parsedForm = querystring.parse(buffer.toString('utf-8'));
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(parsedForm, null, 2));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Marshrut ne nayden');
  });

  req.on('error', (err) => {
    console.error(`Oshibka zaprosa: ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Vnutrennyaya oshibka');
    }
  });
}

const server = http.createServer(handleBody);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  handleBody
};
