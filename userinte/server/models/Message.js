const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: String,
    from: String,
    to: String,
    type: String,
    message: String,
    audio: String,
    file: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);