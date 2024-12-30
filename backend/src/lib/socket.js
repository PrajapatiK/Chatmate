import { Server } from "socket.io";
import http from "http";
import express from "express";
import { v4 as uuid } from "uuid";
import { corsOptions } from "../config/cors.config.js";
import { socketAuthenticator } from "../middleware/auth.middleware.js";
import { CHAT_JOINED, CHAT_LEAVED, CONNECTION, DISCONNECT, NEW_MESSAGE, START_TYPING, STOP_TYPING } from "../constants/events.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
});

// app.set("io", io);

const userSocketIDs = new Map();
const onlineUsers = new Set();

const getOtherMember = (members, userId) => members.find((member) => member._id.toString() !== userId.toString());

const getSockets = (users = []) => {
  const sockets = users.map((user) => userSocketIDs.get(user.toString()));
  return sockets;
};

const emitEvent = (req, event, users, data) => {
  // const io = req.app.get("io");
  const usersSocket = getSockets(users);
  io.to(usersSocket).emit(event, data);
};

export const getBase64 = (file) => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});

io.on(CONNECTION, (socket) => {
  const userId = socket.handshake.query.userId;
  console.log('USER ID: ', userId);
  console.log(socket.user);
  console.log(socket.handshake);
  
  const user = socket.user;
  userSocketIDs.set(user._id.toString(), socket.id);

  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };

    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };

    const membersSocket = getSockets(members);
    
    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });

    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      await Message.create(messageForDB);
    } catch (error) {
      throw new Error(error);
    }
  });

  socket.on(START_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(START_TYPING, { chatId });
  });

  socket.on(STOP_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(STOP_TYPING, { chatId });
  });

  socket.on(CHAT_JOINED, ({ userId, members }) => {
    onlineUsers.add(userId.toString());
    const membersSocket = getSockets(members);

    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on(CHAT_LEAVED, ({ userId, members }) => {
    onlineUsers.delete(userId.toString());
    const membersSocket = getSockets(members);

    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on(DISCONNECT, () => {
    userSocketIDs.delete(user._id.toString());
    onlineUsers.delete(user._id.toString());

    socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
  });
});

/* export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
} */

// used to store online users
// const userSocketMap = {}; // {userId: socketId}

/* io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Listen for "typing" events
  socket.on('typing', (data) => {
    const receiverSocketId = getReceiverSocketId(data.id);
    io.to(receiverSocketId).emit("typing");
  });

  // Listen for "stop typing" events
  socket.on('stopTyping', (data) => {
    const receiverSocketId = getReceiverSocketId(data.id);
    io.to(receiverSocketId).emit("stopTyping");
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
}); */

export { io, app, server, emitEvent, getOtherMember };
