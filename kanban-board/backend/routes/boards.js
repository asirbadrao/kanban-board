const express = require('express');
const router = express.Router();
const { createBoard, getBoards, getBoard, inviteMember } = require('../controllers/boardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createBoard);
router.get('/', getBoards);
router.get('/:id', getBoard);
router.post('/:id/invite', inviteMember);

module.exports = router;
