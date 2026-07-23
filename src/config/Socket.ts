import { Server } from "socket.io";

let io: Server;

export const setIO = (socketIO: Server) => {
  io = socketIO;
};

export const getIO = () => io;