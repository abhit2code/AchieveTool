import React from "react";
import { IconButton } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import "./AchieveTool.css";
import axios from "axios";

const AchieveTool = () => {
  const inputText = "Hello I need help";
  const openAiApiKey = "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";
  const openAiApiUrl = "https://api.openai.com/v1/completions";

  console.log("OpenAI API Key:", openAiApiKey);

  const makeApiCall = async () => {
    console.log("Making API call to OpenAI");
    try {
      const response = await axios
        .post(
          openAiApiUrl,
          {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: inputText }],
          },
          {
            headers: {
              Authorization: `Bearer ${openAiApiKey}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          const output = response.data.choices[0].text.trim();
          console.log("OpenAI response:", output);
        })
        .catch((error) => {
          console.error("Error calling OpenAI API:", error);
        });
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
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
        className="changingSentenceNeutral"
        style={{ fontSize: "2rem" }}
        onClick={makeApiCall}
      />
      <LightbulbIcon className="suggestion" style={{ fontSize: "2rem" }} />
    </div>
  );
};

export default AchieveTool;
