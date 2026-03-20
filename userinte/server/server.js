const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ DB
mongoose.connect("mongodb://127.0.0.1:27017/chatapp");

// ✅ MODELS
const User = require("./models/User");

const Message = mongoose.model(
  "Message",
  new mongoose.Schema(
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
  )
);


// ================= USERS API =================

// 🔥 REGISTER USER
app.post("/register", async (req, res) => {
  const { phone, name } = req.body;

  let user = await User.findOne({ phone });

  if (!user) {
    user = await User.create({
      phone,
      name,
      photo: "https://i.pravatar.cc/150?u=" + phone,
    });
  }

  res.json(user);
});

// 🔥 GET ALL USERS
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});


// ================= MESSAGE API =================

// 🔥 LOAD MESSAGES
app.get("/messages/:u1/:u2", async (req, res) => {
  const { u1, u2 } = req.params;

  const conversationId = [u1, u2].sort().join("_");

  const msgs = await Message.find({ conversationId }).sort({
    createdAt: 1,
  });

  res.json(msgs);
});


// ================= SOCKET =================

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let users = {};

io.on("connection", (socket) => {

  socket.on("join", ({ phone }) => {
    users[phone] = socket.id;
  });

  socket.on("send-message", async (data) => {
    const conversationId = [data.from, data.to].sort().join("_");

    const saved = await Message.create({
      ...data,
      conversationId,
    });

    // send to receiver
    if (users[data.to]) {
      io.to(users[data.to]).emit("receive-message", saved);
    }

    // send to sender
    socket.emit("receive-message", saved);
  });

  // 📞 CALL EVENTS
  socket.on("callUser", ({ userToCall, from, signal, type }) => {
    if (users[userToCall]) {
      io.to(users[userToCall]).emit("incomingCall", {
        from,
        signal,
        type,
      });
    }
  });

  socket.on("answerCall", ({ to, signal }) => {
    if (users[to]) {
      io.to(users[to]).emit("callAccepted", signal);
    }
  });

  socket.on("endCall", ({ to }) => {
    if (users[to]) {
      io.to(users[to]).emit("callEnded");
    }
  });
});

server.listen(4000, () => console.log("🚀 Server running on 4000"));