import React from 'react';

export function StandingsPreviewSkeleton({ layout = 'card' }: { layout?: 'card' | 'plain' }) {
  return (
    <div className="mb-12 animate-pulse">
      {layout === 'plain' && (
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-36 bg-gray-200 rounded"></div>
        </div>
      )}
      
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {layout === 'card' && (
          <div className="bg-brand-dark px-6 py-4 flex justify-between items-center">
            <div className="h-6 w-44 bg-white/10 rounded"></div>
            <div className="h-8 w-28 bg-white/10 rounded"></div>
          </div>
        )}
        
        {/* Table placeholder */}
        <div className="p-4 space-y-3">
          <div className="h-8 w-full bg-gray-200 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 py-2 border-b border-gray-50 last:border-0">
              <div className="h-4 w-6 bg-gray-200 rounded"></div>
              <div className="h-4 w-28 bg-gray-200 rounded"></div>
              <div className="h-4 w-8 bg-gray-200 rounded"></div>
              <div className="h-4 w-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex justify-center">
          <div className="h-10 w-44 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
