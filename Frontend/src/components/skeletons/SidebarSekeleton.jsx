import { Users, Search, MoreVertical } from "lucide-react";

const SidebarSkeleton = () => {
  // Create 8 skeleton contacts with varied properties
  const skeletonContacts = Array(8).fill(null).map((_, idx) => ({
    id: idx,
    nameWidth: 80 + (idx % 4) * 20, // Varied name lengths
    statusWidth: 40 + (idx % 3) * 15, // Varied status lengths
    hasOnlineStatus: idx % 3 === 0, // Some contacts appear "online"
    delay: idx * 80, // Staggered animation
    isActive: idx === 1, // One active contact
  }));

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 bg-base-50 flex flex-col transition-all duration-200 shadow-sm">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-4 lg:p-5 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <span className="font-semibold hidden lg:block text-gray-800">Contacts</span>
          </div>
          <div className="hidden lg:block">
            <div className="skeleton w-8 h-8 rounded-full animate-pulse" />
          </div>
        </div>
        
        {/* Search bar skeleton - only on desktop */}
        <div className="hidden lg:block mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <div className="skeleton h-10 w-full rounded-full pl-10" />
          </div>
        </div>
      </div>

      {/* Online count indicator */}
      <div className="hidden lg:block px-5 py-3 border-b border-base-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="skeleton h-3 w-20 animate-pulse" />
        </div>
      </div>

      {/* Skeleton Contacts */}
      <div className="overflow-y-auto w-full py-2 flex-1">
        {skeletonContacts.map((contact) => (
          <div
            key={contact.id}
            className={`w-full p-3 lg:p-4 flex items-center gap-3 hover:bg-base-100 transition-colors cursor-pointer relative
              ${contact.isActive ? 'bg-primary/10 border-r-2 border-primary' : ''}`}
            style={{ animationDelay: `${contact.delay}ms` }}
          >
            {/* Avatar skeleton */}
            <div className="relative mx-auto lg:mx-0 flex-shrink-0">
              <div className="skeleton size-12 rounded-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200">
                {/* Online status indicator */}
                {contact.hasOnlineStatus && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                )}
              </div>
            </div>

            {/* User info skeleton - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="skeleton h-4 rounded animate-pulse"
                  style={{ 
                    width: `${contact.nameWidth}px`,
                    animationDelay: `${contact.delay + 100}ms`
                  }}
                />
                <div className="skeleton h-3 w-8 rounded animate-pulse" />
              </div>
              
              <div className="flex items-center justify-between">
                <div 
                  className="skeleton h-3 rounded animate-pulse"
                  style={{ 
                    width: `${contact.statusWidth}px`,
                    animationDelay: `${contact.delay + 200}ms`
                  }}
                />
                {/* Unread messages indicator */}
                {contact.id % 4 === 0 && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <div className="skeleton w-2 h-2 rounded animate-pulse bg-white" />
                  </div>
                )}
              </div>
            </div>

            {/* More options - desktop only */}
            <div className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}

        {/* Loading more indicator */}
        <div className="px-4 py-3 text-center">
          <div className="skeleton h-6 w-24 mx-auto rounded animate-pulse" />
        </div>
      </div>

      {/* Footer with current user */}
      <div className="border-t border-base-300 p-3 lg:p-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative mx-auto lg:mx-0">
            <div className="skeleton size-10 rounded-full animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
          </div>
          <div className="hidden lg:block flex-1">
            <div className="skeleton h-3 w-20 mb-1 animate-pulse" />
            <div className="skeleton h-2 w-12 animate-pulse" />
          </div>
          <div className="hidden lg:block">
            <div className="skeleton w-6 h-6 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarSkeleton;