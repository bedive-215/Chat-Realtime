import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: 'https://api-chat-realtime-gp3w.onrender.com/api', 
    withCredentials: true,
});