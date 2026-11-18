const Router = require('koa-router');
const studentCtrl = require('../controllers/studentController');
const metricsCtrl = require('../controllers/metricsController');

const router = new Router();

router.get('/api/students/stats', studentCtrl.stats);
router.get('/api/students/search', studentCtrl.search);
router.post('/api/students/batch', studentCtrl.batch);
router.get('/api/students', studentCtrl.getAll);
router.get('/api/students/:id', studentCtrl.getById);
router.post('/api/students', studentCtrl.create);
router.put('/api/students/:id', studentCtrl.update);
router.delete('/api/students/:id', studentCtrl.remove);

router.get('/api/metrics', metricsCtrl.metrics);

module.exports = router;
