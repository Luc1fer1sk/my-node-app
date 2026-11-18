const http = require('http');
const { start } = require('./app');

function makeRequest(options) {
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
    req.end();
  });
}

async function run() {
  const { server, wss } = await start();
  await new Promise((r) => setTimeout(r, 200));

  console.log('');
  console.log(['$ curl "http:', '', 'localhost:3000/api/users?page=2&limit=5&sort=-age"'].join('/'));
  const res1 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users?page=2&limit=5&sort=-age',
    method: 'GET'
  });
  console.log(JSON.stringify(res1.data, null, 2));
  console.log('');

  console.log(['$ curl "http:', '', 'localhost:3000/api/users?group_name=BBMO-01-23&course=2"'].join('/'));
  const res2 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users?group_name=BBMO-01-23&course=2',
    method: 'GET'
  });
  console.log(JSON.stringify(res2.data, null, 2));
  console.log('');

  console.log(['$ curl "http:', '', 'localhost:3000/api/users/search?q=Ivan"'].join('/'));
  const res3 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/search?q=Ivan',
    method: 'GET'
  });
  console.log(JSON.stringify(res3.data, null, 2));
  console.log('');

  console.log(['$ curl "http:', '', 'localhost:3000/api/users/stats"'].join('/'));
  const res4 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/stats',
    method: 'GET'
  });
  console.log(JSON.stringify(res4.data, null, 2));
  console.log('');

  console.log(['$ curl "http:', '', 'localhost:3000/api/users?page=0"'].join('/'));
  const res5 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users?page=0',
    method: 'GET'
  });
  console.log(JSON.stringify(res5.data, null, 2));
  console.log('');

  console.log(['$ curl "http:', '', 'localhost:3000/api/users/export" (CSV)'].join('/'));
  const res6 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/export',
    method: 'GET'
  });
  console.log(res6.data.split('\n').slice(0, 4).join('\n'));
  console.log('...');

  try {
    wss.close();
    server.close();
  } catch (_) {}
}

if (require.main === module) {
  run();
}

module.exports = { run };
