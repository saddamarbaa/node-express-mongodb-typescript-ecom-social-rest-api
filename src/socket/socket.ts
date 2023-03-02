import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server } from 'http';

const socketServer: SocketIOServer = new SocketIOServer();

type Message = {
  text: string;
  sender: string;
};

// Function to initialize the socket server
const initSocket = (httpServer: Server): void => {
  // Attach the socket server to the HTTP server
  socketServer.attach(httpServer, {
    cors: { origin: '*' },
  });

  // Listen for connection events
  socketServer.on('connection', (socket: Socket) => {
    console.log(`A client connected with ID ${socket.id}`);

    // Send a welcome message to the client
    socket.emit('welcome', 'Welcome to the server.');

    // Listen for message events from the client
    socket.on('message', (data: string) => {
      try {
        const message: Message = JSON.parse(data);
        socketServer.emit('message', message);
      } catch (error) {
        console.error(error);
      }
    });

    // Listen for disconnect events
    socket.on('disconnect', () => {
      console.log(`Client with ID ${socket.id} disconnected.`);
    });
  });
};

export { initSocket, socketServer as socketIo };
