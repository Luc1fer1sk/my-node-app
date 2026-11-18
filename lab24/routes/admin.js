const Router = require('koa-router');
const userCtrl = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = new Router({ prefix: '/api/admin' });

router.get('/users', authMiddleware, requireRole('admin'), userCtrl.getUsers);

module.exports = router;
