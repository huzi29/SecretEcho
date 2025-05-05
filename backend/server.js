import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import Message from './models/Message.js'; 

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin:'*',
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
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

io.on('connection', async (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('init_user', async (userId) => {
    const messages = await Message.find({ sender: userId }).sort({ timestamp: 1 });
    socket.emit('chat_history', messages);
  });

  socket.on('send_message', async ({ sender, content }) => {
    const message = new Message({ sender, content });
    await message.save();
    io.emit('receive_message', message);

    setTimeout(async () => {
      const botMessage = new Message({
        sender: "Secret Echo", 
        content: getRandomReply(),
        isBot: true,
      });
      await botMessage.save();
      io.emit('receive_message', botMessage);
    }, 1500);
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
