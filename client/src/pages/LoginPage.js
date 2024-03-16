import React, { useState } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  // const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate checking if username exists
    // const userExists = checkIfUserExists(username);

    // if (userExists) {
    //   setError("Username already exists. Please choose a different one.");
    // } else {
    //   console.log("User does not exist");
    // }

    try {
      axios
        .post("http://localhost:5000/api/v1/users/createUser", {
          username: username,
        })
        .then((res) => {
          console.log(res.data);
          navigate("/chat", { state: { username: username } });
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
