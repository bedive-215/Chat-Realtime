import { io } from "socket.io-client";


export const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
  query: {
    userId: localStorage.getItem("authUser")
      ? JSON.parse(localStorage.getItem("authUser")).id
      : null,
  },
});