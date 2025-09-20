import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, listenMessages } = useChatStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    if (selectedUser?.chatId) {
      getMessages(selectedUser.chatId);
    }
  }, [selectedUser?.chatId, getMessages]);

  useEffect(() => {
    listenMessages();
  }, [listenMessages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Select a chat to start messaging
      </div>
    );
  }

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      {/* Danh sách tin nhắn */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col">
        {messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.senderId === authUser.id;
            const hasText = msg.content || msg.text;
            const hasImage = msg.image;
            
            return (
              <div
                key={msg._id || msg.id}
                className={`max-w-xs break-words ${
                  isMe ? "self-end" : "self-start"
                }`}
              >
                {/* Nếu có ảnh */}
                {hasImage && (
                  <div className="mb-1">
                    <img
                      src={msg.image}
                      alt="chat-img"
                      className="rounded-lg max-w-[200px]"
                    />
                  </div>
                )}
                
                {/* Nếu có text */}
                {hasText && (
                  <div
                    className={`p-2 rounded-lg ${
                      isMe
                        ? "bg-blue-500 text-white"
                        : "bg-base-200"
                    }`}
                  >
                    {hasText}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-center text-sm text-gray-400">No messages yet</p>
        )}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;