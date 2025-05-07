export default function CalendarLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded-md animate-pulse"></div>
          <div className="h-4 w-72 bg-[var(--background-tertiary)] rounded-md animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-[var(--background-tertiary)] rounded-md animate-pulse"></div>
          <div className="h-10 w-32 bg-[var(--background-tertiary)] rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Main content skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 w-36 bg-[var(--background-tertiary)] rounded-md animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-8 w-28 bg-[var(--background-tertiary)] rounded-md animate-pulse"></div>
                <div className="h-8 w-20 bg-[var(--background-tertiary)] rounded-md animate-pulse"></div>
              </div>
            </div>

            {/* Calendar grid skeleton */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-10 flex items-center justify-center">
                  <div className="h-4 w-8 bg-[var(--background-tertiary)] rounded-md animate-pulse"></div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {[...Array(42)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 p-1 rounded-lg border border-[var(--border)] animate-pulse opacity-70"
                  style={{ animationDelay: `${i * 0.02}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar skeletons */}
        <div className="space-y-6">
          {/* Upcoming tasks skeleton */}
          <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
            <div className="h-6 w-36 bg-[var(--background-tertiary)] rounded-md animate-pulse mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-[var(--background-tertiary)] rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Project progress skeleton */}
          <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
            <div className="h-6 w-48 bg-[var(--background-tertiary)] rounded-md animate-pulse mb-4"></div>
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-5 w-32 bg-[var(--background-tertiary)] rounded-md animate-pulse"></div>
                    <div className="h-5 w-12 bg-[var(--background-tertiary)] rounded-md animate-pulse"></div>
                  </div>
                  <div className="h-3 w-full bg-[var(--background-tertiary)] rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
