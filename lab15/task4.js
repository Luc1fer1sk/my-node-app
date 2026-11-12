const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 3000;

let students = [
  { id: 1, name: 'Овчинников Денис', group: '477', course: 2 },
  { id: 2, name: 'Иванов Иван', group: '477', course: 2 },
  { id: 3, name: 'Петров Петр', group: '478', course: 3 },
  { id: 4, name: 'Сидорова Анна', group: '477', course: 1 }
];
let nextId = 5;

router.get('/students', (ctx) => {
  const { group } = ctx.query;
  if (group !== undefined) {
    const filtered = students.filter((s) => s.group.toLowerCase() === group.toLowerCase());
    ctx.status = 200;
    ctx.body = filtered;
    return;
  }
  ctx.status = 200;
  ctx.body = students;
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
    ctx.body = { error: 'Pole name obyazatelno i dolzhno byt strokoy', status: 400 };
    return;
  }
  if (!group || typeof group !== 'string' || !group.trim()) {
    ctx.status = 400;
    ctx.body = { error: 'Pole group obyazatelno i dolzhno byt strokoy', status: 400 };
    return;
  }
  const parsedCourse = Number(course);
  if (course === undefined || isNaN(parsedCourse) || !Number.isInteger(parsedCourse) || parsedCourse < 1 || parsedCourse > 6) {
    ctx.status = 400;
    ctx.body = { error: 'Pole course obyazatelno i dolzhno byt celym chislom ot 1 do 6', status: 400 };
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
    ctx.body = { error: 'Telo zaprosa dlya obnovleniya ne peredano', status: 400 };
    return;
  }
  const student = students[studentIndex];
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      ctx.status = 400;
      ctx.body = { error: 'Pole name dolzhno byt nestustoy strokoy', status: 400 };
      return;
    }
    student.name = body.name.trim();
  }
  if (body.group !== undefined) {
    if (typeof body.group !== 'string' || !body.group.trim()) {
      ctx.status = 400;
      ctx.body = { error: 'Pole group dolzhno byt nestustoy strokoy', status: 400 };
      return;
    }
    student.group = body.group.trim();
  }
  if (body.course !== undefined) {
    const parsedCourse = Number(body.course);
    if (isNaN(parsedCourse) || !Number.isInteger(parsedCourse) || parsedCourse < 1 || parsedCourse > 6) {
      ctx.status = 400;
      ctx.body = { error: 'Pole course dolzhno byt celym chislom ot 1 do 6', status: 400 };
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
  app.listen(PORT, () => {
    console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
  });
}

module.exports = app;
