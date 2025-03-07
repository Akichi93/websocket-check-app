const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Activer CORS pour les requêtes HTTP
const allowedOrigins = ["https://courtage.fl4ir.com", "http://localhost:5173"];
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Origine non autorisée par CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
}));

// Configurer CORS pour Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"], // Forcer l'utilisation de WebSocket
});

let connectedUsers = {}; // Stocker les utilisateurs connectés

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Gérer les connexions Socket.IO
io.on("connection", (socket) => {
  console.log("Un utilisateur est connecté:", socket.id);

  // Gérer les erreurs de connexion
  socket.on("connect_error", (err) => {
    console.error("Erreur de connexion Socket.IO:", err.message);
  });

  // Ajouter l'utilisateur à la liste des connectés
  connectedUsers[socket.id] = { connected: true };
  io.emit("user-status-update", connectedUsers);

  // Gérer la déconnexion
  socket.on("disconnect", () => {
    console.log("Un utilisateur est déconnecté:", socket.id);
    delete connectedUsers[socket.id];
    io.emit("user-status-update", connectedUsers);
  });
});

server.listen(3000, () => {
  console.log("Le serveur est en écoute sur le port 3000");
});
