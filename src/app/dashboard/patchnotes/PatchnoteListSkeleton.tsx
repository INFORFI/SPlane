export default function PatchnoteListSkeleton() {
    return (
      <div className="space-y-6">
        {/* Search and filters skeleton */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="h-10 w-full bg-zinc-800 rounded-lg animate-pulse"></div>
            <div className="h-10 w-full md:w-40 bg-zinc-800 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        {/* Two month groups with notes */}
        {Array.from({ length: 2 }).map((_, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            {/* Month header */}
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-zinc-800 rounded-full animate-pulse"></div>
              <div className="h-7 w-36 bg-zinc-800 rounded-md animate-pulse"></div>
            </div>
            
            {/* Notes grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: groupIndex === 0 ? 3 : 2 }).map((_, noteIndex) => (
                <div 
                  key={noteIndex}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
                  style={{ animationDelay: `${(groupIndex * 3 + noteIndex) * 0.1}s` }}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-zinc-800 animate-pulse"></div>
                        <div>
                          <div className="h-5 w-32 bg-zinc-800 rounded-md animate-pulse mb-2"></div>
                          <div className="h-4 w-24 bg-zinc-800 rounded-md animate-pulse"></div>
                        </div>
                      </div>
                      
                      <div className="h-6 w-16 bg-zinc-800 rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* Description */}
                    <div className="h-4 w-full bg-zinc-800 rounded-md animate-pulse mb-2"></div>
                    <div className="h-4 w-2/3 bg-zinc-800 rounded-md animate-pulse mb-4"></div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-6 w-10 bg-zinc-800 rounded-md animate-pulse"></div>
                        ))}
                      </div>
                      
                      <div className="h-5 w-28 bg-zinc-800 rounded-md animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }