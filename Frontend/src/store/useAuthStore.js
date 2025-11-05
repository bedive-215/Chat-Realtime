import { create } from "zustand";
import { axiosInstance } from "../lib/axio.js";
import toast from "react-hot-toast";
import { socket } from "../lib/socket.js";

const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
const getFromLocalStorage = (key, fallback = null) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};
const clearLocalStorage = (keys) => {
  keys.forEach((key) => localStorage.removeItem(key));
};

export const useAuthStore = create((set, get) => ({
  authUser: getFromLocalStorage("authUser"),
  accessToken: null,
  friends: getFromLocalStorage("friends", []),

  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/public/check-auth", { withCredentials: true });
      if (res.data.newAccessToken) {
        axiosInstance.defaults.headers.common.Authorization =
          `Bearer ${res.data.newAccessToken}`;
        set({ accessToken: res.data.newAccessToken });
      }
      const storedUser = getFromLocalStorage("authUser");
      if (storedUser) {
        set({ authUser: storedUser });
      }

      const storedFriends = getFromLocalStorage("friends", []);
      if (storedFriends.length > 0) {
        set({ friends: storedFriends });
      }
    } catch (err) {
      console.log("Error in checkAuth: ", err);
      if (err.response?.status === 401) {
        set({ authUser: null, accessToken: null, friends: [], onlineUsers: [] });
        clearLocalStorage(["authUser", "friends"]);
        delete axiosInstance.defaults.headers.common.Authorization;
      } else {
        const storedUser = getFromLocalStorage("authUser");
        const storedFriends = getFromLocalStorage("friends", []);
        set({
          authUser: storedUser,
          friends: storedFriends,
          accessToken: null,
        });
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/public/signUp", data);
      const { accessToken, friends, user } = res.data;
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      set({
        authUser: user,
        accessToken,
        friends: friends || [],
      });

      saveToLocalStorage("authUser", user);
      saveToLocalStorage("friends", friends || []);

      toast.success("Account created successfully");

      setTimeout(() => {
        get().initializeSocket();
        get().connectSocket();
      }, 500);

    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/public/signIn", data);
      const { accessToken, friends, user } = res.data;
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      set({
        authUser: user,
        accessToken,
        friends: friends || [],
      });

      saveToLocalStorage("authUser", user);
      saveToLocalStorage("friends", friends || []);

      setTimeout(() => {
        get().initializeSocket();
        get().connectSocket();
      }, 500);

    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      const currentUser = get().authUser;
      if (socket && socket.connected && currentUser) {
        console.log("Notifying server about logout...");
        socket.emit("userLogout", { userId: currentUser.id });
      }
      await axiosInstance.post("/public/logout");

      get().disconnectSocket();

      set({
        authUser: null,
        accessToken: null,
        friends: [],
        onlineUsers: []
      });

      clearLocalStorage(["authUser", "friends"]);

      delete axiosInstance.defaults.headers.common.Authorization;

      console.log("Logout completed successfully");

    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.message || "Logout failed");

      get().disconnectSocket();
      set({
        authUser: null,
        accessToken: null,
        friends: [],
        onlineUsers: []
      });
      clearLocalStorage(["authUser", "friends"]);
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  },

  updateProfile: async (file) => {
    set({ isUpdatingProfile: true });
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axiosInstance.put("/user/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set({ authUser: res.data.user });
      saveToLocalStorage("authUser", res.data.user);

      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const currentUser = get().authUser;
    if (!currentUser || !socket) return;

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("userOnline", { userId: currentUser.id, username: currentUser.username });
  },

  disconnectSocket: () => {
    if (!socket) return;

    socket.off("getUserOnline");
    socket.off("userOnline");
    socket.off("userOffline");

    if (socket.connected) {
      socket.disconnect();
    }
  },

  initializeSocket: () => {
    if (!socket) return;
    socket.off("getUserOnline");
    socket.off("userOnline");
    socket.off("userOffline");

    socket.on("getUserOnline", (onlineFriends) => {
      set({ onlineUsers: onlineFriends || [] });
    });

    socket.on("userOnline", (userId) => {
      set((state) => {
        const currentOnlineUsers = state.onlineUsers || [];
        if (!currentOnlineUsers.some(id => id == userId)) {
          return { onlineUsers: [...currentOnlineUsers, userId] };
        }
        return state;
      });
    });

    socket.on("userOffline", ({ userId }) => {
      set((state) => {
        const currentOnlineUsers = state.onlineUsers || [];
        const newOnlineUsers = currentOnlineUsers.filter(id => id != userId);
        return { onlineUsers: newOnlineUsers };
      });
    });

    setTimeout(() => {
      if (socket.connected) {
        socket.emit("getOnlineUsers");
      }
    }, 1000);
  },
  addFriend: (friend) => {
    set((state) => {
      const alreadyFriend = state.friends.some((f) => f.id === friend.id);
      const updatedFriends = alreadyFriend
        ? state.friends
        : [friend, ...state.friends];

      const updatedOnline = state.onlineUsers.includes(friend.id)
        ? state.onlineUsers
        : [...state.onlineUsers, friend.id];

      saveToLocalStorage("friends", updatedFriends);
      return {
        friends: updatedFriends,
        onlineUsers: updatedOnline,
      };
    });
  },


  removeFriend: (friendId) => {
    set((state) => {
      const updatedFriends = state.friends.filter((f) => f.id !== friendId);
      const updatedOnline = state.onlineUsers.filter((id) => id !== friendId);
      saveToLocalStorage("friends", updatedFriends);
      return {
        friends: updatedFriends,
        onlineUsers: updatedOnline,
      };
    });
  },
}));