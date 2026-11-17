const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const HTTP_PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const PUBLIC_DIR = path.join(__dirname, 'public');
const ACCESS_LOG = path.join(__dirname, 'access.log');

const metrics = {
  group: '477',
  total: 0,
  byMethod: { GET: 0, POST: 0, PUT: 0, DELETE: 0 },
  byStatus: {},
  startTime: Date.now()
};

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

function logAccess(method, url, status) {
  const line = `[${formatTimestamp(new Date())}] [477] ${method} ${url} ${status}\n`;
  fs.appendFileSync(ACCESS_LOG, line, 'utf-8');
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const middlewares = [];

function use(fn) {
  middlewares.push(fn);
}

use((req, res, next) => {
  res.setHeader('X-Group', '477');
  metrics.total++;
  metrics.byMethod[req.method] = (metrics.byMethod[req.method] || 0) + 1;

  const originalEnd = res.end;
  res.end = function (...args) {
    const status = String(res.statusCode || 200);
    metrics.byStatus[status] = (metrics.byStatus[status] || 0) + 1;
    logAccess(req.method, req.url, res.statusCode);
    return originalEnd.apply(this, args);
  };
  next();
});

const cache = new Map();

function handleAll(req, res) {
  runMiddlewares(req, res, () => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
    const pathname = parsedUrl.pathname;

    if (pathname === '/metrics' && req.method === 'GET') {
      const data = {
        group: metrics.group,
        total: metrics.total,
        byMethod: metrics.byMethod,
        byStatus: metrics.byStatus,
        uptime: Math.floor((Date.now() - metrics.startTime) / 1000)
      };
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data, null, 2));
      return;
    }

    if (pathname === '/' && req.socket.encrypted) {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('=== HTTPS rabotaet! ===\nGruppa: 477\n');
      return;
    }

    if (pathname === '/stream' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Transfer-Encoding': 'chunked'
      });
      let chunkCount = 0;
      const interval = setInterval(() => {
        chunkCount++;
        const dummyChunk = Buffer.alloc(1024 * 64, 0xaa);
        res.write(dummyChunk);
        if (chunkCount >= 16) {
          clearInterval(interval);
          res.end();
        }
      }, 50);
      return;
    }

    if (pathname.startsWith('/static/')) {
      const subPath = pathname.slice('/static/'.length);

      if (subPath.includes('..')) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden');
        return;
      }

      const filePath = path.resolve(PUBLIC_DIR, subPath);
      if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }

      const stat = fs.statSync(filePath);
      const content = fs.readFileSync(filePath);
      const etag = `"${crypto.createHash('md5').update(content).digest('hex')}"`;

      if (req.headers['if-none-match'] === etag) {
        res.writeHead(304, {
          'ETag': etag,
          'Cache-Control': 'max-age=60'
        });
        res.end();
        return;
      }

      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stat.size,
        'ETag': etag,
        'Cache-Control': 'max-age=60'
      });
      res.end(content);
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('HTTP Advanced Server (gruppa 477)');
  });
}

function runMiddlewares(req, res, done) {
  let index = 0;
  function next(err) {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Vnutrennyaya oshibka');
      return;
    }
    if (index < middlewares.length) {
      const mw = middlewares[index++];
      try {
        mw(req, res, next);
      } catch (e) {
        next(e);
      }
    } else {
      done();
    }
  }
  next();
}

const keyPath = path.join(__dirname, 'key.pem');
const certPath = path.join(__dirname, 'cert.pem');
let httpsServer = null;

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
  httpsServer = https.createServer(httpsOptions, handleAll);
  httpsServer.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });
}

const httpServer = http.createServer(handleAll);
httpServer.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

function startServers() {
  httpServer.listen(HTTP_PORT, () => {
    console.log(`[INFO] HTTP-server zapushchen na portu ${HTTP_PORT}`);
  });

  if (httpsServer) {
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`[INFO] HTTPS-server zapushchen na portu ${HTTPS_PORT}`);
    });
  }

  console.log('[INFO] Gruppa: 477');

  process.on('SIGINT', () => {
    console.log('\n[INFO] Ostanovka servera po SIGINT...');
    httpServer.close();
    if (httpsServer) httpsServer.close();
    process.exit(0);
  });
}

if (require.main === module) {
  startServers();
}

module.exports = {
  httpServer,
  httpsServer,
  handleAll,
  startServers
};
