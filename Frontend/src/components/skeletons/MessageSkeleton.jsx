const MessageSkeleton = () => {
    const skeletonMessages = Array(6).fill(null).map((_, idx) => ({
        id: idx,
        isOwnMessage: idx % 2 === 1,
        messageWidth: 150 + (idx % 4) * 60,
        hasLongMessage: idx === 2 || idx === 4,
        delay: idx * 150
    }));

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {skeletonMessages.map((message) => (
                <div 
                    key={message.id} 
                    className={`chat ${message.isOwnMessage ? "chat-end" : "chat-start"}`}
                    style={{ animationDelay: `${message.delay}ms` }}
                >
                    {/* Avatar */}
                    <div className="chat-image avatar">
                        <div className="size-10 rounded-full">
                            <div className="skeleton w-full h-full rounded-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
                        </div>
                    </div>
                    
                    {/* Header with name and timestamp */}
                    <div className="chat-header mb-2 flex items-center gap-2">
                        <div className="skeleton h-4 w-20 rounded-md animate-pulse" />
                        <div className="skeleton h-3 w-12 rounded-md animate-pulse" />
                    </div>
                    
                    {/* Message bubble */}
                    <div className="chat-bubble bg-transparent p-0 max-w-xs">
                        <div className={`space-y-2 ${message.isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
                            {/* Main message line */}
                            <div 
                                className="skeleton h-4 rounded-md animate-pulse"
                                style={{ 
                                    width: `${message.messageWidth}px`,
                                    animationDelay: `${message.delay + 100}ms`
                                }}
                            />
                            
                            {/* Additional lines for longer messages */}
                            {message.hasLongMessage && (
                                <>
                                    <div 
                                        className="skeleton h-4 rounded-md animate-pulse"
                                        style={{ 
                                            width: `${message.messageWidth - 30}px`,
                                            animationDelay: `${message.delay + 200}ms`
                                        }}
                                    />
                                    <div 
                                        className="skeleton h-4 w-24 rounded-md animate-pulse"
                                        style={{ animationDelay: `${message.delay + 300}ms` }}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Message status for own messages */}
                    {message.isOwnMessage && (
                        <div className="chat-footer opacity-50 mt-1">
                            <div className="skeleton h-3 w-8 rounded-sm animate-pulse" />
                        </div>
                    )}
                </div>
            ))}
            
            {/* Typing indicator */}
            <div className="chat chat-start">
                <div className="chat-image avatar">
                    <div className="size-10 rounded-full">
                        <div className="skeleton w-full h-full rounded-full animate-pulse" />
                    </div>
                </div>
                <div className="chat-bubble bg-base-200 flex items-center space-x-1 py-3 px-4">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageSkeleton;