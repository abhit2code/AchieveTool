import express from "express";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

app.use(express.json());
// app.use(cookieParser());

app.use(cors());

let userNames = [];
// let userSocketIds = [];
let freeSocketIds = [];
// let busySocketIds = [];
let connectedSocketIds = {};
let socketIdUserNameMapping = {};

const io = new Server(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.get("/api", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/v1/users/createUser", (req, res) => {
  console.log("Creating user");
  console.log(req.body);
  const username = req.body.username;
  userNames.push(username);
  res.send("User created");
});

app.get("/api/v1/users/getOtherPersonSocketId", (req, res) => {
  console.log("Getting socket ID");
  const senderSocketId = req.query.socketId;
  let recieverSocketId;
  let recieverName;
  let response;
  console.log("Sender Socket ID:", senderSocketId);
  // console.log("busySocketIds:", busySocketIds);
  // if (busySocketIds.includes(senderSocketId)) {
  if (connectedSocketIds[senderSocketId]) {
    recieverSocketId = connectedSocketIds[senderSocketId];
    // delete connectedSocketIds[senderSocketId];
    recieverName = socketIdUserNameMapping[recieverSocketId];
    response = {
      recieverSocketId,
      recieverName,
    };
    // busySocketIds.push(recieverSocketId);
    // busySocketIds.push(senderSocketId);
  } else {
    console.log("Free Socket len:", freeSocketIds.length);
    if (freeSocketIds.length < 2) {
      console.log("o1sender:", senderSocketId);
      // response = "No other user available";
      response = {
        recieverSocketId: null,
        recieverName: null,
      };
    } else {
      console.log("o2 sender:", senderSocketId);
      do {
        recieverSocketId =
          freeSocketIds[Math.floor(Math.random() * freeSocketIds.length)];
      } while (recieverSocketId === senderSocketId);

      recieverName = socketIdUserNameMapping[recieverSocketId];
      response = {
        recieverSocketId,
        recieverName,
      };
      // busySocketIds.push(recieverSocketId);
      // busySocketIds.push(senderSocketId);

      const freeIndex1 = freeSocketIds.indexOf(senderSocketId);
      if (freeIndex1 !== -1) {
        freeSocketIds.splice(freeIndex1, 1);
      }

      const freeIndex2 = freeSocketIds.indexOf(recieverSocketId);
      if (freeIndex2 !== -1) {
        freeSocketIds.splice(freeIndex2, 1);
      }

      connectedSocketIds[recieverSocketId] = senderSocketId;
      connectedSocketIds[senderSocketId] = recieverSocketId;
    }
  }
  res.send(response);
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("addUser", (username) => {
    console.log("Adding user:", username);
    // userSocketIds.push(socket.id);
    freeSocketIds.push(socket.id);
    console.log("user being added id", socket.id);
    console.log("Free Socket IDs:", freeSocketIds);
    freeSocketIds.forEach((id) => {
      if (id !== socket.id) {
        io.to(id).emit("tryAgainToPair", username);
      }
    });
    socketIdUserNameMapping[socket.id] = username;
    // console.log("User Socket IDs:", userSocketIds);
  });

  socket.on("connectedToUserMessage", ({ recieverSocketId }) => {
    console.log(
      "Connected to user message",
      recieverSocketId,
      socketIdUserNameMapping[recieverSocketId]
    );
    io.to(recieverSocketId).emit("settingConnectedUserMessage", {
      message: `connected to ${socketIdUserNameMapping[socket.id]}`,
    });
  });

  socket.on("sendChatMessage", ({ recieverSocketId, message }) => {
    io.to(recieverSocketId).emit("recieveChatMessage", {
      message,
    });
  });

  socket.on("disconnect", () => {
    console.log(
      "A client disconnected having name:",
      socketIdUserNameMapping[socket.id]
    );

    if (connectedSocketIds[socket.id]) {
      const recieverSocketId = connectedSocketIds[socket.id];
      delete connectedSocketIds[socket.id];
      delete connectedSocketIds[recieverSocketId];
      io.to(recieverSocketId).emit("settingDisconnectedUserMessage");
    } else {
      const freeIndex = freeSocketIds.indexOf(socket.id);

      if (freeIndex !== -1) {
        freeSocketIds.splice(freeIndex, 1);
      }
      console.log("freeIds:", freeSocketIds);
    }

    // const busyIndex = busySocketIds.indexOf(socket.id);
    // if (busyIndex !== -1) {
    //   busySocketIds.splice(busyIndex, 1);
    //   io.to(socket.id).emit("settingDisconnectedUserMessage");
    // }
    // console.log("busyIds:", busySocketIds);

    delete socketIdUserNameMapping[socket.id];
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
