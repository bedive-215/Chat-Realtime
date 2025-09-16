import models from '../models/index.js';
import { uploadBufferToCloudinary } from '../helpers/upload.helper.js';

const { User } = models;

export const updateProfile = async (user, file) => {
    try {
        if (!file) {
            return {
                error: {
                    code: 400,
                    name: "UpdateProfileError",
                    message: "Profile picture is required"
                }
            };
        }

        const uploadResponse = await uploadBufferToCloudinary(file.buffer, 'avatars');
        const authUser = await User.findByPk(user.id);
        if (!authUser) {
            return {
                error: { code: 404, name: "UserNotFound", message: "User not found" }
            };
        }

        authUser.profile_avatar = uploadResponse;
        await authUser.save();

        const updatedUser = await User.findOne({
            where: { id: authUser.id },
            attributes: ["id", "username", "phone_number","profile_avatar", "created_at"]
        });

        return {
            result: {
                name: "ProfileUpdated",
                message: "Profile updated successfully",
                user: updatedUser
            }
        };
    } catch (error) {
        console.error("Error update profile:", error);
        return {
            error: {
                code: 500,
                name: "InternalError",
                message: "Something went wrong while updating profile"
            }
        };
    }
};
