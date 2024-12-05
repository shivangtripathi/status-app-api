import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

let io: SocketIOServer;

export const initializeSocket = (app: Server) => {
  io = new SocketIOServer(app, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  console.log("Socket.io initialized");

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}; 