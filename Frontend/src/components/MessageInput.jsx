import { useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const { authUser } = useAuthStore();
  const { selectedUser, sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;
    
    if (!selectedUser?.chatId) {
      toast.error("Please select a chat");
      return;
    }

    try {
      await sendMessage({
        chatId: selectedUser.chatId,
        receiverId: selectedUser.id,
        text: text.trim(),
        file: selectedFile,
      });
    
      setText("");
      setImagePreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="p-3 w-full border-t border-base-300">
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-md border border-zinc-700"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-200
                         flex items-center justify-center hover:bg-base-300"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageChange}
          />
          <button
            type="button"
            className="hidden sm:flex btn btn-circle"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} className={selectedFile ? "text-emerald-500" : "text-zinc-400"} />
          </button>
        </div>
        <button
          type="submit"
          disabled={!text.trim() && !selectedFile}
          className={`btn btn-sm btn-circle ${
            text.trim() || selectedFile ? "btn-primary" : "btn-disabled"
          }`}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;