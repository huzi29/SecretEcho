import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    //   sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    content: { type: String, required: true },
    isBot: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
