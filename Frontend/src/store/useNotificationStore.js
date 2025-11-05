import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axio";
import { socket } from "../lib/socket";

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    isLoading: false,
    isOpen: false,

    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    close: () => set({ isOpen: false }),

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/user/notifications`);
            set({ notifications: res.data.result.notifications });
            console.log("Fetched notifications:", res.data.notifications);
        } catch (error) {
            console.log("Error fetching notifications:", error);
            toast.error("Failed to fetch notifications");
        } finally {
            set({ isLoading: false });
        }
    },

    markAsRead: async (id) => {
        try {
            await axiosInstance.patch(`/user/notifications/${id}/read`);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n._id === id ? { ...n, isRead: true } : n
                ),
            }));
        } catch (error) {
            console.error("Error markAsRead:", error);
            toast.error("Failed to mark as read");
        }
    },

    addNotification: (notification) =>
        set((state) => ({ notifications: [notification, ...state.notifications] })),

    NotificationListeners: () => {
        socket.removeAllListeners("newNotification");
        socket.on("newNotification", (notification) => {
            set((state) => ({
                notifications: [notification, ...state.notifications],
            }));
        });
    },

    cleanupNotificationListeners: () => {
        socket.removeAllListeners("newNotification");
    }
}));
