import { io } from "socket.io-client";

const URL = "https://api-chat-realtime-gp3w.onrender.com";

export const socket = io(URL, {
  withCredentials: true,

  transports: ["websocket"],

  query: {
    userId: (() => {
      try {
        const user = JSON.parse(localStorage.getItem("authUser"));
        return user?.id || null;
      } catch {
        return null;
      }
    })(),
  },
});