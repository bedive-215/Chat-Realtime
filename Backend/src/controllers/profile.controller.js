import { updateProfile as profileService } from "../services/profile.service.js";

export const updateProfile = async (req, res) => {
    const { error, result } = await profileService(req.user, req.body);
    if (error) return res.status(error.code).json(error);
    return res.status(201).json(result);
};