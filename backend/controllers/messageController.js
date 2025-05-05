import Message from '../models/Message.js';

export const sendMessage = async (req, res, next) => {
    try {
      const { content } = req.body;
  
      const message = await Message.create({
        sender: req.user.id,
        content,
        isBot: false,
      });
  
      const msgObj = message.toObject();
      msgObj.sender = msgObj.sender.toString(); 
  
      res.status(201).json([msgObj]);
    } catch (err) {
      next(err);
    }
  };
  

  export const getMessages = async (req, res, next) => {
    try {
      const messages = await Message.find().sort({ timestamp: 1 }).lean();
  
      const formatted = messages.map(msg => ({
        ...msg,
        sender: msg.sender?.toString(),
      }));
  
      res.json(formatted);
    } catch (err) {
      next(err);
    }
  };
  