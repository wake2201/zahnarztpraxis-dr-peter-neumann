import { Heart } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Skeleton Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="h-5 w-36 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse mt-1" />
            </div>
          </div>
          <div className="h-10 w-28 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </header>

      {/* Skeleton Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-card border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl animate-pulse" />
                <div>
                  <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                  <div className="h-7 w-10 bg-slate-200 rounded animate-pulse mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
