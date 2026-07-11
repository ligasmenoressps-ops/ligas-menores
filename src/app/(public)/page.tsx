import React, { Suspense } from 'react';
import { PublicHero } from '@/components/public/PublicHero';
import { RecentResultsSection } from '@/components/public/RecentResultsSection';
import { StandingsPreviewSection } from '@/components/public/StandingsPreviewSection';
import { TeamsShowcaseSection } from '@/components/public/TeamsShowcaseSection';

import { HeroSkeleton } from '@/components/public/skeletons/HeroSkeleton';
import { RecentResultsSkeleton } from '@/components/public/skeletons/RecentResultsSkeleton';
import { StandingsPreviewSkeleton } from '@/components/public/skeletons/StandingsPreviewSkeleton';
import { TeamsShowcaseSkeleton } from '@/components/public/skeletons/TeamsShowcaseSkeleton';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Suspense fallback={<HeroSkeleton />}>
        <PublicHero />
      </Suspense>
      <main className="-mt-16 sm:-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-20 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Suspense fallback={<RecentResultsSkeleton layout="tabs" />}>
              <RecentResultsSection />
            </Suspense>
          </div>
          <div className="lg:col-span-1">
            <Suspense fallback={<StandingsPreviewSkeleton layout="card" />}>
              <StandingsPreviewSection />
            </Suspense>
          </div>
        </div>
        
        <Suspense fallback={<TeamsShowcaseSkeleton />}>
          <TeamsShowcaseSection />
        </Suspense>
      </main>
    </div>
  );
}
