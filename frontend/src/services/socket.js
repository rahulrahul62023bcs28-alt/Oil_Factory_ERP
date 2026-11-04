import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://smartoil-erp-backend.onrender.com';
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.io Connected] Client ID:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 [Socket.io Disconnected] Reason:', reason);
    });

    socket.on('connect_error', (error) => {
      // Quiet fail if backend is not yet started
      console.debug('Socket connection retry...', error.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;
