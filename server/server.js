import express from "express";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

app.use(express.json());
// app.use(cookieParser());

app.use(cors());

let userNames = [];
let userSocketIds = {};

// const io = new Server(8800, {
//   cors: {
//     origin: "https://localhost:3000",
//   },
// });

app.get("/api", (req, res) => {
  res.send("Hello World!");
});

// app.get("/api/v1/users/checkUser", (req, res) => {
//   console.log("Checking user");
//   console.log(req.body);
//   const username = req.body.username;
//   const userExists = userNames.includes(username);
//   res.send(userExists);
// });

app.post("/api/v1/users/createUser", (req, res) => {
  console.log("Creating user");
  console.log(req.body);
  const username = req.body.username;
  userNames.push(username);
  res.send("User created");
});

// io.on("connection", (socket) => {
//   console.log("a user connected");
// });

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
