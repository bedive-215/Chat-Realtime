import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, 
        REFRESH_TOKEN_SECRET, 
        ACCESS_TOKEN_EXPIRES_IN, 
        REFRESH_TOKEN_EXPIRES_IN } from './env.helper.js';

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET ) {
    throw new Error("Missing required token secrets in environment variables.");
}

const signToken = (payload, secret, expiresIn) =>
    jwt.sign(payload, secret, { expiresIn });

export const generateAccessToken = (payload) =>
    signToken(payload, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRES_IN);

export const generateRefreshToken = (payload) => 
    signToken(payload, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN);

export const generateResetToken = (payload) =>
    signToken(payload, RESET_PASSWORD_TOKEN_SECRET, '30m');