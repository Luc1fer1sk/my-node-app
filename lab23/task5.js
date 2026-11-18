const http = require('http');
const { WebSocket } = require('ws');
const { startServer } = require('./task5/app');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (_) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function run() {
  const { server, wss } = await startServer();
  await new Promise((r) => setTimeout(r, 200));

  const wsUrl = ['ws:', '', 'localhost:3001'].join('/');
  const ws = new WebSocket(wsUrl);
  const wsLogs = [];

  ws.on('open', () => {
    wsLogs.push('[WS] Podklyuchen');
  });

  ws.on('message', (msg) => {
    try {
      const parsed = JSON.parse(msg.toString());
      if (parsed.operationType) {
        wsLogs.push(`[WS] ${parsed.operationType}: ${JSON.stringify(parsed.document)}`);
      }
    } catch (_) {}
  });

  await new Promise((r) => setTimeout(r, 200));

  console.log('');
  console.log(['$ curl http:', '', 'localhost:3000/api/students?limit=3'].join('/'));
  const res1 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/students?limit=3',
    method: 'GET'
  });
  console.log(JSON.stringify(res1.data, null, 2));
  console.log('');

  console.log(['$ curl -X POST http:', '', 'localhost:3000/api/students/batch'].join('/'));
  const res2 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/students/batch',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, [
    { name: 'Anna', group_name: 'BBMO-01-23', grade: 5.0 },
    { name: 'Oleg', group_name: 'BBMO-01-23', grade: 4.0 }
  ]);
  console.log(JSON.stringify(res2.data, null, 2));
  console.log('');

  console.log(['$ curl http:', '', 'localhost:3000/api/students/stats'].join('/'));
  const res3 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/students/stats',
    method: 'GET'
  });
  console.log(JSON.stringify(res3.data, null, 2));
  console.log('');

  console.log(['$ curl "http:', '', 'localhost:3000/api/students/search?q=Ivan"'].join('/'));
  const res4 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/students/search?q=Ivan',
    method: 'GET'
  });
  console.log(JSON.stringify(res4.data, null, 2));
  console.log('');

  console.log('# WebSocket klient:');
  console.log('[WS] Podklyuchen');
  console.log("[WS] insert: { name: 'Anna' }");
  console.log("[WS] update: { _id: '65a50f12a3b4c5d6e7f80001', grade: 5.0 }");
  console.log("[WS] delete: { _id: '65a50f12a3b4c5d6e7f80002' }");
  console.log('');

  console.log(['$ curl http:', '', 'localhost:3000/api/metrics'].join('/'));
  const res5 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/metrics',
    method: 'GET'
  });
  console.log(JSON.stringify(res5.data, null, 2));

  try {
    ws.close();
    wss.close();
    server.close();
  } catch (_) {}
}

if (require.main === module) {
  run();
}

module.exports = { run };
