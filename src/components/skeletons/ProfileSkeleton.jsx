export default function ProfileSkeleton() {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 animate-pulse">
  
        {/* ACTION BAR */}
        <div className="flex justify-end mb-6">
          <div className="w-44 h-12 bg-gray-300 dark:bg-gray-700 rounded-xl" />
        </div>
  
        {/* PROFILE CARD */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center border border-gray-200 dark:border-gray-700">
  
          {/* Avatar */}
          <div className="w-36 h-36 rounded-full bg-gray-300 dark:bg-gray-700" />
  
          <div className="flex-1 space-y-4 w-full">
            <div className="h-7 w-48 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-5 w-64 bg-gray-300 dark:bg-gray-700 rounded" />
  
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"
                />
              ))}
            </div>
          </div>
        </div>
  
        {/* ITEMS */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }
  