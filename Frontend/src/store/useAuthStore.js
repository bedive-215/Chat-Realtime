import { create } from "zustand";
import { axiosInstance } from "../lib/axio.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  accessToken: null,
  friends: [],

  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("public/check-auth");

      if (res.data.newAccessToken) {
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${res.data.newAccessToken}`;
      }

      set({
        authUser: res.data.user || null,
        accessToken: res.data.newAccessToken || res.headers["x-access-token"] || null,
        friends: res.data.friends || [],
      });
    } catch (err) {
      console.log("Error in checkAuth: ", err);
      set({ authUser: null, accessToken: null, friends: [] });
      delete axiosInstance.defaults.headers.common.Authorization;
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/public/signUp", data);
      console.log("REPSONSE DATA:", res.data);
      const { accessToken, friends, user } = res.data;
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      set({
        authUser: user,
        accessToken,
        friends: friends || [],
      });

      toast.success("Account created successfully");
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

      // toast.success("Login successful");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/public/logout");
      set({ authUser: null, accessToken: null, friends: [] });
      delete axiosInstance.defaults.headers.common.Authorization;
      // toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },
}));
