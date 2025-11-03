import { useState, useRef, useEffect } from "react";
import { Search, X, UserPlus, MessageSquare, Loader2, Clock } from "lucide-react";
import { useSearchStore } from "../store/useSearchStore";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axio";
import toast from "react-hot-toast";

const SearchPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [sendingRequest, setSendingRequest] = useState({}); // Track loading state per user
  const [sentRequests, setSentRequests] = useState(new Set()); // Track sent requests
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null);

  const { 
    searchResults, 
    isSearching, 
    searchUsers, 
    clearSearch,
    pagination 
  } = useSearchStore();

  const { friends, onlineUsers, authUser } = useAuthStore();

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle search with debounce
  const handleSearch = (value) => {
    setSearchInput(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!value.trim()) {
      clearSearch();
      return;
    }

    debounceTimeout.current = setTimeout(() => {
      searchUsers(value);
    }, 300);
  };

  // Check if user is friend
  const isFriend = (userId) => {
    return friends.some(friend => friend.id === userId);
  };

  // Check if user is online
  const isOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  // Handle clear search
  const handleClear = () => {
    setSearchInput("");
    clearSearch();
    inputRef.current?.focus();
  };

  // Handle open search
  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Handle send friend request
  const handleSendFriendRequest = async (receiverId) => {
    setSendingRequest((prev) => ({ ...prev, [receiverId]: true }));

    try {
      await axiosInstance.post("/user/friends", { receiverId });
      
      // Add to sent requests set
      setSentRequests((prev) => new Set([...prev, receiverId]));
      
      toast.success("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error(error.response?.data?.message || "Failed to send friend request");
    } finally {
      setSendingRequest((prev) => ({ ...prev, [receiverId]: false }));
    }
  };

  // Check if request was sent
  const isRequestSent = (userId) => {
    return sentRequests.has(userId);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Search Button/Input */}
      <button
        onClick={handleOpen}
        className="btn btn-ghost btn-sm gap-2"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search</span>
      </button>

      {/* Search Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-base-100 rounded-lg shadow-xl border border-base-300 z-50 max-h-[600px] flex flex-col">
          {/* Search Input Header */}
          <div className="p-4 border-b border-base-300">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50" />
              <input
                ref={inputRef}
                type="text"
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search users..."
                className="input input-bordered w-full pl-10 pr-10"
              />
              {searchInput && (
                <button
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="overflow-y-auto flex-1">
            {isSearching ? (
              <div className="p-8 text-center">
                <Loader2 className="size-8 mx-auto mb-2 animate-spin text-primary" />
                <p className="text-sm text-base-content/60">Searching...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-8 text-center text-base-content/60">
                {searchInput ? (
                  <>
                    <Search className="size-12 mx-auto mb-2 opacity-50" />
                    <p>No users found</p>
                  </>
                ) : (
                  <>
                    <Search className="size-12 mx-auto mb-2 opacity-50" />
                    <p>Start typing to search users</p>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-base-300">
                {searchResults.map((user) => {
                  const isUserFriend = isFriend(user.id);
                  const isUserOnline = isOnline(user.id);
                  const isCurrentUser = user.id === authUser?.id;
                  const isReqSent = isRequestSent(user.id);
                  const isSending = sendingRequest[user.id];

                  return (
                    <div
                      key={user.id}
                      className="p-4 hover:bg-base-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar with online indicator */}
                        <div className="relative">
                          <img
                            src={user.profile_avatar || "/avatar.png"}
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {isUserOnline && !isCurrentUser && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-base-100 rounded-full"></div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate">
                              {user.username}
                            </p>
                            {isCurrentUser && (
                              <span className="badge badge-sm badge-ghost">You</span>
                            )}
                            {isUserFriend && !isCurrentUser && (
                              <span className="badge badge-sm badge-primary">Friend</span>
                            )}
                            {isReqSent && !isUserFriend && !isCurrentUser && (
                              <span className="badge badge-sm badge-warning">Pending</span>
                            )}
                          </div>
                          <p className="text-xs text-base-content/60 truncate">
                            {user.email}
                          </p>
                          {user.phone_number && (
                            <p className="text-xs text-base-content/50 truncate">
                              {user.phone_number}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {!isCurrentUser && (
                          <div className="flex gap-2">
                            {isUserFriend ? (
                              <button
                                className="btn btn-sm btn-ghost gap-1"
                                title="Send message"
                              >
                                <MessageSquare className="size-4" />
                                <span className="text-xs">Message</span>
                              </button>
                            ) : isReqSent ? (
                              <button
                                className="btn btn-sm btn-ghost gap-1"
                                title="Request sent"
                                disabled
                              >
                                <Clock className="size-4" />
                                <span className="text-xs">Pending</span>
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-primary gap-1"
                                title="Add friend"
                                onClick={() => handleSendFriendRequest(user.id)}
                                disabled={isSending}
                              >
                                {isSending ? (
                                  <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span className="text-xs">Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="size-4" />
                                    <span className="text-xs">Add</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Pagination Info */}
                {pagination.totalPages > 1 && (
                  <div className="p-4 text-center text-sm text-base-content/60 border-t border-base-300">
                    Page {pagination.currentPage} of {pagination.totalPages}
                    {pagination.currentPage < pagination.totalPages && (
                      <button 
                        className="btn btn-sm btn-link"
                        onClick={() => loadMoreResults()}
                      >
                        Load more
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPanel;