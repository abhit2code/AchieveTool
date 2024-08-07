import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "dotenv";
import http from "http";
import https from "https"; // Import the http module
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const app = express();

dotenv.config();

app.use(express.json());
// app.use(cors());

// app.use(
//   cors({
//     origin: "https://chatting-8lew.onrender.com", // Replace with your client domain
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type"],
//     credentials: true,
//   })
// );

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://chatting-8lew.onrender.com"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,  Authorization");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

let userNames = [];
let freeSocketIds = [];
let connectedSocketIds = {};
let socketIdUserNameMapping = {};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const model = genAI.getGenerativeModel({ model: "gemini-pro", safetySettings });

const system_prompt = "You are a relationship expert, who knows various aspects of manintaining strong relationships (like respecting other person, flirting, engaging meaningfully, playful teasing, address and resepectfully resolve the conflict, and many more). \nChatting between Male and Female will be provided to you. The Purpose of persons chatting is to develop a relationship with other. The chatting provided to you will be of following format-> \n<speaker>: Message \n<speaker>: Message ...and so on. \nSpeaker will hold value of Male or Female. \nYou need to analyze the ongoing online chatting between two persons and generate the advice for the last message of the chatting. The advice(YOUR OUTPUT) will consist of two sections: \nSection 1-> \nAlternate Sentence: An alternate sentence for the last message in the conversation based on following rules-\nsee whether the last message should be spoken in the ongoing context based on purpose of developing a relationship? \nIf the message could be spoken then generate the sentence in more flirtatious way. \nIf the message should not be spoken, then generate an alternate sentence(that abide by rules of developing relatioship) conveying the original intention. \nSection 2-> \nReasoning:\nIn this section give the reasoning for the sentence you will be generating in \'Alternate sentence\' section. \nNote: \nRemember in Section 1(\'Alternate Sentence\')-> \n1. The alternate sentences you will be generating should be strictly in context to online chatting between two persons. \n2. Also, The message should be very strictly in accordance to the previous messages between two persons. Strictly, dont be too flirtatious that the original intent of the last message gets lost. \n3. Remember you have to generate the alternate sentence for the last message in the ongoing chatting. \nIn section 2(\'Reasoning\')-> The reasoning should be strictly less then 50 words.\nthe output by you should be strictly in the following format:\nAlternate Sentence= <alternate sentence for last message based on rules mentioned in above \'Alternate Sentence\' section> \nReasoning= <reasoning> \nI will provide you 3 examples which can show how you can utilise context in order to generate response more accurately. \nUse these examples for referencing output styles or understanding context correctly. Do not use information presented in these examples as the question needs to be answered solemnly from the context provided for it not from these examples. \n\
Example 1-> \n\
This is example prompt , try to learn the pattern on how to evaluate context for answering questions and how the AI answer provided by you should be ( learn the output style and how to utilise context for answering questions in resposne ).\n\
Male: Hello\n\
Female: Hi\n\
Male: whats up?\n\
Female: Nothing much, wbu?\n\
Male: good.\n\
Last Messsage-> Male: good\n\
YOUR OUTPUT->\n\
Alternate Sentence= doing good, maybe better after talking to you!\n\
Reasoning= Having good as a reply to Female is not too engaging. You could make feel other person important by telling talk with them is beneficial to you. This sentence sets the tone for the further chatting making it more engaging.\n\
Example 2->\n\
This is example prompt , try to learn the pattern on how to evaluate context for answering questions and how the AI answer provided by you should be ( learn the output style and how to utilise context for answering questions in resposne ). \n\
Male: Hello, whats up?\n\
Female: Good, how about you?\n\
Male: I am good.\n\
Male: how was your day?\n\
Female: All good.\n\
Male: what are your today plans?\n\
Female: Just as regular day.\n\
Male: Anything special in your regular day?\n\
Female: umm not\n\
Last Messsage-> Female: umm not\n\
YOUR OUTPUT->\n\
Alternate Sentence= actually busy these days, so not able to do something exciting, what about your life?\n\
Reasoning= You should not just answer yes or no to the Male questions. It just makes your chatting as a form of interview, also it reflects that you are not much interested in the conversation. So providing reasoning for why something is not there along with showing interest in other life would make the chatting better.\n\
Example 3->\n\
This is example prompt , try to learn the pattern on how to evaluate context for answering questions and how the AI answer provided by you should be ( learn the output style and how to utilise context for answering questions in resposne ). \n\
Female: Hello\n\
Male: yeah\n\
Female: what were you doing?\n\
Male: Just scrolling through Instagram\n\
Female: ok\n\
Male: what about you?\n\
Last Message-> Male: what about you?\n\
YOUR OUTPUT->\n\
Alternate Sentence= Yeah actually I was thinking I would receive message from someone while scrolling.\n\
Reasoning= Sending this message would make the conversation more playful and make the other person feel more important. Also it conveys that you are interested in talking. \n"


const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
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
    receiverNameS = socketIdUserNameMapping[receiverSocketId];
    response = {
      receiverSocketId,
      receiverNameS,
    };
  } else {
    console.log("inside 2nd if of getOtherPersonSocketId");
    console.log("Free Socket len:", freeSocketIds.length);
    if (freeSocketIds.length < 2) {
      response = {
        receiverSocketId: null,
        receiverNameS: null,
      };
    } else {
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
    io.to(receiverSocketId).emit("settingConnectedUserMessage", {
      message: `Connected to ${socketIdUserNameMapping[socket.id]}`,
    });
  });

  socket.on("sendChatMessage", ({ receiverSocketId, message }) => {
    io.to(receiverSocketId).emit("recieveChatMessage", { message });
  });

  socket.on("performCleaning", () => {
    if (connectedSocketIds[socket.id]) {
      io.to(connectedSocketIds[socket.id]).emit(
        "settingDisconnectedUserMessage"
      );
      delete connectedSocketIds[connectedSocketIds[socket.id]];
      delete connectedSocketIds[socket.id];
    }
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
    let modified_prompt = system_prompt.replace(/<gender>/g, req.body.gender);
    const result = await model.generateContent(
      modified_prompt + req.body.prompt
    );
    const response = await result.response;
    const text = response.text();
    console.log(text);
    res.status(200).send({ text: text });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
});

// -------------------------------------deployment-------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const __dirname1 = path.resolve(__dirname, "..");

console.log(process.env.NODE_ENV);
console.log(__dirname1);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/client/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running....");
  });
}

// -------------------------------------deployment-------------------------------------

httpServer.listen(5000, () => {
  console.log("Server is running on port 5000");
});
