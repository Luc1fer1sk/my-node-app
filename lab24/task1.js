const http = require('http');
const { start } = require('./app');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (_) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
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
  const { server, wss } = await start();
  await new Promise((r) => setTimeout(r, 200));

  console.log('');
  console.log(['$ curl http:', '', 'localhost:3000/api/users'].join('/'));
  const res1 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users',
    method: 'GET'
  });
  console.log(JSON.stringify(res1.data, null, 2));
  console.log('');

  console.log(['$ curl -X POST http:', '', 'localhost:3000/api/users'].join('/'));
  const res2 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Petr',
    email: 'petr@example.com',
    group_name: 'BBMO-01-23',
    age: 20
  });
  console.log(JSON.stringify(res2.data, null, 2));
  console.log('');

  console.log(['$ curl -X POST http:', '', 'localhost:3000/api/users (validation error)'].join('/'));
  const res3 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'P',
    email: 'invalid'
  });
  console.log(JSON.stringify(res3.data, null, 2));
  console.log('');

  console.log(['$ curl http:', '', 'localhost:3000/api/users/999 (404)'].join('/'));
  const res4 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/999',
    method: 'GET'
  });
  console.log(JSON.stringify(res4.data, null, 2));
  console.log('');

  console.log('Zagolovok X-Group: ' + res1.headers['x-group']);

  try {
    wss.close();
    server.close();
  } catch (_) {}
}

if (require.main === module) {
  run();
}

module.exports = { run };
