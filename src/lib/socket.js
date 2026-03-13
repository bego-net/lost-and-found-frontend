import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;
if (!SOCKET_URL) {
  console.error("VITE_API_URL is not set");
}

const socket = io(SOCKET_URL);

export default socket;
