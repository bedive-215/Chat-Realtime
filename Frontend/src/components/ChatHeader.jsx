import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null; // Không render nếu chưa chọn user

  const isOnline = onlineUsers.includes(selectedUser.id);

  return (
    <header className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full overflow-hidden">
              <img
                src={selectedUser.profile_avatar || "/avatar.png"}
                alt={selectedUser.fullName}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className={`text-sm ${isOnline ? "text-green-500" : "text-gray-400"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Right: Close */}
        <button
          onClick={() => setSelectedUser(null)}
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
