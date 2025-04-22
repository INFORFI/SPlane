export default function KanbanLoading() {
    return (
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-zinc-800 rounded-md animate-pulse"></div>
            <div className="h-4 w-96 bg-zinc-800 rounded-md animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-zinc-800 rounded-md animate-pulse"></div>
            <div className="h-10 w-32 bg-zinc-800 rounded-md animate-pulse"></div>
          </div>
        </div>
        
        {/* Kanban board skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, colIndex) => (
            <div key={colIndex} className="flex flex-col h-full">
              {/* Column header skeleton */}
              <div className="flex items-center justify-between mb-3">
                <div className="h-6 w-24 bg-zinc-800 rounded-md animate-pulse"></div>
                <div className="h-6 w-6 bg-zinc-800 rounded-full animate-pulse"></div>
              </div>
              
              {/* Column content skeleton */}
              <div className="flex-1 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 min-h-[500px]">
                <div className="space-y-3">
                  {[...Array(colIndex === 0 ? 5 : colIndex === 1 ? 3 : colIndex === 2 ? 2 : 1)].map((_, taskIndex) => (
                    <div 
                      key={taskIndex} 
                      className="p-3 bg-zinc-800 rounded-lg animate-pulse h-24"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }