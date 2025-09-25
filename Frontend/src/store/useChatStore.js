import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axio";
import { socket } from "../lib/socket";
import { v4 as uuidv4 } from "uuid";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    setSelectedUser: (selectedUser) => set({ selectedUser }),

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

    getMessages: async (chatId, { before } = {}) => {
        if(!before) set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/user/messages/${chatId}`, {
                params: { before },
            });

            set((state) => {
                if (before) {
                    return {
                        messages: [...res.data.messages.reverse(), ...state.messages],
                    };
                } else {
                    return {
                        messages: res.data.messages.reverse(),
                    };
                }
            });
        } catch (error) {
            console.log("Error fetching messages:", error);
            toast.error("Failed to fetch messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    selectUser: (user) => {
        set({ selectedUser: user, messages: [] });
        const chatId = user.chatId;
        socket.emit("joinChat", {
            chatId,
            friendId: user.id,
        });
    },

    sendMessage: ({ receiverId, chatId, text, file }) => {
        if (!chatId) {
            toast.error("No chat selected");
            return;
        }

        if (!text?.trim() && !file) {
            toast.error("Message cannot be empty");
            return;
        }

        const authUser = JSON.parse(localStorage.getItem("authUser"));
        if (!authUser) {
            toast.error("User not authenticated");
            return;
        }

        const tempId = uuidv4();
        const newMsg = {
            id: tempId,
            chatId,
            content: text?.trim() || "",
            senderId: authUser.id,
            pending: true,
            createdAt: new Date().toISOString(),
            ...(file && { image: URL.createObjectURL(file) })
        };

        set({ messages: [...get().messages, newMsg] });
        set({
            users: get().users.map((user) =>
                user.chatId === chatId
                    ? { ...user, lastMessage: text?.trim() || "image" }
                    : user
            )
        });

        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const arrayBuffer = reader.result;
                const buffer = new Uint8Array(arrayBuffer);

                socket.emit("sendMessage", {
                    receiverId,
                    chatId,
                    text: text?.trim(),
                    file: {
                        buffer: buffer,
                        mimetype: file.type,
                        originalname: file.name
                    },
                    tempId
                });
            };
            reader.readAsArrayBuffer(file);
        } else {
            socket.emit("sendMessage", {
                receiverId,
                chatId,
                text: text?.trim(),
                tempId
            });
        }
    },

    listenMessages: () => {
        socket.off("newMessage");
        socket.on("newMessage", (data) => {
            const { selectedUser, messages } = get();

            if (selectedUser && data.message.chatId === selectedUser.chatId) {
                if (data.tempId) {
                    const exists = messages.some((m) => m.id === data.tempId);

                    if (exists) {
                        set({
                            messages: messages.map((m) =>
                                m.id === data.tempId
                                    ? { ...data.message, pending: false }
                                    : m
                            ),
                        });
                    } else {
                        set({ messages: [...messages, data.message] });
                    }
                } else {
                    set({ messages: [...messages, data.message] });
                }
            }
        });
    },

    leaveCurrentChat: () => {
        const { selectedUser } = get();
        if (selectedUser?.chatId) {
            socket.emit("leaveChat", {
                chatId: selectedUser.chatId,
                friendId: selectedUser.id
            });
        }
        set({ selectedUser: null, messages: [] });
    },

    resetUnread: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const updateUsers = get().users.map((user) =>
            user.id === selectedUser.id ? { ...user, unreadCount: 0 } : user
        );
        set({ users: updateUsers });
    },

    setupSocketListeners: () => {

        socket.removeAllListeners("chatUpdate");
        socket.removeAllListeners("newMessage");

        socket.on("newMessage", (data) => {
            const { selectedUser, messages } = get();

            if (selectedUser && data.message.chatId === selectedUser.chatId) {
                if (data.tempId) {
                    const exists = messages.some((m) => m.id === data.tempId);

                    if (exists) {
                        set({
                            messages: messages.map((m) =>
                                m.id === data.tempId
                                    ? { ...data.message, pending: false }
                                    : m
                            ),
                        });
                    } else {
                        set({ messages: [...messages, data.message] });
                    }
                } else {
                    set({ messages: [...messages, data.message] });
                }
            }
        });

        socket.on("chatUpdate", (data) => {
            const currentUsers = get().users;
            const authUser = JSON.parse(localStorage.getItem("authUser"));

            if (!authUser) {
                console.log("No auth user found");
                return;
            }

            const updatedUsers = currentUsers.map((user) => {
                if (Number(user.id) === Number(data.senderId)) {
                    const updatedUser = {
                        ...user,
                        lastMessage: data.lastMessage,
                        unreadCount: data.unreadCount || 0
                    };
                    return updatedUser;
                }
                return user;
            });

            console.log("🔄Setting updated users:", updatedUsers);
            set({ users: updatedUsers });

        });
    },

    cleanupSocketListeners: () => {
        socket.removeAllListeners("newMessage");
        socket.removeAllListeners("chatUpdate");
    }
}));