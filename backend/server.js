import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import Message from './models/Message.js';
import User from './models/User.js'; 

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

const AI_REPLIES = [
  "I'm just a bot, but I care!",
  "Tell me more about that...",
  "That's interesting!",
  "I'm here with you.",
  "Hmm, that's a tough one.",
  "Let's talk about it more!",
];

const getRandomReply = () => {
  return AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
};

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new Error("User not found"));

    socket.user = user;
    socket.join(user._id.toString());
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("Authentication error"));
  }
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id} (${socket.user.username})`);

  socket.on('init_user', async () => {
    const messages = await Message.find({ userId: socket.user._id }).sort({ createdAt: 1 });
    socket.emit('chat_history', messages);
  });

  socket.on('send_message', async ({ content }) => {
    const user = socket.user;

    const message = await Message.create({
      sender: user.username,
      receiver: "Secret Echo",
      content,
      isBot: false,
      userId: user._id
    });

    io.to(user._id.toString()).emit('receive_message', message);

    setTimeout(async () => {
      const botMessage = await Message.create({
        sender: "Secret Echo",
        receiver: user.username,
        content: getRandomReply(),
        isBot: true,
        userId: user._id
      });

      io.to(user._id.toString()).emit('receive_message', botMessage);
    }, 1000);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.get("/", (req, res) => {
  res.send("dbSecretEcho API is running...");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
