import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../helpers/env.helper.js";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user; // gắn payload vào request để controller dùng
        next();
    });
};
