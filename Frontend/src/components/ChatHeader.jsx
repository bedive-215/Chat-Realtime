import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, leaveCurrentChat } = useChatStore();
  const { onlineUsers } = useAuthStore();
  
  if (!selectedUser) return null;

  const onlineUsersArray = Array.isArray(onlineUsers) 
    ? onlineUsers 
    : Object.values(onlineUsers || {});
  
  const isOnline = onlineUsersArray.includes(selectedUser.id.toString()) || 
                  onlineUsersArray.includes(selectedUser.id) ||
                  onlineUsersArray.includes(String(selectedUser.id));

  return (
    <header className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-3">
          <div className="avatar relative">
            <div className="size-10 rounded-full overflow-hidden">
              <img
                src={selectedUser.profile_avatar || "/avatar.png"}
                alt={selectedUser.fullName}
                className="object-cover w-full h-full"
              />
            </div>
            {/* Online indicator dot */}
            {isOnline && (
              <span className="absolute bottom-0 right-0 size-3 bg-green-400 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className={`text-sm ${isOnline ? "text-green-400" : "text-gray-400"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        
        {/* Right: Close */}
        <button
          onClick={() => leaveCurrentChat()}
          className="p-1 rounded-full hover:bg-base-200 transition"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;