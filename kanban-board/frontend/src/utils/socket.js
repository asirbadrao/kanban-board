import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (socket) return socket;

  socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
