import models from '../models/index.js';
import cloudinary from '../configs/cloudinaryConf.js';

const { User } = models;

export const updateProfile = async (user, body) => {
    try {
        const { profilePic } = body;
        if (!profilePic) {
            return {
                error: {
                    code: 400,
                    name: "UpdateProfileError",
                    message: "Profile picture is required"
                }
            };
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
            folder: "avatars"
        });

        // update trong db
        const [affected] = await User.update(
            { profile_avatar: uploadResponse.secure_url },
            { where: { id: user.id } }
        );

        if (affected === 0) {
            return {
                error: {
                    code: 404,
                    name: "UserNotFound",
                    message: "User not found"
                }
            };
        }

        // lấy lại user sau khi update
        const updatedUser = await User.findOne({
            where: { id: user.id },
            attributes: ["id", "username", "profile_avatar"]
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