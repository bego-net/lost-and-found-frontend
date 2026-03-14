import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;
if (!SOCKET_URL) {
  console.error("VITE_API_URL is not set");
}

const token = localStorage.getItem("token");

const socket = io(SOCKET_URL, {
  withCredentials: true,
  auth: token ? { token } : undefined,
});

export const setSocketAuth = (nextToken) => {
  socket.auth = nextToken ? { token: nextToken } : {};
  if (!socket.connected) socket.connect();
};

export default socket;
