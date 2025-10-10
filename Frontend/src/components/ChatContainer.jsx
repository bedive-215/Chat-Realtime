import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser } = useChatStore();
  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);
  const messageListRef = useRef(null);
  const [isFetchingOld, setIsFetchingOld] = useState(false);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedUser?.chatId) {
      getMessages(selectedUser.chatId);
    }
  }, [selectedUser?.chatId, getMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleScroll = async () => {
    if (!messageListRef.current || isFetchingOld) return;

    if (messageListRef.current.scrollTop === 0 && messages.length > 0) {
      setIsFetchingOld(true);

      const oldestMessage = messages[0];
      const prevHeight = messageListRef.current.scrollHeight;

      await getMessages(selectedUser.chatId, { before: oldestMessage.createdAt });

      const newHeight = messageListRef.current.scrollHeight;

      messageListRef.current.scrollTop = newHeight - prevHeight;

      setIsFetchingOld(false);
    }
  };

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
      <div
        ref={messageListRef}
        className="flex-1 p-3 pt-12 overflow-y-auto space-y-2 flex flex-col"
        onScroll={handleScroll}
      >
        {/* Loading spinner khi lấy tin nhắn cũ */}
        {isFetchingOld && (
          <div className="sticky top-0 z-10 flex justify-center py-2 bg-base-100">
            <span className="loading loading-spinner loading-sm text-gray-400" />
          </div>
        )}

        {messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.senderId === authUser.id;
            const hasText = msg.content || msg.text;
            const hasImage = msg.image;

            return (
              <div
                key={`${msg._id || msg.id}-${msg.createdAt}`}
                className={`max-w-xs break-words ${isMe ? "self-end" : "self-start"}`}
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
                    className={`p-2 rounded-lg text-sm ${isMe
                        ? "bg-primary text-primary-content" : "bg-base-200"
                      }`}
                  >
                    {hasText}
                  </div>
                )}

                {/* Thời gian tin nhắn - căn theo hướng tin nhắn */}
                <div className={`text-[10px] text-gray-400 mt-1 ${isMe ? "text-right pr-2" : "text-left pl-2"}`}>
                  {formatMessageTime(msg.createdAt)}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-sm text-gray-400">No messages yet</p>
        )}

        {/* Anchor để scroll xuống cuối */}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;