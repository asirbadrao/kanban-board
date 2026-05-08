const express = require('express');
const router = express.Router();
const { createTask, updateTask, deleteTask, reorderTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createTask);
router.patch('/reorder', reorderTasks);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
