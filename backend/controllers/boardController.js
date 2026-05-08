const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');
const User = require('../models/User');

// POST /boards
const createBoard = async (req, res) => {
  try {
    const { title, description, background } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Board title is required' });
    }

    const board = await Board.create({
      title,
      description,
      background,
      owner: req.user._id,
    });

    await board.populate('owner', 'name email avatar');
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /boards - get all boards for current user
const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      'members.user': req.user._id,
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort('-createdAt');

    res.json(boards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /boards/:id
const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user is a member
    const isMember = board.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get lists with tasks
    const lists = await List.find({ board: board._id }).sort('position');
    const tasks = await Task.find({ board: board._id })
      .populate('assignee', 'name email avatar')
      .sort('position');

    // Group tasks by list
    const listsWithTasks = lists.map((list) => ({
      ...list.toObject(),
      tasks: tasks.filter((t) => t.list.toString() === list._id.toString()),
    }));

    res.json({ board, lists: listsWithTasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /boards/:id/invite
const inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the board owner can invite members' });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    const alreadyMember = board.members.some(
      (m) => m.user.toString() === userToInvite._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    board.members.push({ user: userToInvite._id, role: 'member' });
    await board.save();
    await board.populate('members.user', 'name email avatar');

    req.io.to(`board:${board._id}`).emit('board-member-added', {
      boardId: board._id,
      member: board.members[board.members.length - 1],
    });

    res.json({ message: 'Member invited successfully', board });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBoard, getBoards, getBoard, inviteMember };
