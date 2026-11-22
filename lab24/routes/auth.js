const Router = require('koa-router');
const authCtrl = require('../controllers/authController');

const router = new Router({ prefix: '/api/auth' });

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/refresh', authCtrl.refresh);
router.post('/logout', authCtrl.logout);

module.exports = router;
