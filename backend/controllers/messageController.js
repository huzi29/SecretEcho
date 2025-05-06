import mongoose from "mongoose";
import Message from "../models/Message.js";

const sendMessage = async (req, res, next) => {
  try {
    const { content, receiver } = req.body;
    const sender = req.user.id;

    const receiverUser = await User.findOne({ name: receiver });
    if (!receiverUser) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const message = await Message.create({
      sender,
      receiver: receiverUser._id,
      content,
      isBot: false,
    });

    const msgObj = message.toObject();
    msgObj.sender = msgObj.sender.toString();
    msgObj.receiver = msgObj.receiver.toString();

    res.status(201).json([msgObj]);
  } catch (err) {
    next(err);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).lean();

    const formatted = messages.map((msg) => ({
      ...msg,
      sender: msg.sender?.toString(),
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

const getMessagesByID = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const objectId = new mongoose.Types.ObjectId(userId);

    // console.log("Object ID--->:", objectId);

    const messages = await Message.find({ userId: objectId }).sort({
      createdAt: 1,
    });

    res.json(messages);
  } catch (err) {
    console.error("Error messages-->:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const messageController = {
  sendMessage,
  getMessages,
  getMessagesByID,
};

export default messageController;
