import { prisma } from '@/lib/prisma';
import { RecentResultsTabs, MatchPreview } from './RecentResultsTabs';

export async function RecentResultsSection() {
  const playedMatches = await prisma.match.findMany({
    where: { status: 'PLAYED' },
    orderBy: { time: 'desc' },
    take: 50, // Get enough to populate the tabs
    include: {
      homeTeam: true,
      awayTeam: true,
      matchday: {
        include: {
          tournament: {
            include: { category: true }
          }
        }
      }
    }
  });

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  
  const resultsByCategory: Record<string, MatchPreview[]> = {};
  categories.forEach(cat => {
    resultsByCategory[cat.name] = [];
  });

  playedMatches.forEach(match => {
    const catName = match.matchday.tournament.category.name;
    if (resultsByCategory[catName] && resultsByCategory[catName].length < 7) {
      resultsByCategory[catName].push({
        id: match.id,
        homeTeamName: match.homeTeam.name,
        awayTeamName: match.awayTeam.name,
        homeGoals: match.homeGoals,
        awayGoals: match.awayGoals,
        time: match.time,
        date: match.matchday.date,
        categoryName: catName
      });
    }
  });

  return (
    <section className="mb-12">
      <RecentResultsTabs resultsByCategory={resultsByCategory} />
    </section>
  );
}
