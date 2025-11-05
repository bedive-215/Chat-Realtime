import { searchService } from "../services/search.service.js";

export const searchUsers = async (req, res) => {
    const result = await searchService.searchUsers(req.query);

    if (result.error) {
        return res.status(result.error.code).json(result.error);
    }

    return res.status(200).json(result);
};
