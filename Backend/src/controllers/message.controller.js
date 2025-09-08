import messageService from "../services/message.service.js";

export const getMessage = async (req, res) => {
  const { limit, before } = req.query;
  const { result, error } = await messageService.getMessage(
    req.params.chatId,
    { limit: Number(limit) || 20, before }
  );
  if (error) return res.status(error.code || 400).json(error);
  return res.status(200).json(result);
};
