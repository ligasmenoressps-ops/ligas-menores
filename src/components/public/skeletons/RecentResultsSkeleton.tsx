import React from 'react';

export function RecentResultsSkeleton({ layout = 'tabs' }: { layout?: 'tabs' | 'grid' }) {
  if (layout === 'grid') {
    return (
      <div className="mb-12 animate-pulse">
        {/* Title */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-44 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default 'tabs' layout for homepage
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-brand-dark px-6 py-4 border-b border-gray-800">
        <div className="h-6 w-40 bg-white/10 rounded"></div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-100 p-3 gap-4">
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
      </div>

      {/* List */}
      <div className="p-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="flex-1 flex justify-center items-center gap-4">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-5 bg-gray-200 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
