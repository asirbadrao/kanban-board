const List = require('../models/List');
const Task = require('../models/Task');
const Board = require('../models/Board');

// POST /lists
const createList = async (req, res) => {
  try {
    const { title, boardId } = req.body;

    if (!title || !boardId) {
      return res.status(400).json({ message: 'Title and boardId are required' });
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

    // Get position for new list
    const listCount = await List.countDocuments({ board: boardId });
    const list = await List.create({
      title,
      board: boardId,
      position: listCount,
    });

    req.io.to(`board:${boardId}`).emit('list-created', list);
    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /lists/:id
const updateList = async (req, res) => {
  try {
    const { title, position } = req.body;
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.board);
    const isMember = board.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (title !== undefined) list.title = title;
    if (position !== undefined) list.position = position;
    await list.save();

    req.io.to(`board:${list.board}`).emit('list-updated', list);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /lists/:id
const deleteList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.board);
    const isMember = board.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete all tasks in this list
    await Task.deleteMany({ list: list._id });
    await list.deleteOne();

    req.io.to(`board:${list.board}`).emit('list-deleted', { listId: list._id, boardId: list.board });
    res.json({ message: 'List deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createList, updateList, deleteList };
