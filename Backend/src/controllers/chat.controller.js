import chatService from "../services/chat.service.js";

export const createChat = async (req, res) => {
    const { error, result } = await chatService.creatChat(req.user.id, req.body.friendId)
    if (error) return res.status(error.code).json(error);
    return res.status(201).json(result);
};

export const getChatId = async (req, res) => {
    const { error, result } = await chatService.getChatId(req.user.id, req.params.friendId);
    if (error) return res.status(error.code).json(error);
    return res.status(200).json(result);
};
