import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { LogOut, MessageSquare, Settings, User, Bell } from "lucide-react";
import { useEffect, useRef } from "react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { notifications, toggleOpen, isOpen, markAsRead, close } =
    useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const dropdownRef = useRef(null);

  const timeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now - created) / 1000); // seconds

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        close();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, close]);

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
      backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">the Beach</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2 relative" ref={dropdownRef}>
            {/* Notification Bell */}
            <button
              onClick={toggleOpen}
              className="btn btn-sm btn-ghost relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 flex items-center justify-center
                             w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full"
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div
                className="absolute right-0 top-12 w-80 bg-base-100 rounded-xl shadow-lg border 
                           max-h-96 overflow-y-auto z-50"
              >
                <div className="flex justify-between items-center px-4 py-2 border-b">
                  <span className="font-semibold">Notifications</span>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    No notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-base-200 
               ${!n.isRead ? "bg-primary/20" : "bg-base-100"}`}
                      onClick={() => markAsRead(n._id)}
                    >
                      <p className="text-base-content">{n.content}</p>
                      <span className="text-xs text-neutral text-base-content/50">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Settings */}
            <Link to={"/settings"} className="btn btn-sm gap-2 transition-colors">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {/* Profile + Logout */}
            {authUser && (
              <>
                <Link to={"/profile"} className="btn btn-sm gap-2">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="btn btn-sm gap-2" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
