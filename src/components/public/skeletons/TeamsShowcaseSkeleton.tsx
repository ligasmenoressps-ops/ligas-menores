import React from 'react';

export function TeamsShowcaseSkeleton() {
  return (
    <div className="mt-20 mb-8 animate-pulse">
      <div className="text-center mb-10 flex flex-col items-center">
        <div className="h-8 w-56 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-80 bg-gray-200 rounded"></div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-8 items-center justify-items-center">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full"></div>
            <div className="h-3 w-16 bg-gray-200 rounded mt-3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
