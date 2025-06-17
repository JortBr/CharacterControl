const io = require("socket.io")(3000, {
  cors: {
    origin: "*",
  },
});

const players = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  players[socket.id] = {
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
  };

  socket.emit("init", players);
  socket.broadcast.emit("newPlayer", { id: socket.id, ...players[socket.id] });

  socket.on("update", (data) => {
    if (players[socket.id]) {
      players[socket.id].position = data.position;
      players[socket.id].rotation = data.rotation;
      socket.broadcast.emit("update", { id: socket.id, ...data });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete players[socket.id];
    io.emit("removePlayer", socket.id);
  });
});
