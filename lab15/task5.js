const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 3000;

const firstNames = [
  'Александр', 'Алексей', 'Андрей', 'Анна', 'Анастасия',
  'Артем', 'Борис', 'Виктория', 'Владимир', 'Владислав',
  'Даниил', 'Дарья', 'Денис', 'Дмитрий', 'Екатерина',
  'Елена', 'Иван', 'Илья', 'Кирилл', 'Ксения',
  'Максим', 'Мария', 'Михаил', 'Никита', 'Николай',
  'Ольга', 'Павел', 'Полина', 'Роман', 'София'
];

const lastNames = [
  'Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев',
  'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Федоров',
  'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семенов',
  'Егоров', 'Павлов', 'Козлов', 'Степанов', 'Николаев',
  'Овчинников', 'Орлов', 'Андреев', 'Макаров', 'Никитин'
];

const groups = ['477', '477-A', '477-B', '478'];

function generateInitialStudents() {
  const list = [
    { id: 1, name: 'Овчинников Денис', group: '477', course: 2 }
  ];
  for (let i = 2; i <= 50; i++) {
    const fName = firstNames[(i * 7) % firstNames.length];
    const lName = lastNames[(i * 11) % lastNames.length];
    const group = groups[i % groups.length];
    const course = (i % 4) + 1;
    list.push({
      id: i,
      name: `${lName} ${fName}`,
      group,
      course
    });
  }
  return list;
}

let students = generateInitialStudents();
let nextId = 51;

router.get('/students', (ctx) => {
  let result = [...students];
  const { search, sort, limit = '10', offset = '0' } = ctx.query;

  if (search) {
    const searchLower = String(search).toLowerCase();
    result = result.filter((s) => s.name.toLowerCase().includes(searchLower));
  }

  if (sort) {
    if (sort === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    } else if (sort === '-name') {
      result.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
    } else if (sort === 'course') {
      result.sort((a, b) => a.course - b.course);
    } else if (sort === '-course') {
      result.sort((a, b) => b.course - a.course);
    }
  }

  const total = result.length;
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);
  const data = result.slice(parsedOffset, parsedOffset + parsedLimit);

  ctx.status = 200;
  ctx.body = {
    total,
    limit: parsedLimit,
    offset: parsedOffset,
    data
  };
});

router.get('/students/:id', (ctx) => {
  const id = parseInt(ctx.params.id, 10);
  const student = students.find((s) => s.id === id);
  if (!student) {
    ctx.status = 404;
    ctx.body = { error: 'Student ne nayden', status: 404 };
    return;
  }
  ctx.status = 200;
  ctx.body = student;
});

router.post('/students', (ctx) => {
  const body = ctx.request.body;
  if (!body) {
    ctx.status = 400;
    ctx.body = { error: 'Telo zaprosa ne peredano', status: 400 };
    return;
  }
  const { name, group, course } = body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    ctx.status = 400;
    ctx.body = { error: 'Pole name obyazatelno i dolzhno byt ne pustoy strokoy', status: 400 };
    return;
  }
  if (!group || typeof group !== 'string' || !group.trim()) {
    ctx.status = 400;
    ctx.body = { error: 'Pole group obyazatelno i dolzhno byt ne pustoy strokoy', status: 400 };
    return;
  }
  const parsedCourse = Number(course);
  if (course === undefined || isNaN(parsedCourse) || !Number.isInteger(parsedCourse) || parsedCourse < 1 || parsedCourse > 4) {
    ctx.status = 400;
    ctx.body = { error: 'Pole course obyazatelno i dolzhno byt celym chislom ot 1 do 4', status: 400 };
    return;
  }
  const newStudent = {
    id: nextId++,
    name: name.trim(),
    group: group.trim(),
    course: parsedCourse
  };
  students.push(newStudent);
  ctx.status = 201;
  ctx.body = newStudent;
});

router.put('/students/:id', (ctx) => {
  const id = parseInt(ctx.params.id, 10);
  const studentIndex = students.findIndex((s) => s.id === id);
  if (studentIndex === -1) {
    ctx.status = 404;
    ctx.body = { error: 'Student ne nayden', status: 404 };
    return;
  }
  const body = ctx.request.body;
  if (!body) {
    ctx.status = 400;
    ctx.body = { error: 'Telo zaprosa ne peredano', status: 400 };
    return;
  }
  const student = students[studentIndex];
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      ctx.status = 400;
      ctx.body = { error: 'Pole name dolzhno byt ne pustoy strokoy', status: 400 };
      return;
    }
    student.name = body.name.trim();
  }
  if (body.group !== undefined) {
    if (typeof body.group !== 'string' || !body.group.trim()) {
      ctx.status = 400;
      ctx.body = { error: 'Pole group dolzhno byt ne pustoy strokoy', status: 400 };
      return;
    }
    student.group = body.group.trim();
  }
  if (body.course !== undefined) {
    const parsedCourse = Number(body.course);
    if (isNaN(parsedCourse) || !Number.isInteger(parsedCourse) || parsedCourse < 1 || parsedCourse > 4) {
      ctx.status = 400;
      ctx.body = { error: 'Pole course dolzhno byt celym chislom ot 1 do 4', status: 400 };
      return;
    }
    student.course = parsedCourse;
  }
  ctx.status = 200;
  ctx.body = student;
});

router.delete('/students/:id', (ctx) => {
  const id = parseInt(ctx.params.id, 10);
  const studentIndex = students.findIndex((s) => s.id === id);
  if (studentIndex === -1) {
    ctx.status = 404;
    ctx.body = { error: 'Student ne nayden', status: 404 };
    return;
  }
  const removed = students.splice(studentIndex, 1)[0];
  ctx.status = 200;
  ctx.body = {
    message: 'Student uspeshno udalyon',
    student: removed
  };
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

if (require.main === module) {
  console.log('Generaciya dannyh: sozdano 50 studentov dlya gruppy 477');
  app.listen(PORT, () => {
    console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
  });
}

module.exports = app;
