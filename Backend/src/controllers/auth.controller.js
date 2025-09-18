import authService from "../services/auth.service.js";
import { NODE_ENV, REFRESH_TOKEN_SECRET } from "../helpers/env.helper.js";
import redis from '../configs/redisConf.js';
import jwt from 'jsonwebtoken';

export const signUp = async (req, res) => {
    const { error, result, refreshToken } = await authService.signUp(req.body);
    if (error) return res.status(error.code).json(error);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: NODE_ENV !== "development",
        sameSite: "strict", 
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json(result);
};

export const signIn = async (req, res) => {
    const { error, result, refreshToken } = await authService.signIn(req.body);
    if (error) return res.status(error.code).json(error);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: NODE_ENV !== "development",
        sameSite: "strict", 
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json(result);
};

export const logout = async (req, res) => {
    const { refreshToken } = req.cookies;
    if(refreshToken){
        try {
            const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            await redis.sRem(`refresh_tokens:${payload.id}`, refreshToken);
        } catch (err) {
            console.warn("Logout: invalid or expired refresh token");
        }
    }
    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: NODE_ENV !== "development",
    });
    return res.status(200).json({ message: "Logged out successfully" });
};

export const checkAuth = (req, res) => {
  try {
    return res.status(200).json({
        user: req.user,
        newAccessToken: res.locals.newAccessToken || req.token || null
    });
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};