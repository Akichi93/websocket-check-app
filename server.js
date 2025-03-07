const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Activer CORS pour les requêtes HTTP
app.use(cors({
  origin: "https://courtage.fl4ir.com", // Adresse de votre frontend Vue.js
  methods: ["GET", "POST"],
  credentials: true,
}));

// Configurer CORS pour Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://courtage.fl4ir.com", // Adresse de votre frontend Vue.js
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let connectedUsers = {}; // Stocker les utilisateurs connectés

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Gérer les connexions Socket.IO
io.on("connection", (socket) => {
  console.log("Un utilisateur est connecté:", socket.id);

  // Ajouter l'utilisateur à la liste des connectés
  connectedUsers[socket.id] = { connected: true };

  // Informer tous les clients de l'état des connexions
  io.emit("user-status-update", connectedUsers);

  // Gérer la déconnexion
  socket.on("disconnect", () => {
    console.log("Un utilisateur est déconnecté:", socket.id);

    // Retirer l'utilisateur de la liste des connectés
    delete connectedUsers[socket.id];
    io.emit("user-status-update", connectedUsers);
  });
});

server.listen(3000, () => {
  console.log("Le serveur est en écoute sur le port 3000");
});
