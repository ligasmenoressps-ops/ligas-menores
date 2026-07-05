import { PublicHero } from '@/components/public/PublicHero';
import { RecentResultsSection } from '@/components/public/RecentResultsSection';
import { StandingsPreviewSection } from '@/components/public/StandingsPreviewSection';
import { TeamsShowcaseSection } from '@/components/public/TeamsShowcaseSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHero />
      <main className="-mt-16 sm:-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-20 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentResultsSection />
          </div>
          <div className="lg:col-span-1">
            <StandingsPreviewSection />
          </div>
        </div>
        
        <TeamsShowcaseSection />
      </main>
    </div>
  )
}
