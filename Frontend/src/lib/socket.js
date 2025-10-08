import { io } from "socket.io-client";


export const socket = io("http://localhost:8080", {
  withCredentials: true,
  query: {
    userId: localStorage.getItem("authUser")
      ? JSON.parse(localStorage.getItem("authUser")).id
      : null,
  },
});