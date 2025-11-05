import { useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import toast from "react-hot-toast";
import { useNotificationStore } from "../store/useNotificationStore";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axio";

const NotificationBell = () => {
  const {
    notifications,
    isOpen,
    toggleOpen,
    close,
    fetchNotifications,
    markAsRead,
  } = useNotificationStore();

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifications.length;
  const dropdownRef = useRef(null);

  // ---- Time ago formatter ----
  const timeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now - created) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  // ---- Fetch + click outside ----
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      close();
    }
  };

  // ---- Click vào thông báo để mark as read ----
  const handleReadNotification = (notificationId) => {
    markAsRead(notificationId);
  };

  // ---- Friend request accept / reject ----
  const handleAccept = async (senderId, notificationId) => {
    try {
      const { addFriend } = useAuthStore.getState();
      const res = await axiosInstance.patch(`/user/friends/${senderId}`);
      const friendData = res.data.result?.request?.requester;

      if (friendData) addFriend(friendData);

      toast.success("Friend request accepted");
      markAsRead(notificationId);
    } catch (error) {
      console.error("Accept error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  };

  const handleReject = async (senderId, notificationId) => {
    try {
      await axiosInstance.delete(`/user/friends/reject/${senderId}`);
      toast.success("Friend request rejected");
      markAsRead(notificationId);
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggleOpen} className="btn btn-sm btn-ghost relative">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-base-100 rounded-xl shadow-lg border max-h-96 overflow-y-auto z-50">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <span className="font-semibold">Notifications</span>
          </div>

          {unreadNotifications.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No notifications</p>
          ) : (
            unreadNotifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleReadNotification(n._id)}
                className="px-4 py-2 text-sm hover:bg-base-200 transition-all rounded-lg cursor-pointer bg-primary/10"
              >
                <p className="text-base-content">{n.content}</p>

                {/* Thời gian */}
                <div className="flex items-center gap-1 mt-1 text-xs italic text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{timeAgo(n.createdAt)}</span>
                </div>

                {/* Nếu là lời mời kết bạn */}
                {n.type === "friend_request" && n.senderId && (
                  <div className="flex gap-2 mt-3">
                    <button
                      className="btn btn-circle btn-sm btn-success hover:scale-105 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation(); // tránh click vào container
                        handleAccept(n.senderId, n._id);
                      }}
                      aria-label="Accept"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>

                    <button
                      className="btn btn-circle btn-sm btn-error hover:scale-105 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(n.senderId, n._id);
                      }}
                      aria-label="Reject"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
