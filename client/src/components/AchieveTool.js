import React, { useEffect, useState, useRef } from "react";
import { IconButton } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { Typography } from "@mui/material";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import "./AchieveTool.css";
import axios from "axios";
import { set } from "date-fns";

const AchieveTool = (props) => {
  const [messages, setMessages] = useState("");
  const [apiResponse, setApiResponse] = useState({
    suggestions: "",
    reasoning: "",
  });
  const [showResponse, setShowResponse] = useState(false);

  const [suggestionsClicked, setSuggestionsClicked] = useState(false);

  const [cancelTokenSource, setCancelTokenSource] = useState(null);

  const iconRef = useRef(null);
  const responseRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cancelTokenSource) {
        cancelTokenSource.cancel("Request canceled due to component unmount");
      }
    };
  }, []);

  useEffect(() => {
    if (props.messageSent.trim() !== "") {
      setMessages(messages + "P1: " + props.messageSent + ";");
    }
    if (cancelTokenSource) {
      cancelTokenSource.cancel("Request canceled due to component unmount");
    }
  }, [props.messageSent]);

  useEffect(() => {
    if (props.messageReceived.trim() !== "") {
      setMessages(messages + "P1: " + props.messageReceived + ";");
    }
  }, [props.messageReceived]);

  const makeApiCall = async (prompt) => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel("Request canceled due to component unmount");
    }
    try {
      const newCancelTokenSource = axios.CancelToken.source();
      setCancelTokenSource(newCancelTokenSource);
      await axios
        .post(
          "http://localhost:3001/api/generate",
          {
            model: "relExpPhi",
            prompt: prompt,
            stream: false,
          },
          { cancelToken: newCancelTokenSource.token }
        )
        .then((response) => {
          console.log("response:", response.data.response);
          const parsedResponse = response.data.response.split("=");
          console.log("parsedResponse:", parsedResponse);
          const suggestions = parsedResponse[1]?.split("Reasoning")[0]?.trim();
          console.log("suggestions:", suggestions);
          const reasoning = parsedResponse[2]?.trim();
          console.log("reasoning:", reasoning);
          setApiResponse({ suggestions, reasoning });
        })
        .catch((error) => {
          console.error("Error calling API at server:", error);
          if (axios.isCancel(error)) {
            console.log("Request canceled", error.message);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log("in comp newMessage useEff");
    if (props.connected) {
      if (props.newMessage.trim() !== "") {
        if (!suggestionsClicked) {
          makeApiCall(messages + "P1: " + props.newMessage + ";");
        }
        if (suggestionsClicked) {
          setSuggestionsClicked(false);
        }
      } else if (apiResponse.suggestions !== "") {
        setApiResponse({
          suggestions: "",
          reasoning: "",
        });
      }
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

  const handleSuggestionsClick = () => {
    props.setNewMessage(apiResponse.suggestions);
    setShowResponse(false);
    setApiResponse({
      suggestions: "",
      reasoning: "",
    });
    setSuggestionsClicked(true);
  };

  return (
    <div
      style={{
        position: "relative",
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
          // props.newMessage !== "" &&
          apiResponse.suggestions !== "" &&
          apiResponse.reasoning !== "" &&
          !suggestionsClicked
            ? "received"
            : ""
        }`}
        style={{ fontSize: "2rem" }}
        ref={iconRef}
        onClick={() => {
          setShowResponse(!showResponse);
          // makeApiCall("");
        }}
      />
      <LightbulbIcon className="suggestion" style={{ fontSize: "2rem" }} />

      {props.connected && showResponse && (
        <div
          className="responseRectangle"
          ref={responseRef}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center", // Added alignItems property
            flexDirection: "column",
          }}
        >
          {apiResponse.suggestions === "" ? (
            <p>
              {messages === "" ? "No Advice yet." : "You are conversing good!!"}
            </p>
          ) : (
            <>
              <div className="suggestionsContainer">
                <Typography variant="h6" className="sectionHeading">
                  Suggestions
                </Typography>
                <div className="suggestions" onClick={handleSuggestionsClick}>
                  {apiResponse.suggestions}
                </div>
              </div>
              <div className="reasoningContainer">
                <Typography variant="h6" className="sectionHeading">
                  Reasoning
                </Typography>
                <div className="reasoning">{apiResponse.reasoning}</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AchieveTool;
