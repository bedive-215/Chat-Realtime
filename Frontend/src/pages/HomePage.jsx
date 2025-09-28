import { useChatStore } from "../store/useChatStore";

import ChatContainer from "../components/ChatContainer";
import NoChatSelcted from "../components/NoChatSelcted";
import Sidebar from "../components/Sidebar";

const HomePage = () => {
  const {selectedUser} = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-40">
        <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelcted /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage