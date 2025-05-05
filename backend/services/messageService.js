import Message from '../models/Message.js';

export const saveMessage = async ({ senderId, receiverId, content }) => {
  const message = new Message({ senderId, receiverId, content });
  return await message.save();
};
