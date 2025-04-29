export default function TasksLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-zinc-800 rounded-md animate-pulse"></div>
          <div className="h-4 w-64 bg-zinc-800 rounded-md mt-2 animate-pulse"></div>
        </div>
        <div className="h-10 w-36 bg-zinc-800 rounded-md animate-pulse"></div>
      </div>

      {/* Filters skeleton */}
      <div className="h-12 bg-zinc-800 rounded-lg animate-pulse"></div>

      {/* Tasks list skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-20 bg-zinc-800 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}
