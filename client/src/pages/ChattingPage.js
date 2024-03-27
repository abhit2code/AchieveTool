import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Button,
  Input,
} from "@mui/material";
import { format, set } from "date-fns";
import Message from "../components/Message";
import { useUserContext } from "../context/UserContext";
import "./ChattingPageStyle.css";
import axios from "axios";
import socket from "../ChatSocket";
// import { io } from "socket.io-client";

const ChattingPage = () => {
  // const socket = io("http://localhost:8900");

  const usert = useUserContext();

  const userName = usert.user;
  // socket.emit("addUser", userName);
  console.log("Username:", userName);
  console.log("Socket ID:", socket.id);

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [reciever, setReciever] = useState({});

  const messageBoxRef = useRef(null);

  const sendMsgBtController = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") {
      return;
    }
    const timestamp = Date.now();
    setMessages([
      ...messages,
      { [userName]: [newMessage, format(timestamp, "h:mm a"), "chatting"] },
    ]);
    socket.emit("sendChatMessage", {
      recieverSocketId: reciever[Object.keys(reciever)[0]],
      message: newMessage,
    });
    setNewMessage("");
  };

  const connectToUser = async () => {
    console.log("In connectToUser", reciever);
    try {
      await axios
        .get(
          `http://localhost:5000/api/v1/users/getOtherPersonSocketId?socketId=${socket.id}`
        )
        .then((res) => {
          if (res.data.recieverName) {
            const { recieverSocketId, recieverName } = res.data;
            console.log("res data: ", res.data);
            console.log("setting reciever: ", recieverSocketId, recieverName);
            setReciever({ [recieverName]: recieverSocketId });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log("Error finding the other user's socket ID: ", error);
    }
  };

  useEffect(() => {
    console.log("In useEffect for calling connectToUser");
    connectToUser();
  }, []);

  const reconnectToUser = async () => {
    try {
    } catch (error) {
      console.log("Error reconnecting to other person: ", error);
    }
  };

  useEffect(() => {
    // Scroll to the bottom of the MessageBox container
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (Object.keys(reciever).length !== 0) {
      console.log("reciever:", reciever);
      console.log(
        "sending the message to reciever: ",
        reciever[Object.keys(reciever)[0]]
      );
      socket.emit("connectedToUserMessage", {
        recieverSocketId: reciever[Object.keys(reciever)[0]],
      });
    }
  }, [Object.keys(reciever)[0]]);

  useEffect(() => {
    socket.on("settingConnectedUserMessage", (data) => {
      setMessages([
        ...messages,
        {
          noOne: [data.message, "", "info"],
        },
      ]);
    });

    socket.on("settingDisconnectedUserMessage", (data) => {
      setMessages([
        ...messages,
        {
          noOne: [`Disconnected to ${Object.keys(reciever)[0]}`, "", "info"],
        },
      ]);
    });

    socket.on("tryAgainToPair", (data) => {
      console.log("Trying again to pair with:", data);
      connectToUser();
    });

    socket.on("recieveChatMessage", (data) => {
      setMessages([
        ...messages,
        {
          [Object.keys(reciever)[0]]: [
            data.message,
            format(Date.now(), "h:mm a"),
            "chatting",
          ],
        },
      ]);
    });
    return () => {
      socket.off("settingConnectedUserMessage");
      socket.off("settingDisconnectedUserMessage");
      socket.off("tryAgainToPair");
      socket.off("recieveChatMessage");
    };
  });

  return (
    <div
      style={{
        backgroundColor: "lightgray",
        height: "100vh",
        justifyContent: "center",
        display: "flex",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          height: "85%",
          width: "50%",
          border: "2px",
          borderColor: "black",
          borderStyle: "solid",
        }}
      >
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">{""}</Typography>
          </Toolbar>
        </AppBar>
        <div
          ref={messageBoxRef} // Attach ref to the MessageBox div
          className="MessageBox"
          style={{
            height: "79%",
            backgroundColor: " #ddddf7",
            overflowY: "auto",
          }}
        >
          {messages.map((m, index) => (
            <Message
              key={index}
              owner={Object.keys(m)[0] === userName}
              message={m}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "11.5%",
            backgroundColor: "lightyellow",
          }}
        >
          <Input
            onKeyDown={(event) =>
              event.key === "Enter" ? sendMsgBtController(event) : null
            }
            id="outlined-basic"
            placeholder="Type a message"
            label="Type a message"
            variant="outlined"
            onChange={(e) => setNewMessage(e.target.value)}
            value={newMessage}
            style={{ width: "80%" }}
          />
          <Button
            variant="contained"
            onClick={sendMsgBtController}
            style={{ marginLeft: "3%", width: "10%", height: "60%" }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChattingPage;
