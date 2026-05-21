const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleCheck');
const c = require('../controllers/taskController');

router.get('/dashboard', auth, c.getDashboard);
router.get('/', auth, c.getTasks);
router.post('/', auth, role(['Admin']), c.createTask);
router.put('/:id', auth, c.updateTask);
router.delete('/:id', auth, role(['Admin']), c.deleteTask);
router.get('/project/:projectId', auth, c.getProjectTasks);

module.exports = router;