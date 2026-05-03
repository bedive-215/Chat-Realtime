import express from "express";
import router from "./routes/app.route.js";
import { PORT } from "./helpers/env.helper.js";
import { app, server } from "./configs/socketioConf.js";
import { connectMongoDB } from "./configs/mongooDBConf.js";
import cors from "cors";
import cookieParser from "cookie-parser";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
  "http://frontend:5173",
  "https://chat-realtime.pages.dev",
  "https://a9f6af03.chat-realtime.pages.dev"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use("/api", router);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectMongoDB();
});
