const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
const listRoutes = require('./routes/lists');
const taskRoutes = require('./routes/tasks');
const { setupSocket } = require('./config/socket');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/boards', boardRoutes);
app.use('/lists', listRoutes);
app.use('/tasks', taskRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Kanban Board API is running 🚀' });
});

// Setup Socket.IO
setupSocket(io);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kanban_db')
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
