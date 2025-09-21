import { useEffect } from "react";
import { Check, Users } from "lucide-react";
import SidebarSekeleton from "./skeletons/SidebarSekeleton";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = () => {
  const { users, getUser, isUsersLoading, selectUser, selectedUser, resetUnread } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getUser();
  }, [getUser]);

  if (isUsersLoading) return <SidebarSekeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>

      {/* Contact list */}
      <div className="overflow-y-auto w-full py-3">
        {users.map((user) => {
          const isSelected = selectedUser?.id === user.id;
          const isOnline = onlineUsers.includes(user.id);
          const hasUnread = user.unreadCount > 0;

          const handleClick = () => {
            if (!isSelected) {
              selectUser(user);
              resetUnread();
            }
          };

          return (
            <button
              key={user.id}
              onClick={handleClick}
              disabled={isSelected}
              className={`w-full p-3 flex items-center gap-3 transition-colors relative
                ${isSelected
                  ? "bg-base-300 ring-1 ring-base-300 cursor-pointer opacity-70"
                  : "hover:bg-base-300 cursor-pointer"
                }`}
            >
              {/* Avatar */}
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profile_avatar || "/avatar.png"}
                  alt={user.username}
                  className="size-12 object-cover rounded-full"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}
              </div>

              {/* User info (desktop only) */}
              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="font-medium truncate flex items-center gap-1">
                  <span className={isSelected ? "text-base-content" : "text-base-content"}>
                    {user.username}
                  </span>
                  {isOnline && (
                    <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                  )}
                </div>
                <div
                  className={`text-sm truncate ${
                    hasUnread
                      ? "text-base-content font-semibold"
                      : "text-base-400"
                  }`}
                >
                  {user.lastMessage || "No messages yet"}
                </div>
              </div>

              {/* Unread badge (desktop) */}
              {hasUnread && (
                <div className="hidden lg:block bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 ml-2">
                  {user.unreadCount > 99 ? "99+" : user.unreadCount}
                </div>
              )}

              {/* Unread indicator (mobile) */}
              {hasUnread && (
                <div className="lg:hidden absolute top-2 right-2 bg-red-500 rounded-full w-3 h-3"></div>
              )}

              {/* Online indicator (mobile) */}
              {isOnline && (
                <div className="lg:hidden absolute bottom-2 right-2">
                  <Check className="w-3 h-3 text-green-500" />
                </div>
              )}
            </button>
          );
        })}

        {/* Empty state */}
        {users.length === 0 && (
          <div className="text-center text-base-400 py-4">No contacts</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
