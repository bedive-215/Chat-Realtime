import jwt from "jsonwebtoken";
import redis from "../configs/redisConf.js";
import { generateAccessToken } from "../helpers/token.helper.js";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../helpers/env.helper.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token missing" });
      }

      try {
        const decodedRe = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        const exist = await redis.sIsMember(
          `refresh_tokens:${decodedRe.id}`,
          refreshToken
        );
        if (!exist) {
          return res.status(403).json({ message: "Invalid refresh token" });
        }

        const payload = {
          id: decodedRe.id,
          username: decodedRe.username,
          email: decodedRe.email,
          phone_number: decodedRe.phone_number,
        };
        const newAccessToken = generateAccessToken(payload);

        res.setHeader("x-access-token", newAccessToken);
        req.user = decodedRe;
        return next();
      } catch (refreshErr) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};
