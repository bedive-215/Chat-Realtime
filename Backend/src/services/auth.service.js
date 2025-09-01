import bcryptjs, { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from "../helpers/token.helper.js";
import models from '../models/index.js';
import { registationValidate, signInValidate } from "../validators/auth.validator.js";
import { Op } from 'sequelize';
import redis from '../configs/redisConf.js';

const { User } = models;

export default {
    // dang ky
    async signUp(data) {
        const { error } = registationValidate.validate(data, { abortEarly: false });
        if (error) {
            return {
                error: {
                    code: 400,
                    name: error.name,
                    message: error.details.map(e => e.message)
                }
            };
        }

        const [emailExists, usernameExists, phoneExists] = await Promise.all([
            User.findOne({ where: { email: data.email } }),
            User.findOne({ where: { username: data.username } }),
            User.findOne({ where: { phone_number: data.phone_number } })
        ]);

        if (emailExists || usernameExists || phoneExists) {
            return {
                error: {
                    code: 400,
                    name: "UserExists",
                    message: "Email, username, or phone number already in use"
                }
            };
        }

        const hashed = await bcryptjs.hash(data.password, 10);

        const user = await User.create({
            username: data.username,
            email: data.email,
            phone_number: data.phone_number,
            password: hashed
        });

        const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            phone_number: user.phone_number
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await redis.sAdd(`refresh_tokens:${user.id}`, refreshToken);
        await redis.expire(`refresh_tokens:${user.id}`, 60 * 60 * 24 * 30);

        return {
            result: {
                name: "UserCreated",
                message: "Account created successfully",
                accessToken,
            },
            refreshToken
        };
    },

    // dang nhap
    async signIn(data) {
        const { error } = signInValidate.validate(data, { abortEarly: false });

        const login_name = data.login_name.trim();

        const clause = {
            [Op.or]: [
                { username: login_name },
                { email: login_name },
                { phone_number: login_name }
            ]
        };

        const user = await User.findOne({ where: clause });
        if (!user) {
            return {
                error: {
                    code: 400,
                    name: "UserNotFound",
                    message: "Account does not exist"
                }
            };
        }

        const valid = await bcryptjs.compare(data.password, user.password);
        if (!valid) {
            return {
                error: {
                    code: 400,
                    name: "InvalidPassword",
                    message: "Incorrect password"
                }
            };
        }

        const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            phone_number: user.phone_number
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Luu refresh token vao redis
        await redis.sAdd(`refresh_tokens:${user.id}`, refreshToken);
        await redis.expire(`refresh_tokens:${user.id}`, 60 * 60 * 24 * 30);

        return {
            result: {
                name: "UserLoggedIn",
                message: "Logged in successfully",
                accessToken,
            },
            refreshToken
        };
    },

};
