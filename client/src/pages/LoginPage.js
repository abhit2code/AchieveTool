import React, { useState } from "react"; // Import useState
import {
  TextField,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import { useGenderContext } from "../context/GenderContext";
import socket from "../ChatSocket";
import { set } from "date-fns";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState(""); // State for storing error message

  const { login, user } = useUserContext();
  const navigate = useNavigate();

  const { gender, updateGender } = useGenderContext();

  const handleLogin = async () => {
    if (!gender) {
      // Check if gender is not selected
      setError("Please select your gender");
      return;
    }

    try {
      await axios
        .post("http://localhost:5000/api/v1/users/createUser", {
          username: username,
          gender: gender, // Sending selected gender to the server
        })
        .then((res) => {
          console.log(res.data);
          // socket.emit("addUser", username);
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
          margin="normal"
        />
        <Box marginTop={2}>
          {" "}
          {/* Adding margin top to create space for the dropdown */}
          <Typography variant="body1" gutterBottom>
            Select your Gender
          </Typography>
          <Select
            fullWidth
            value={gender}
            onChange={(e) => updateGender(e.target.value)}
            variant="outlined"
            error={Boolean(error)}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </Select>
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: "1rem" }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;
