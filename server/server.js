import express from "express";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

app.use(express.json());

// app.use(cors());
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "*"
    // "http://localhost:3000"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,  Authorization");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Expose-Headers", "set-cookie");
  next();
});


let userNames = [];
// let userSocketIds = [];
let freeSocketIds = [];
// let busySocketIds = [];
let connectedSocketIds = {};
let socketIdUserNameMapping = {};

// const io = new Server(8800, {
//   cors: {
//     // origin: "http://localhost:3000",
//     origin: "http://192.168.3.30:3000/",
//   },
// });

const io = new Server(8800, {
  cors: {
    origin: "*",
  },
});

app.get("/api", (req, res) => {
  res.send("Jay Saraf is bhadva!");
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
  let receiverSocketId;
  let receiverNameS;
  let response;
  console.log("Sender Socket ID:", senderSocketId);
  if (connectedSocketIds[senderSocketId]) {
    console.log("inside 1st if of getOtherPersonSocketId");
    receiverSocketId = connectedSocketIds[senderSocketId];
    // delete connectedSocketIds[senderSocketId];
    receiverNameS = socketIdUserNameMapping[receiverSocketId];
    response = {
      receiverSocketId,
      receiverNameS,
    };
  } else {
    console.log("inside 2nd if of getOtherPersonSocketId");
    console.log("Free Socket len:", freeSocketIds.length);
    if (freeSocketIds.length < 2) {
      console.log("o1sender:", senderSocketId);
      response = {
        receiverSocketId: null,
        receiverNameS: null,
      };
    } else {
      console.log("o2 sender:", senderSocketId);
      do {
        receiverSocketId =
          freeSocketIds[Math.floor(Math.random() * freeSocketIds.length)];
      } while (receiverSocketId === senderSocketId);

      receiverNameS = socketIdUserNameMapping[receiverSocketId];
      response = {
        receiverSocketId,
        receiverNameS,
      };

      const freeIndex1 = freeSocketIds.indexOf(senderSocketId);
      if (freeIndex1 !== -1) {
        freeSocketIds.splice(freeIndex1, 1);
      }

      const freeIndex2 = freeSocketIds.indexOf(receiverSocketId);
      if (freeIndex2 !== -1) {
        freeSocketIds.splice(freeIndex2, 1);
      }

      connectedSocketIds[receiverSocketId] = senderSocketId;
      connectedSocketIds[senderSocketId] = receiverSocketId;
    }
  }
  res.send(response);
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("addUser", (username) => {
    if (socketIdUserNameMapping[socket.id]) {
      console.log("User already added:", username);
    } else {
      console.log("Adding user:", username);
      freeSocketIds.push(socket.id);
      console.log("user being added id", socket.id);
      console.log("Free Socket IDs:", freeSocketIds);
      freeSocketIds.forEach((id) => {
        if (id !== socket.id) {
          io.to(id).emit("tryAgainToPair", username);
        }
      });
      socketIdUserNameMapping[socket.id] = username;
    }
  });

  socket.on("freeUser", () => {
    console.log("Freeing user:", socket.id);
    const freeIndex = freeSocketIds.indexOf(socket.id);
    console.log("Free Index:", freeIndex);
    if (freeIndex === -1) {
      freeSocketIds.push(socket.id);
      freeSocketIds.forEach((id) => {
        if (id !== socket.id) {
          io.to(id).emit("tryAgainToPair", socketIdUserNameMapping[socket.id]);
        }
      });
    }
    console.log("Free Socket IDs:", freeSocketIds);
  });

  socket.on("connectedToUserMessage", ({ receiverSocketId }) => {
    console.log(
      "Connected to user message",
      receiverSocketId,
      socketIdUserNameMapping[receiverSocketId]
    );
    io.to(receiverSocketId).emit("settingConnectedUserMessage", {
      message: `Connected to ${socketIdUserNameMapping[socket.id]}`,
    });
  });

  socket.on("sendChatMessage", ({ receiverSocketId, message }) => {
    io.to(receiverSocketId).emit("recieveChatMessage", {
      message,
    });
  });

  socket.on("performCleaning", () => {
    if (connectedSocketIds[socket.id]) {
      console.log("Cleaning up");
      io.to(connectedSocketIds[socket.id]).emit(
        "settingDisconnectedUserMessage"
      );
      delete connectedSocketIds[connectedSocketIds[socket.id]];
      delete connectedSocketIds[socket.id];
    }
    // freeSocketIds.push(socket.id);
  });

  socket.on("disconnect", () => {
    console.log(
      "A client disconnected having name:",
      socketIdUserNameMapping[socket.id]
    );

    if (connectedSocketIds[socket.id]) {
      const receiverSocketId = connectedSocketIds[socket.id];
      delete connectedSocketIds[socket.id];
      delete connectedSocketIds[receiverSocketId];
      io.to(receiverSocketId).emit("settingDisconnectedUserMessage");
    } else {
      const freeIndex = freeSocketIds.indexOf(socket.id);

      if (freeIndex !== -1) {
        freeSocketIds.splice(freeIndex, 1);
      }
      console.log("freeIds:", freeSocketIds);
    }

    delete socketIdUserNameMapping[socket.id];
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
