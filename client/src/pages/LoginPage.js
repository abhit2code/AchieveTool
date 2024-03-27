import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import socket from "../ChatSocket";
import { set } from "date-fns";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const { login, user } = useUserContext();

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await axios
        .post("http://localhost:5000/api/v1/users/createUser", {
          username: username,
        })
        .then((res) => {
          console.log(res.data);
          socket.emit("addUser", username);
          // login([username, socket]);
          login(username);
          navigate("/chat");
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  //   const checkIfUserExists = (username) => {
  //     try {
  //       axios
  //         .get(
  //           `http://localhost:5000/api/v1/users/checkUser?userName=${username}`
  //         )
  //         .then((res) => {
  //           return res.data;
  //         })
  //         .catch((err) => {
  //           console.error(err);
  //         });
  //     } catch (error) {
  //       console.error("Error getting response:", error);
  //     }
  //   };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="lightgray"
    >
      <Box p={3} boxShadow={3} borderRadius={8} bgcolor="white">
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          // error={Boolean(error)}
          // helperText={error}
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
        >
          Login
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;
