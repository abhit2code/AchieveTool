import React from "react";
import { IconButton } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import "./AchieveTool.css";

const AchieveTool = () => {
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
      />
      <LightbulbIcon className="suggestion" style={{ fontSize: "2rem" }} />
    </div>
  );
};

export default AchieveTool;
