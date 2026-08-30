export default function LoadingState({ stage }) {
  const steps = [
    "Fetching repository metadata...",
    "Scanning project structure...",
    "Preparing AI context...",
    "Generating AI insights...",
  ];
  
  const activeIndex = Math.min(stage, steps.length - 1);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Loading Status Card */}
      <div className="bg-card border border-gray-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-textPrimary mb-4 uppercase tracking-wider">Analysis Progress</h3>
        
        <div className="flex flex-col gap-3">
          {steps.map((text, i) => {
            const isActive = i === activeIndex;
            const isDone = i < activeIndex;
            
            return (
              <div 
                key={i} 
                className={`flex items-center gap-3 transition-all ${
                  isActive 
                    ? "opacity-100" 
                    : isDone 
                      ? "opacity-50" 
                      : "opacity-30"
                }`}
              >
                <div className="w-4 flex justify-center shrink-0">
                  {isDone ? (
                    <span className="text-success text-sm">✓</span>
                  ) : isActive ? (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">-</span>
                  )}
                </div>
                <span className={`text-sm ${isActive ? "text-textPrimary font-medium" : "text-textSecondary"}`}>
                  {text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skeletons for RepoStats */}
      <div className="bg-card border border-gray-800 rounded-xl p-5 shadow-sm flex items-center gap-4 animate-pulse">
        <div className="w-10 h-10 bg-gray-800 rounded-lg shrink-0"></div>
        <div className="flex-1">
          <div className="h-3 bg-gray-800 rounded w-16 mb-2"></div>
          <div className="h-5 bg-gray-800 rounded w-32"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 animate-pulse">
        <div className="bg-card border border-gray-800 rounded-xl p-4 shadow-sm">
          <div className="h-3 bg-gray-800 rounded w-12 mb-3"></div>
          <div className="h-6 bg-gray-800 rounded w-16"></div>
        </div>
        <div className="bg-card border border-gray-800 rounded-xl p-4 shadow-sm">
          <div className="h-3 bg-gray-800 rounded w-12 mb-3"></div>
          <div className="h-6 bg-gray-800 rounded w-16"></div>
        </div>
        <div className="bg-card border border-gray-800 rounded-xl p-4 shadow-sm">
          <div className="h-3 bg-gray-800 rounded w-12 mb-3"></div>
          <div className="h-6 bg-gray-800 rounded w-20"></div>
        </div>
        <div className="bg-card border border-gray-800 rounded-xl p-4 shadow-sm">
          <div className="h-3 bg-gray-800 rounded w-12 mb-3"></div>
          <div className="h-6 bg-gray-800 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}
