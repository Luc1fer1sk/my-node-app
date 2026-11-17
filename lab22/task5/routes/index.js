const Router = require('koa-router');
const students = require('../controllers/students');
const groups = require('../controllers/groups');
const metricsCtrl = require('../controllers/metrics');

const router = new Router({ prefix: '/api' });

router.get('/students/stats', students.stats);
router.post('/students/batch', students.batch);
router.get('/students', students.list);
router.get('/students/:id', students.getOne);
router.post('/students', students.create);
router.put('/students/:id', students.update);
router.delete('/students/:id', students.remove);

router.get('/groups', groups.list);
router.post('/groups', groups.create);
router.get('/groups/:id/students', groups.getStudents);

router.get('/metrics', metricsCtrl.get);
router.get('/cache/stats', metricsCtrl.cacheStats);

module.exports = router;
