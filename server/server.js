import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

const app = express();

app.use(express.json());

app.use(cors());

let userNames = [];

let freeSocketIds = [];

let connectedSocketIds = {};
let socketIdUserNameMapping = {};

const genAI = new GoogleGenerativeAI("AIzaSyBStmvirKk0L2TsE7eu0xM2sHWYu6I0CKE");

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

const model = genAI.getGenerativeModel({ model: "gemini-pro", safetySettings });

const system_prompt =
  "You are an expert in relationships. You know various aspects of relationships(respecting your partner, flirting with them, providing support, and many others). You will be provided with the online chatting between two persons named P1 and P2. The conversation would have the format of <speaker>: <message>; <speaker>: <message>. \nYou need to act as a relationship assistant for a person named P1. \nYou need to analyze the conversation between them. Try to understand the context and what is going on in the conversation. \nBased on the analysis of the conversation, you need to generate output, which will consist of the following two things: \n1 Suggestions= Under this section, you need to only generate modified sentence for the last message of P1 in the context of ongoing conversation. \nWhile generating sentences for the last message of P1, use your relationship expert knowledge to see whether the last message of P1 should be said or not in the ongoing context of the conversation: \n- If the message could be said, then generate that same sentence in a more engaging or flirty way \n- If the message should not be spoken, generate an alternate sentence according to the relationship expert. \n2 Reasoning= Under this section, you, as an expert, should explain why the messages in the suggestion sections have been generated. \nPoints to strictly remember while generating the output: \n1. The output should only include two sections(based on above guidelines) in the following format: \nSuggestions=\n<Generate sentences based on the guidelines mentioned above>\nReasoning=\n<reasons for the sentences generated in the suggestions section>\nDont generate anything extra apart from suggestions and reasoning. Also inside each of the section, only the things mentioned above should be present.\n2. strictly IN THE Suggestions SECTION ONLY MODIFIED SENTENCE SHOULD BE PRESENT. DONT ADD ANY extra exclamatory mark(!) and Speaker(P1 or P2) at the end of suggestion. Following is the conversation:\n";

// Safety config

const io = new Server(8900, {
  cors: {
    origin: "http://localhost:3000",
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

app.post("/api/v1/apiCall/callOllama", async (req, res) => {
  try {
    const result = await model.generateContent(system_prompt + req.body.prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    res.status(200).send({ text: text });
  } catch (error) {
    console.log(error);
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
