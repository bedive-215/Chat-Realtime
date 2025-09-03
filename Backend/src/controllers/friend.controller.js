import FriendService from "../services/friend.service.js";

export const getFriends = async (req, res) => {
  try {
    const { error, result } = await FriendService.getFriends(req.user.id);
    if (error) return res.status(error.code || 400).json(error);
    return res.status(200).json(result);
  } catch (err) {
    console.error("getFriends controller error:", err);
    return res.status(500).json({ code: 500, name: "ServerError", message: "Internal server error" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const { error, result } = await FriendService.getFriendRequests(req.user.id);
    if (error) return res.status(error.code || 400).json(error);
    return res.status(200).json(result);
  } catch (err) {
    console.error("getFriendRequests controller error:", err);
    return res.status(500).json({ code: 500, name: "ServerError", message: "Internal server error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const { error, result } = await FriendService.sendFriendRequest(req.user.id, friendId);
    if (error) return res.status(error.code || 400).json(error);
    return res.status(201).json(result);
  } catch (err) {
    console.error("sendFriendRequest controller error:", err);
    return res.status(500).json({ code: 500, name: "ServerError", message: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const requesterId = req.params.requesterId;
    const { error, result } = await FriendService.acceptFriendRequest(req.user.id, requesterId);
    if (error) return res.status(error.code || 400).json(error);
    return res.status(200).json(result);
  } catch (err) {
    console.error("acceptFriendRequest controller error:", err);
    return res.status(500).json({ code: 500, name: "ServerError", message: "Internal server error" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const requesterId = req.params.requesterId;
    const { error, result } = await FriendService.rejectFriendRequest(req.user.id, requesterId);
    if (error) return res.status(error.code || 400).json(error);
    return res.status(200).json(result);
  } catch (err) {
    console.error("rejectFriendRequest controller error:", err);
    return res.status(500).json({ code: 500, name: "ServerError", message: "Internal server error" });
  }
};

export const cancelFriendRequest = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const { error, result } = await FriendService.cancelFriendRequest(req.user.id, friendId);
    if (error) return res.status(error.code || 400).json(error);
    return res.status(200).json(result);
  } catch (err) {
    console.error("cancelFriendRequest controller error:", err);
    return res.status(500).json({ code: 500, name: "ServerError", message: "Internal server error" });
  }
};

export const unfriend = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const { error, result } = await FriendService.unfriend(req.user.id, friendId);
    if (error) return res.status(error.code || 400).json(error);
    return res.status(200).json(result);
  } catch (err) {
    console.error("unfriend controller error:", err);
    return res.status(500).json({ code: 500, name: "ServerError", message: "Internal server error" });
  }
};
