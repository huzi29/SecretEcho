import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender:    { type: String, ref: 'User' },
  content:   { type: String, required: true },
  isBot:     { type: Boolean, default: false },
},
{timestamps: true}
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
