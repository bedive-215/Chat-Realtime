import notificationService from "../services/notification.service.js";

export const getNotifications = async (req, res) => {
    const receiverId = req.user.id;
    const { error, result } = await notificationService.getNotifications(receiverId);
    if (error) {
        return res.status(error.code).json({ error });
    }
    return res.status(200).json({ result });
}

export const markAsRead = async (req, res) => {
    const notificationId = req.params.id;
    const { error, result } = await notificationService.markAsRead(notificationId);
    if (error) {
        return res.status(error.code).json({ error });
    }
    return res.status(200).json({ result });
}

export const deleteNotification = async (req, res) => {
    const id = req.params.id;
    const {error, result} = await notificationService.deleteNotification(id);
    if (error){
        return res.status(error.code).json({error});
    }
    return res.status(200).json({result});
}