import bcryptjs from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from "../helpers/token.helper.js";
import models from '../models/index.js';
import { registationValidate, signInValidate } from "../validators/auth.validator.js";
import { Op } from 'sequelize';
import redis from '../configs/redisConf.js';
import friendService from './friend.service.js';

const { User } = models;

export default {
    // Đăng ký
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

        const result = {...payload, profile_avatar: user.profile_avatar, created_at: user.created_at}

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        
        await redis.sAdd(`refresh_tokens:${user.id}`, refreshToken);
        await redis.expire(`refresh_tokens:${user.id}`, 60 * 60 * 24 * 30);
        return {
            result: {
                name: "UserCreated",
                message: "Account created successfully",
                accessToken,
                user: result
            },
            refreshToken
        };
    },

    // Đăng nhập
    async signIn(data) {
        const { error } = signInValidate.validate(data, { abortEarly: false });
        if (error) {
            return {
                error: {
                    code: 400,
                    name: error.name,
                    message: error.details.map(e => e.message)
                }
            };
        }

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

        const result = {...payload, profile_avatar: user.profile_avatar, created_at: user.created_at};
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        console.log("Generated tokens for user:", user.id);
        // Gọi service getFriends (tự xử lý cache/DB)
        const { result: friends } = await friendService.getFriends(user.id);
        console.log("User's friends:", friends);
        // Lưu refresh token
        await redis.sAdd(`refresh_tokens:${user.id}`, refreshToken);
        await redis.expire(`refresh_tokens:${user.id}`, 60 * 60 * 24 * 30);
        return {
            result: {
                name: "UserLoggedIn",
                message: "Logged in successfully",
                accessToken,
                friends,
                user: result
            },
            refreshToken
        };
    }
};
