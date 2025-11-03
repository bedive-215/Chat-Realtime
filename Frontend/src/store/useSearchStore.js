import { create } from "zustand";
import { axiosInstance } from "../lib/axio";
import toast from "react-hot-toast";

export const useSearchStore = create((set, get) => ({
  searchResults: [],
  isSearching: false,
  searchQuery: "",
  pagination: {
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  },
  // Tìm kiếm users
  searchUsers: async (query, page = 1, limit = 10) => {
    if (!query.trim()) {
      set({ 
        searchResults: [], 
        searchQuery: "",
        pagination: { totalItems: 0, currentPage: 1, totalPages: 0 }
      });
      return;
    }

    set({ isSearching: true, searchQuery: query });

    try {
      const res = await axiosInstance.get("/user/search", {
        params: { search: query, page, limit }
      });

      const { users, pagination } = res.data;

      set({
        searchResults: users || [],
        pagination: pagination || { totalItems: 0, currentPage: 1, totalPages: 0 },
      });

    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
      set({ 
        searchResults: [], 
        pagination: { totalItems: 0, currentPage: 1, totalPages: 0 }
      });
    } finally {
      set({ isSearching: false });
    }
  },

  // Load more (pagination)
  loadMoreResults: async () => {
    const { searchQuery, pagination, isSearching } = get();
    
    if (isSearching || pagination.currentPage >= pagination.totalPages) {
      return;
    }

    await get().searchUsers(searchQuery, pagination.currentPage + 1);
  },

  // Clear search
  clearSearch: () => {
    set({
      searchResults: [],
      searchQuery: "",
      isSearching: false,
      pagination: { totalItems: 0, currentPage: 1, totalPages: 0 }
    });
  },

  // Reset store
  resetSearch: () => {
    set({
      searchResults: [],
      searchQuery: "",
      isSearching: false,
      pagination: { totalItems: 0, currentPage: 1, totalPages: 0 }
    });
  },
}));