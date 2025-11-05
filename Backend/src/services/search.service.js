import { Op } from "sequelize";
import models from "../models/index.js";

const { User } = models;

export const searchService = {
    async searchUsers(query) {
        try {
            const page = parseInt(query.page, 10) || 1;
            const limit = parseInt(query.limit, 10) || 5;
            const offset = (page - 1) * limit;

            const searchTerm = query.search?.trim() || "";

            let whereCondition = {};
            if (searchTerm) {
                whereCondition = {
                    [Op.or]: [
                        { username: { [Op.like]: `${searchTerm}%` } },
                        { email: { [Op.like]: `${searchTerm}%` } },
                        { phone_number: { [Op.like]: `${searchTerm}%` } }
                    ]
                };
            }

            const { rows: users, count: totalItems } = await User.findAndCountAll({
                where: whereCondition,
                attributes: ["id", "username", "email", "phone_number", "profile_avatar"],
                limit,
                offset,
                order: [["username", "ASC"]],
            });

            return {
                users,
                pagination: {
                    totalItems,
                    currentPage: page,
                    totalPages: totalItems > 0 ? Math.ceil(totalItems / limit) : 0
                }
            };

        } catch (error) {
            console.error("Error searching users:", error);
            return {
                error: {
                    code: 500,
                    name: "InternalError",
                    message: "Something went wrong while searching users"
                }
            };
        }
    }
};
