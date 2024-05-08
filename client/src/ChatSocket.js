import { io } from "socket.io-client";

const socket = io("http://192.168.3.30:8900");

export default socket;
