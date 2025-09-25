import "./logs/logger.js";
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
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api", router);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectMongoDB();
});
