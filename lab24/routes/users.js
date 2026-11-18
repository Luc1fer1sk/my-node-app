const Router = require('koa-router');
const userCtrl = require('../controllers/userController');
const { validateBody, validateQuery, userCreateSchema, userQuerySchema } = require('../middleware/validationMiddleware');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = new Router({ prefix: '/api/users' });

router.get('/stats', userCtrl.getStats);
router.get('/export', userCtrl.exportCSV);
router.get('/search', userCtrl.searchUsers);

router.get('/', validateQuery(userQuerySchema), userCtrl.getUsers);
router.get('/:id', userCtrl.getUserById);
router.post('/', validateBody(userCreateSchema), userCtrl.createUser);
router.put('/:id', authMiddleware, userCtrl.updateUser);
router.delete('/:id', authMiddleware, userCtrl.deleteUser);

module.exports = router;
