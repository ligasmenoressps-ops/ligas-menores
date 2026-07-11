import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCategories } from '@/lib/data/categories';
import { CategoryTabs } from '@/components/public/CategoryTabs';
import { MatchHeroSection } from './components/MatchHeroSection';
import { RecentResultsSection } from './components/RecentResultsSection';
import { StandingsSection } from './components/StandingsSection';

// skeletons
import { HeroSkeleton } from '@/components/public/skeletons/HeroSkeleton';
import { RecentResultsSkeleton } from '@/components/public/skeletons/RecentResultsSkeleton';
import { StandingsPreviewSkeleton } from '@/components/public/skeletons/StandingsPreviewSkeleton';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Find category (case insensitive slug to name match)
  const categoryName = slug.toUpperCase();
  const category = await prisma.category.findUnique({
    where: { name: categoryName }
  });

  if (!category) {
    notFound();
  }

  // Fetch all categories for the tab navigation and active tournament for active ID check in parallel
  const [allCategories, activeTournament] = await Promise.all([
    getCategories(),
    prisma.tournament.findFirst({
      where: { categoryId: category.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true }
    })
  ]);

  return (
    <div>
      <CategoryTabs 
        currentCategorySlug={slug} 
        currentCategoryName={categoryName} 
        activeTournamentId={activeTournament?.id || null}
        categories={allCategories}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={<HeroSkeleton />}>
          <MatchHeroSection slug={slug} categoryId={category.id} />
        </Suspense>
        
        <Suspense fallback={<RecentResultsSkeleton layout="grid" />}>
          <RecentResultsSection slug={slug} categoryId={category.id} />
        </Suspense>
        
        <Suspense fallback={<StandingsPreviewSkeleton layout="plain" />}>
          <StandingsSection slug={slug} categoryId={category.id} />
        </Suspense>
      </div>
    </div>
  );
}
