import React, { useEffect, useState, useRef } from "react";
import { IconButton } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import "./AchieveTool.css";
import axios from "axios";

const AchieveTool = (props) => {
  const [messages, setMessages] = useState("");
  const [apiResponse, setApiResponse] = useState("");
  const [showResponse, setShowResponse] = useState(false);

  const iconRef = useRef(null);
  const responseRef = useRef(null);

  useEffect(() => {
    if (props.messageSent.trim() !== "") {
      setMessages(messages + "P1: " + props.messageSent + ";");
    }
  }, [props.messageSent]);

  useEffect(() => {
    if (props.messageReceived.trim() !== "") {
      setMessages(messages + "P1: " + props.messageReceived + ";");
    }
  }, [props.messageReceived]);

  const makeApiCall = async (prompt) => {
    console.log("Making API call to Replicate");
    setApiResponse(
      "This is a resp dffd fd fd fdfddfdfdfd f df d fd fd fd f d fd "
    );
    // try {
    //   await axios
    //     .post("http://localhost:11434/api/generate", {
    //       model: "relExpPhi",
    //       prompt: prompt,
    //       stream: false,
    //     })
    //     .then((response) => {
    //       console.log("response:", response.data.response);
    //       setApiResponse(response.data.response);
    //       setShowResponse(true);
    //     })
    //     .catch((error) => {
    //       console.error("Error calling API at server:", error);
    //     });
    // } catch (error) {
    //   console.log(error);
    // }
  };

  useEffect(() => {
    if (props.newMessage.trim() !== "") {
      makeApiCall(messages + "P1: " + props.newMessage + ";");
    }
  }, [props.newMessage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        iconRef.current &&
        !iconRef.current.contains(event.target) &&
        responseRef.current &&
        !responseRef.current.contains(event.target)
      ) {
        setShowResponse(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative", // Make the container relative to position the response rectangle
        border: "1px solid green",
        borderRadius: "1px",
        height: "100%",
        width: "50%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
      }}
    >
      <NotificationImportantIcon
        className={`changingSentenceNeutral ${
          apiResponse !== "" ? "received" : ""
        }`}
        style={{ fontSize: "2rem" }}
        ref={iconRef}
        onClick={() => {
          setShowResponse(!showResponse);
          makeApiCall("");
        }} // Make API call on click
      />
      <LightbulbIcon className="suggestion" style={{ fontSize: "2rem" }} />

      {/* Display response rectangle if showResponse is true */}
      {showResponse && (
        <div className="responseRectangle" ref={responseRef}>
          <p>{apiResponse}</p>
        </div>
      )}
    </div>
  );
};

export default AchieveTool;
