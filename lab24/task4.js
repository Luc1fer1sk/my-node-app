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
  console.log(['$ curl -X POST http:', '', 'localhost:3000/api/auth/register'].join('/'));
  const res1 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Ivan Auth',
    email: 'ivan_auth@example.com',
    password: 'secret123'
  });
  console.log(JSON.stringify(res1.data, null, 2));
  console.log('');

  console.log(['$ curl -X POST http:', '', 'localhost:3000/api/auth/login'].join('/'));
  const res2 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'ivan_auth@example.com',
    password: 'secret123'
  });
  console.log(JSON.stringify(res2.data, null, 2));
  console.log('');

  const token = res2.data.accessToken;

  console.log(['$ curl -X POST http:', '', 'localhost:3000/api/users (with Bearer token)'].join('/'));
  const res3 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    name: 'Petr Auth',
    email: 'petr_auth@example.com',
    group_name: 'BBMO-01-23',
    age: 20
  });
  console.log(JSON.stringify(res3.data, null, 2));
  console.log('');

  console.log(['$ curl -X PUT http:', '', 'localhost:3000/api/users/65a50f12a3b4c5d6e7f80001 (without token -> 401)'].join('/'));
  const res4 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/65a50f12a3b4c5d6e7f80001',
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    age: 21
  });
  console.log(JSON.stringify(res4.data, null, 2));
  console.log('');

  console.log(['$ curl http:', '', 'localhost:3000/api/admin/users (with user token -> 403)'].join('/'));
  const res5 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/users',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(JSON.stringify(res5.data, null, 2));
  console.log('');

  console.log(['$ curl -X POST http:', '', 'localhost:3000/api/auth/login (wrong password -> 401)'].join('/'));
  const res6 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'ivan_auth@example.com',
    password: 'wrong'
  });
  console.log(JSON.stringify(res6.data, null, 2));

  try {
    wss.close();
    server.close();
  } catch (_) {}
}

if (require.main === module) {
  run();
}

module.exports = { run };
