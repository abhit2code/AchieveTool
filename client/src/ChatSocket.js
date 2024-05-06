import { io } from "socket.io-client";

// const socket = io("http://localhost:8800");
const socket = io("http://192.168.3.30:8800/");

export default socket;
