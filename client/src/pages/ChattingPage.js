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
import { useLocation } from "react-router-dom";
import { format, set } from "date-fns";
import Message from "../components/Message";
import { useUserContext } from "../context/UserContext";
import "./ChattingPageStyle.css";

const ChattingPage = () => {
  const { user } = useUserContext();

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([
    { abhi: ["hi", "3:45 pm"] },
    { a2: ["hello", "3:55 pm"] },
  ]);

  const messageBoxRef = useRef(null);

  const sendMsgBtController = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") {
      return;
    }
    const timestamp = Date.now();
    setMessages([
      ...messages,
      { [user]: [newMessage, format(timestamp, "h:mm a")] },
    ]);
    setNewMessage("");
  };

  useEffect(() => {
    // Scroll to the bottom of the MessageBox container
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [messages]);

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
            <Typography variant="h6">{user}</Typography>
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
              owner={Object.keys(m)[0] === user}
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
