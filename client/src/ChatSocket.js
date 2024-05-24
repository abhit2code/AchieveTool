import { io } from "socket.io-client";

// const socket = io(process.env.REACT_APP_SERVER_URL);
const socket = io("https://froot-achievetool.onrender.com");

export default socket;
