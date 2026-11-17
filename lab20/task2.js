const http = require('http');

const PORT = process.env.PORT || 3000;

function handleHeaders(req, res) {
  const url = req.url;
  const method = req.method;

  if (method === 'GET' && url === '/headers') {
    const data = {
      headers: req.headers,
      method: req.method,
      url: req.url,
      httpVersion: req.httpVersion
    };
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data, null, 2));
    return;
  }

  if (method === 'GET' && url === '/headers/set') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Powered-By', 'Node.js');
    res.setHeader('X-Group', '477');
    res.setHeader('Cache-Control', 'no-cache');
    res.statusCode = 200;
    res.end('<h1>Kastomnye zagolovki uspeshno ustanovleny</h1>');
    return;
  }

  if (method === 'GET' && url === '/headers/check') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Group', '477');
    res.setHeader('X-Temp', 'test');
    res.removeHeader('X-Temp');

    const result = {
      hasContentType: res.hasHeader('Content-Type'),
      hasXGroup: res.hasHeader('X-Group'),
      hasUnknown: res.hasHeader('Unknown')
    };

    res.statusCode = 200;
    res.end(JSON.stringify(result, null, 2));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Marshrut ne nayden');
}

const server = http.createServer(handleHeaders);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  handleHeaders
};
