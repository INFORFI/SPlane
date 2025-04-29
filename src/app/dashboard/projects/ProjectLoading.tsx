export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 bg-zinc-800 rounded-md animate-pulse"></div>
          <div className="h-4 w-64 bg-zinc-800 rounded-md mt-2 animate-pulse"></div>
        </div>
        <div className="h-10 w-36 bg-zinc-800 rounded-md animate-pulse"></div>
      </div>

      <div className="h-12 w-full bg-zinc-800 rounded-lg animate-pulse"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-zinc-900 border border-zinc-800 rounded-xl h-64 animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
}
