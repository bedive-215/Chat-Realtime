import jwt from "jsonwebtoken";
import redis from "../configs/redisConf.js";
import { generateAccessToken } from "../helpers/token.helper.js";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../helpers/env.helper.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};

export const checkAuthMiddleware = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    const exist = await redis.sIsMember(
      `refresh_tokens:${decoded.id}`,
      refreshToken
    );
    if (!exist) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const payload = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      phone_number: decoded.phone_number,
    };

    const newAccessToken = generateAccessToken(payload);

    req.user = payload;
    req.token = newAccessToken;
    res.locals.newAccessToken = newAccessToken;

    return next();
  } catch (err) {
    console.error("checkAuth middleware error:", err.message);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};