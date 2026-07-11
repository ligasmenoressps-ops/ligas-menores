import React from 'react';

export function HeroSkeleton() {
  return (
    <div className="bg-brand-dark pt-8 pb-32 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-10 w-48 bg-white/10 rounded mb-2"></div>
          <div className="h-6 w-96 bg-white/10 rounded"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card (col-span-2) */}
          <div className="lg:col-span-2 h-[350px] bg-white/5 rounded-2xl border border-white/10"></div>
          {/* Side Card */}
          <div className="h-[350px] bg-white/5 rounded-2xl border border-white/10"></div>
        </div>
      </div>
    </div>
  );
}
