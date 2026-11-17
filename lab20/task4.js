const http = require('http');
const { URL } = require('url');

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

let students = [
  { id: 1, name: 'Иван', group: '477' },
  { id: 2, name: 'Мария', group: '477' }
];
let nextId = 3;

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve(null);
      }
    });
  });
}

function pathToRegex(pattern) {
  const paramNames = [];
  const regexPath = pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return '([^/]+)';
  });
  return {
    regex: new RegExp(`^${regexPath}$`),
    paramNames
  };
}

const routes = [
  {
    method: 'GET',
    pattern: '/api/students',
    handler: async (req, res, params, query) => {
      let result = [...students];
      if (query.get('group')) {
        const g = query.get('group').toLowerCase();
        result = result.filter((s) => s.group.toLowerCase() === g);
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result, null, 2));
    }
  },
  {
    method: 'GET',
    pattern: '/api/students/:id',
    handler: async (req, res, params) => {
      const id = parseInt(params.id, 10);
      const student = students.find((s) => s.id === id);
      if (!student) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Student ne nayden' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(student, null, 2));
    }
  },
  {
    method: 'POST',
    pattern: '/api/students',
    handler: async (req, res) => {
      const body = await parseJsonBody(req);
      if (!body || !body.name) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Obyazatelno pole name' }));
        return;
      }
      const newStudent = {
        id: nextId++,
        name: body.name,
        group: body.group || '477'
      };
      students.push(newStudent);
      res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(newStudent, null, 2));
    }
  },
  {
    method: 'PUT',
    pattern: '/api/students/:id',
    handler: async (req, res, params) => {
      const id = parseInt(params.id, 10);
      const student = students.find((s) => s.id === id);
      if (!student) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Student ne nayden' }));
        return;
      }
      const body = await parseJsonBody(req);
      if (body.name) student.name = body.name;
      if (body.group) student.group = body.group;
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(student, null, 2));
    }
  },
  {
    method: 'DELETE',
    pattern: '/api/students/:id',
    handler: async (req, res, params) => {
      const id = parseInt(params.id, 10);
      const index = students.findIndex((s) => s.id === id);
      if (index === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Student ne nayden' }));
        return;
      }
      students.splice(index, 1);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ deleted: true, id }, null, 2));
    }
  }
];

const compiledRoutes = routes.map((r) => ({
  ...r,
  ...pathToRegex(r.pattern)
}));

function handleRouter(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  let matchedRoute = null;
  let pathParams = {};
  let pathMatchedOtherMethod = false;

  for (const r of compiledRoutes) {
    const match = pathname.match(r.regex);
    if (match) {
      if (r.method === method) {
        matchedRoute = r;
        r.paramNames.forEach((name, i) => {
          pathParams[name] = match[i + 1];
        });
        break;
      } else {
        pathMatchedOtherMethod = true;
      }
    }
  }

  let statusCode = 200;
  if (matchedRoute) {
    matchedRoute.handler(req, res, pathParams, parsedUrl.searchParams).catch(() => {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Vnutrennyaya oshibka');
    });
    statusCode = 200;
  } else if (pathMatchedOtherMethod) {
    statusCode = 405;
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('405 Method Not Allowed');
  } else {
    statusCode = 404;
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }

  console.log(`[${formatTimestamp(new Date())}] [477] ${method} ${req.url} ${statusCode}`);
}

const server = http.createServer(handleRouter);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  handleRouter
};
