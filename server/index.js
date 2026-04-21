require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");
const { createServer } = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options(/(.*)/, cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Socket.io
const noteRooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-note", ({ noteId, userId, userName, userColor }) => {
    socket.join(noteId);
    if (!noteRooms[noteId]) noteRooms[noteId] = {};
    noteRooms[noteId][socket.id] = { userId, userName, userColor };
    io.to(noteId).emit("room-users", Object.values(noteRooms[noteId]));
    console.log(`${userName} joined note ${noteId}`);
  });

  socket.on("yjs-update", ({ noteId, update }) => {
    socket.to(noteId).emit("yjs-update", { update });
  });

  socket.on("disconnect", () => {
    for (const noteId in noteRooms) {
      if (noteRooms[noteId][socket.id]) {
        delete noteRooms[noteId][socket.id];
        io.to(noteId).emit("room-users", Object.values(noteRooms[noteId]));
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});