import { io } from 'socket.io-client';

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(window.location.origin, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to server hub');
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected from server hub');
    });
  }
  return socketInstance;
};
