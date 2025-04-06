import { useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export const useSocket = (onNewHotel) => {
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socket.on('newHotel', (hotel) => {
      console.log('New hotel received via WebSocket:', hotel);
      onNewHotel(hotel);
    });

    return () => {
      socket.disconnect();
      console.log('WebSocket disconnected');
    };
  }, [onNewHotel]);
};
