export default function PatchnoteDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button and header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-40 bg-zinc-800 rounded-md animate-pulse"></div>
        <div className="h-8 w-24 bg-zinc-800 rounded-md animate-pulse"></div>
      </div>

      {/* Main header skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center mb-8">
        <div className="flex flex-col items-center">
          {/* Emoji placeholder */}
          <div className="mb-4 w-16 h-16 rounded-full bg-zinc-800 animate-pulse"></div>

          {/* Title placeholder */}
          <div className="h-10 w-64 mx-auto bg-zinc-800 rounded-md animate-pulse mb-3"></div>

          {/* Badges placeholder */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <div className="h-6 w-20 bg-zinc-800 rounded-full animate-pulse"></div>
            <div className="h-6 w-32 bg-zinc-800 rounded-full animate-pulse"></div>
            <div className="h-6 w-24 bg-zinc-800 rounded-full animate-pulse"></div>
          </div>

          {/* Description placeholder */}
          <div className="h-6 w-3/4 mx-auto bg-zinc-800 rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Sections skeleton */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6"
        >
          {/* Section header skeleton */}
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-md animate-pulse"></div>
              <div>
                <div className="h-6 w-36 bg-zinc-800 rounded-md animate-pulse"></div>
                <div className="h-4 w-20 mt-2 bg-zinc-800 rounded-md animate-pulse"></div>
              </div>
            </div>

            <div className="w-8 h-8 bg-zinc-800 rounded-md animate-pulse"></div>
          </div>

          {/* Section content skeleton */}
          <div className="border-t border-zinc-800 divide-y divide-zinc-800">
            {Array.from({ length: index + 2 }).map((_, itemIndex) => (
              <div key={itemIndex} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-6 w-full bg-zinc-800 rounded-md animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-zinc-800 rounded-md animate-pulse"></div>
                  </div>

                  <div className="h-8 w-20 bg-zinc-800 rounded-md animate-pulse self-start"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
