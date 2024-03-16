import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Button,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { light } from "@mui/material/styles/createPalette";

const ChattingPage = () => {
  const location = useLocation();

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
          //   marginLeft: "25%",
        }}
      >
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">{location.state.username}</Typography>
          </Toolbar>
        </AppBar>
        <div
          className="MessageBox"
          style={{ backgroundColor: "lightcyan", height: "79%" }}
        ></div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "10%",
          }}
        >
          <TextField
            id="outlined-basic"
            label="Type a message"
            variant="outlined"
            style={{ width: "80%" }}
          />
          <Button variant="contained" style={{ marginLeft: "1%" }}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChattingPage;
