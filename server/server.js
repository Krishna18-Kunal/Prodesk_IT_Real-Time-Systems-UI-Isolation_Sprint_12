require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

const ROOMS = new Set(["General", "Tech Support"]);
const MAX_USERNAME_LENGTH = 24;
const MAX_MESSAGE_LENGTH = 1000;

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "ConnectX Socket.io server" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy", connectedClients: io.engine.clientsCount });
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join-room", ({ username, room } = {}) => {
    const safeUsername = cleanText(username, MAX_USERNAME_LENGTH);
    const safeRoom = cleanText(room, 40);

    if (!safeUsername || !ROOMS.has(safeRoom)) {
      socket.emit("chat-error", "Please provide a valid username and room.");
      return;
    }

    const previousRoom = socket.data.room;
    const previousUsername = socket.data.username;

    if (previousRoom) {
      socket.to(previousRoom).emit("user-stop-typing", {
        socketId: socket.id,
        username: previousUsername
      });
      socket.leave(previousRoom);
      socket.to(previousRoom).emit("system-message", {
        text: `${previousUsername} left the room.`,
        timestamp: new Date().toISOString()
      });
    }

    socket.data.username = safeUsername;
    socket.data.room = safeRoom;
    socket.join(safeRoom);

    socket.emit("room-joined", {
      room: safeRoom,
      username: safeUsername,
      socketId: socket.id
    });

    socket.to(safeRoom).emit("system-message", {
      text: `${safeUsername} joined the room.`,
      timestamp: new Date().toISOString()
    });

    console.log(`${safeUsername} joined ${safeRoom}`);
  });

  socket.on("chat-message", (payload = {}) => {
    const room = socket.data.room;
    const username = socket.data.username;
    const text = cleanText(payload.text, MAX_MESSAGE_LENGTH);

    if (!room || !username) {
      socket.emit("chat-error", "Join a room before sending messages.");
      return;
    }

    if (!text) return;

    const message = {
      id: `${socket.id}-${Date.now()}`,
      username,
      text,
      room,
      timestamp: new Date().toISOString(),
      type: "user"
    };

    // Room-scoped broadcast: only members of this room receive the message.
    io.to(room).emit("new-message", message);
  });

  socket.on("typing", () => {
    const { room, username } = socket.data;
    if (!room || !username) return;

    socket.to(room).emit("user-typing", {
      socketId: socket.id,
      username
    });
  });

  socket.on("stop-typing", () => {
    const { room, username } = socket.data;
    if (!room || !username) return;

    socket.to(room).emit("user-stop-typing", {
      socketId: socket.id,
      username
    });
  });

  socket.on("disconnect", () => {
    const { room, username } = socket.data;

    if (room && username) {
      socket.to(room).emit("user-stop-typing", {
        socketId: socket.id,
        username
      });
      socket.to(room).emit("system-message", {
        text: `${username} disconnected.`,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Client disconnected: ${socket.id}`);
  });
});

// server.listen(PORT, () => {
//   console.log(`ConnectX server running on port ${PORT}`);
// });
   server.listen(PORT, "0.0.0.0", () => {
      console.log(`ConnectX server running on port ${PORT}`);
});
