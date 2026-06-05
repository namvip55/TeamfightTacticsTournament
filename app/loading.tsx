import Sidebar from "./components/Sidebar";

export default function Loading() {
  return (
    <Sidebar session={null}>
      <div className="p-4 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full h-full">
        {/* Skeleton Header */}
        <div className="h-48 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse" />
        
        {/* Skeleton Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white/[0.02] border border-white/[0.05] animate-pulse" />
          ))}
        </div>

        {/* Skeleton Content Area */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="h-6 w-48 rounded bg-white/[0.03] animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-white/[0.02] border border-white/[0.05] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
