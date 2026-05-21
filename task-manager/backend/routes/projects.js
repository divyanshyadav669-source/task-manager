const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleCheck');
const c = require('../controllers/projectController');

router.get('/users', auth, role(['Admin']), c.getUsers);
router.get('/', auth, c.getProjects);
router.post('/', auth, role(['Admin']), c.createProject);
router.put('/:id', auth, role(['Admin']), c.updateProject);
router.delete('/:id', auth, role(['Admin']), c.deleteProject);

module.exports = router;