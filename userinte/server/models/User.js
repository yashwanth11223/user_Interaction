const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true },
  name: String,
  photo: String,
});

module.exports = mongoose.model("User", userSchema);