const Task = require('../models/Task');
const List = require('../models/List');
const Board = require('../models/Board');

// POST /tasks
const createTask = async (req, res) => {
  try {
    const { title, description, listId, boardId, priority, dueDate, labels } = req.body;

    if (!title || !listId || !boardId) {
      return res.status(400).json({ message: 'Title, listId and boardId are required' });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const isMember = board.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const taskCount = await Task.countDocuments({ list: listId });
    const task = await Task.create({
      title,
      description,
      list: listId,
      board: boardId,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      labels: labels || [],
      position: taskCount,
    });

    await task.populate('assignee', 'name email avatar');

    req.io.to(`board:${boardId}`).emit('task-created', task);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /tasks/:id
const updateTask = async (req, res) => {
  try {
    const { title, description, listId, priority, dueDate, assigneeId, position, labels } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const board = await Board.findById(task.board);
    const isMember = board.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (listId !== undefined) task.list = listId;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assigneeId !== undefined) task.assignee = assigneeId || null;
    if (position !== undefined) task.position = position;
    if (labels !== undefined) task.labels = labels;

    await task.save();
    await task.populate('assignee', 'name email avatar');

    req.io.to(`board:${task.board}`).emit('task-updated', task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const board = await Board.findById(task.board);
    const isMember = board.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const boardId = task.board;
    const taskId = task._id;
    await task.deleteOne();

    req.io.to(`board:${boardId}`).emit('task-deleted', { taskId, boardId });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /tasks/reorder - bulk reorder tasks after drag
const reorderTasks = async (req, res) => {
  try {
    const { tasks, boardId } = req.body;
    // tasks = [{ _id, list, position }]

    const bulkOps = tasks.map((t) => ({
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { list: t.list, position: t.position } },
      },
    }));

    await Task.bulkWrite(bulkOps);

    req.io.to(`board:${boardId}`).emit('tasks-reordered', { tasks, boardId });
    res.json({ message: 'Tasks reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createTask, updateTask, deleteTask, reorderTasks };
