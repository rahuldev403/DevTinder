import { io } from "socket.io-client";

const socketBaseUrl =
  import.meta.env.VITE_SOCKET_BASE_URL || "http://localhost:8000";

export const createSocket = (token) => {
  return io(socketBaseUrl, {
    withCredentials: true,
    auth: { token },
  });
};
