import React, { useEffect, useState, useRef } from "react";
import { IconButton } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { Typography } from "@mui/material";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import "./AchieveTool.css";
import axios from "axios";
import { set } from "date-fns";
import { useGenderContext } from "../context/GenderContext";

const AchieveTool = (props) => {
  const [messages, setMessages] = useState("");
  const [apiResponse, setApiResponse] = useState({
    suggestions: "",
    reasoning: "",
  });
  const [showResponse, setShowResponse] = useState(false);

  const [suggestionsClicked, setSuggestionsClicked] = useState(false);

  // const [cancelTokenSource, setCancelTokenSource] = useState(null);

  const newMsgEmpty = useRef(true);

  const [timeoutId, setTimeoutId] = useState(null);

  const iconRef = useRef(null);
  const responseRef = useRef(null);

  const { gender } = useGenderContext();

  const malePattern = /\b(?:male|man)\b/gi;
  const femalePattern = /\b(?:female|woman)\b/gi;

  // useEffect(() => {
  //   return () => {
  //     // if (cancelTokenSource) {
  //     //   cancelTokenSource.cancel("Request canceled due to component unmount");
  //     // }
  //   };
  // }, []);

  useEffect(() => {
    if (props.messageSent.trim() !== "") {
      setMessages(messages + gender + ": " + props.messageSent + "#");
    }
    // if (cancelTokenSource) {
    //   cancelTokenSource.cancel("Request canceled due to component unmount");
    // }
    if (timeoutId) {
      clearTimeout(timeoutId);
    } else {
      setApiResponse({
        suggestions: "",
        reasoning: "",
      });
    }
  }, [props.messageSent]);

  useEffect(() => {
    if (props.messageReceived.trim() !== "") {
      const receiverG = gender === "Male" ? "Female" : "Male";
      setMessages(messages + receiverG + ": " + props.messageReceived + "#");
    }
  }, [props.messageReceived]);

  const makeApiCall = async (prompt) => {
    // if (cancelTokenSource) {
    //   cancelTokenSource.cancel("Request canceled due to component unmount");
    // }
    clearTimeout(timeoutId);
    try {
      // const newCancelTokenSource = axios.CancelToken.source();
      // setCancelTokenSource(newCancelTokenSource);
      const newTimeoutId = setTimeout(async () => {
        await axios
          .post(
            `${process.env.REACT_APP_SERVER_URL}/api/v1/apiCall/callOllama`,
            {
              prompt: prompt,
              stream: false,
              gender: gender,
            }
            // { cancelToken: newCancelTokenSource.token }
          )
          .then((response) => {
            console.log("response:", response.data.text);
            const parsedResponse = response.data.text.split("=");
            console.log("parsedResponse:", parsedResponse);
            let suggestions = parsedResponse[1]?.split("Reasoning")[0]?.trim();
            console.log("suggestions:", suggestions);
            suggestions = suggestions.replaceAll("#", "");
            let reasoning = parsedResponse[2]?.trim();
            reasoning = reasoning.replace(
              new RegExp(gender === "Male" ? malePattern : femalePattern, "gi"),
              props.userName
            );
            const receiverG = gender === "Male" ? "Female" : "Male";
            reasoning = reasoning.replace(
              receiverG === "Male" ? malePattern : femalePattern,
              props.receiverName
            );
            reasoning = reasoning.replaceAll("#", "");
            console.log("reasoning:", reasoning);
            console.log(props.userName, props.receiverName);
            if (!newMsgEmpty.current) {
              setApiResponse({ suggestions, reasoning });
            }
          })
          .catch((error) => {
            console.error("Error calling API at server:", error);
            if (axios.isCancel(error)) {
              console.log("Request canceled", error.message);
            }
          });
      }, 950);
      setTimeoutId(newTimeoutId);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log("in comp newMessage useEff");
    if (props.connected) {
      if (props.newMessage.trim() === "") {
        newMsgEmpty.current = true;
      } else if (props.newMessage.trim() !== "") {
        newMsgEmpty.current = false;
        if (!suggestionsClicked) {
          makeApiCall(messages + gender + ": " + props.newMessage + "#");
        }
        if (suggestionsClicked) {
          setSuggestionsClicked(false);
        }
      }

      if (apiResponse.suggestions !== "") {
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
        width: "45%",
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
      {/* <LightbulbIcon className="suggestion" style={{ fontSize: "2rem" }} /> */}

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
