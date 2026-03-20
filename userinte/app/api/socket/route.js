import { Server } from "socket.io";

export async function GET(req) {
  if (!global.io) {
    console.log("Starting Socket.IO...");

    global.io = new Server(3001, {
      cors: {
        origin: "*",
      },
    });

    let users = {};

    global.io.on("connection", (socket) => {
      console.log("Connected:", socket.id);

      socket.on("join", (username) => {
        users[socket.id] = username;
        global.io.emit("user-list", users);
      });

      socket.on("send-message", ({ room, message }) => {
        global.io.to(room).emit("receive-message", {
          user: users[socket.id],
          message,
        });
      });

      socket.on("join-room", (room) => {
        socket.join(room);
      });

      socket.on("typing", (room) => {
        socket.to(room).emit("typing", users[socket.id]);
      });

      socket.on("disconnect", () => {
        delete users[socket.id];
        global.io.emit("user-list", users);
      });
    });
  }

  return new Response("Socket running");
}