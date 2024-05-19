import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Input,
  TextField,
} from "@mui/material";
import { format, set } from "date-fns";
import Message from "../components/Message";
import { useUserContext } from "../context/UserContext";
import "./ChattingPageStyle.css";
import axios from "axios";
import socket from "../ChatSocket";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SendIcon from "@mui/icons-material/Send";
import AchieveTool from "../components/AchieveTool";

const ChattingPage = () => {
  const usert = useUserContext();

  const userName = usert.user;
  console.log("Username:", userName);
  console.log("Socket ID:", socket.id);

  const receiverName = useRef("");

  const [searchingStatus, setSearchingStatus] = useState(true);

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [receiver, setReceiver] = useState({});

  const [messageSent, setMessageSent] = useState("");

  const [messageReceived, setMessageReceived] = useState("");

  const messageBoxRef = useRef(null);

  const [textFieldHeight, setTextFieldHeight] = useState("auto"); // State to hold the height of the TextField
  const textFieldRef = useRef(null); // Ref to the TextField component

  const updateTextFieldHeight = () => {
    if (textFieldRef.current) {
      const newHeight = textFieldRef.current.scrollHeight + 15 + "px";
      setTextFieldHeight(newHeight);
    }
  };

  useEffect(() => {
    updateTextFieldHeight();
  }, [newMessage]);

  // useEffect(() => {
  //   // Calculate the height of the TextField based on its content when the component mounts or when the content changes
  //   const updateTextFieldHeight = () => {
  //     if (textFieldRef.current) {
  //       const newHeight = textFieldRef.current.scrollHeight + 15 + "px";
  //       setTextFieldHeight(newHeight);
  //     }
  //   };

  //   updateTextFieldHeight(); // Call updateTextFieldHeight initially

  //   textFieldRef.current.addEventListener("onChange", updateTextFieldHeight);

  //   return () => {
  //     textFieldRef.current.removeEventListener(
  //       "onChange",
  //       updateTextFieldHeight
  //     );
  //   };
  // }, []);

  const sendMsgBtController = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || Object.keys(receiver).length === 0) {
      return;
    }
    const timestamp = Date.now();
    setMessages([
      ...messages,
      { [userName]: [newMessage, format(timestamp, "h:mm a"), "chatting"] },
    ]);
    setMessageSent(newMessage);
    socket.emit("sendChatMessage", {
      receiverSocketId: receiver[Object.keys(receiver)[0]],
      message: newMessage,
    });
    setNewMessage("");
  };

  const connectToUser = async () => {
    console.log("In connectToUser", receiver);
    try {
      await axios
        .get(
          `${process.env.REACT_APP_SERVER_URL}/api/v1/users/getOtherPersonSocketId?socketId=${socket.id}`
        )
        .then((res) => {
          console.log("res.data outside if: ", res.data);
          if (res.data.receiverNameS) {
            const { receiverSocketId, receiverNameS } = res.data;
            console.log("res data: ", res.data);
            console.log("setting receiver: ", receiverSocketId, receiverNameS);
            setSearchingStatus(false);
            receiverName.current = receiverNameS;
            console.log("receiverName.current: ", receiverName.current);
            setReceiver({ [receiverNameS]: receiverSocketId });
            console.log("receiver: ", receiver);
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
      socket.emit("performCleaning");
      socket.emit("freeUser");
      setMessages([]);
      setNewMessage("");
      setReceiver({});
      setSearchingStatus(true);
      connectToUser();
      receiverName.current = "";
    } catch (error) {
      console.log("Error reconnecting to other person: ", error);
    }
  };

  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (Object.keys(receiver).length !== 0) {
      console.log("receiver:", receiver);
      console.log(
        "sending the message to receiver: ",
        receiver[Object.keys(receiver)[0]]
      );
      socket.emit("connectedToUserMessage", {
        receiverSocketId: receiver[Object.keys(receiver)[0]],
      });
    }
  }, [Object.keys(receiver)[0]]);

  useEffect(() => {
    socket.emit("addUser", userName);
  }, []);

  useEffect(() => {
    socket.on("settingConnectedUserMessage", (data) => {
      setMessages([
        ...messages,
        {
          noOne: [data.message, "", "info"],
        },
      ]);
      setSearchingStatus(false);
    });

    socket.on("settingDisconnectedUserMessage", (data) => {
      setMessages([
        ...messages,
        {
          noOne: [`Disconnected to ${Object.keys(receiver)[0]}`, "", "info"],
        },
      ]);
      setReceiver({});
    });

    socket.on("tryAgainToPair", (data) => {
      console.log("Trying again to pair with:", data);
      connectToUser();
    });

    socket.on("recieveChatMessage", (data) => {
      setMessages([
        ...messages,
        {
          [Object.keys(receiver)[0]]: [
            data.message,
            format(Date.now(), "h:mm a"),
            "chatting",
          ],
        },
      ]);
      setMessageReceived(data.message);
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
      className="ChattingPageContainer"
      style={{
        backgroundColor: "lightgray",
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        display: "flex",
      }}
    >
      <div
        className="ChattingContainer"
        style={{
          backgroundColor: "white",
          height: "85vh",
          width: "50%",
          border: "2px",
          borderColor: "black",
          borderStyle: "solid",
        }}
      >
        <AppBar
          position="static"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Toolbar>
            <Typography variant="h6">{receiverName.current}</Typography>
          </Toolbar>
          <IconButton
            onClick={reconnectToUser}
            color="inherit"
            sx={{ marginRight: "6px" }}
          >
            <RestartAltIcon />
          </IconButton>
        </AppBar>
        <div
          style={{ display: "flex", flexDirection: "column", height: "90.5%" }}
        >
          <div
            ref={messageBoxRef} // Attach ref to the MessageBox div
            className="MessageBox"
            style={{
              // height: "79%",
              flex: 1,
              backgroundColor: " #ddddf7",
              overflowY: "auto",
            }}
          >
            {searchingStatus ? (
              <div
                style={{
                  marginTop: "2%",
                  backgroundColor: "yellow",
                  height: "5%",
                  alignContent: "center",
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                <p style={{ marginTop: "0", fontSize: "120%" }}>
                  Please wait, Searching someone to pair!!
                </p>
              </div>
            ) : null}
            {messages.map((m, index) => (
              <Message
                key={index}
                owner={Object.keys(m)[0] === userName}
                message={m}
              />
            ))}
          </div>
          <div
            className="MessageInputContainer"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              // height: "11.5%",
              // height: messageInputHeight,
              height: textFieldHeight,
            }}
          >
            <TextField
              ref={textFieldRef}
              onKeyDown={(event) =>
                event.key === "Enter" ? sendMsgBtController(event) : null
              }
              id="outlined-basic"
              placeholder="Type a message"
              multiline
              minRows={1}
              maxRows={3}
              variant="outlined"
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
              style={{
                width: "79%",
                marginLeft: "3%",
                backgroundColor: "white",
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                height: "65%",
                width: "17%",
              }}
            >
              <AchieveTool
                newMessage={newMessage}
                messageReceived={messageReceived}
                messageSent={messageSent}
                setNewMessage={setNewMessage}
                connected={Object.keys(receiver).length !== 0 ? true : false}
                receiverName={receiverName.current}
                userName={userName}
              />
              <SendIcon
                className="sendButton"
                color="inherit"
                variant="contained"
                onClick={sendMsgBtController}
                style={{
                  flex: "1",
                  // minWidth: "37%",
                  // width: "40%",
                  height: "65%",
                  // transition: "transform 0.3s",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChattingPage;
