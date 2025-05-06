export default function TeamLoading() {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded-md animate-pulse"></div>
            <div className="h-4 w-64 bg-[var(--background-tertiary)] rounded-md mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 w-36 bg-[var(--background-tertiary)] rounded-md animate-pulse"></div>
        </div>
  
        {/* Search and filter skeleton */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2 h-10 bg-[var(--background-tertiary)] rounded-lg animate-pulse"></div>
          <div className="w-full md:w-1/4 h-10 bg-[var(--background-tertiary)] rounded-lg animate-pulse"></div>
        </div>
  
        {/* Team members grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl h-40 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }