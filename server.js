const express = require("express");
const app = express();
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
const port = process.env.PORT || 3000;
const socketPort = process.env.SOCKET_PORT || 4000;

const server = app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);

const io = require("socket.io")();

app.get("/", function (req, res) {
  res.send("Hello World!dssdf");
});

app.use(cors());

app.get("/createRoom", function (req, res) {
  const newRoom = uuidv4();
  res.json({
    roomId: newRoom
  });
  console.log("new room created", newRoom);
});

io.on("connection", (socket) => {
  console.log("new socket connected");
  socket.on("join-room", (roomId, userId, name) => {
    console.log("new peer joined", userId);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId, name);

    socket.on("disconnect", () => {
      console.log("disconnected", userId);
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: "/peer"
});

app.use("/peerjs", peerServer);

app.use((req, res, next) => {
  res.status(404).type("text").send("Not Found");
});

io.listen(socketPort);
