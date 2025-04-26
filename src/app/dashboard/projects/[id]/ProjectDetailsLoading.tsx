export default function ProjectDetailsLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-zinc-800 rounded-md animate-pulse"></div>
          <div className="h-4 w-96 bg-zinc-800 rounded-md animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-zinc-800 rounded-md animate-pulse"></div>
          <div className="h-10 w-24 bg-zinc-800 rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info panel skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl h-96 animate-pulse"></div>
        </div>

        {/* Tasks panel skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="h-6 w-32 bg-zinc-800 rounded-md animate-pulse"></div>
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-20 w-full bg-zinc-800 rounded-md animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
