const jwt = require('jsonwebtoken');

const setupSocket = (io) => {
  // Auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userName = decoded.name;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId}`);

    // Join a board room
    socket.on('join-board', (boardId) => {
      socket.join(`board:${boardId}`);
      console.log(`👤 ${socket.userName} joined board ${boardId}`);
    });

    // Leave a board room
    socket.on('leave-board', (boardId) => {
      socket.leave(`board:${boardId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userId}`);
    });
  });
};

module.exports = { setupSocket };
