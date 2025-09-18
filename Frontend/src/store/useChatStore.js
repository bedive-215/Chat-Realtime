import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axio";


export const useChatStore = create((set) => ({
    message: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUser: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/user/friends-info");
            set({ users: res.data });
        } catch (error) {
            console.log("Error fetching users:", error);
            toast.error("Failed to fetch users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (chatId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${chatId}`);
            set({ message: res.data.messages });
        } catch (error) {
            console.log("Error fetching messages:", error);
            toast.error("Failed to fetch messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    }
}));
