import { prisma } from '@/lib/prisma';
import { calcularTabla, StandingsRow } from '@/lib/standings';
import { StandingsPreviewTabs } from './StandingsPreviewTabs';

export async function StandingsPreviewSection() {
  const categories = await prisma.category.findMany({
    include: {
      tournaments: {
        include: {
          teams: { include: { team: true } },
          matchdays: { include: { matches: true } }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  const standingsByCategory: Record<string, {
    categoryId: string;
    categoryName: string;
    tournamentId: string;
    standings: StandingsRow[];
  }> = {};

  categories.forEach(cat => {
    if (cat.tournaments.length === 0) return;

    // Pick tournament with most matches (or just the first one)
    const activeTournament = cat.tournaments.sort((a, b) => {
      const aMatches = a.matchdays.reduce((acc, md) => acc + md.matches.length, 0);
      const bMatches = b.matchdays.reduce((acc, md) => acc + md.matches.length, 0);
      return bMatches - aMatches;
    })[0];

    const allMatches = activeTournament.matchdays.flatMap(md => md.matches);
    const teams = activeTournament.teams.map(tt => tt.team);
    
    const mappedMatches = allMatches.map(m => ({
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      homeGoals: m.homeGoals,
      awayGoals: m.awayGoals,
      status: m.status
    }));

    const standings = calcularTabla(mappedMatches, teams);

    standingsByCategory[cat.name] = {
      categoryId: cat.id,
      categoryName: cat.name,
      tournamentId: activeTournament.id,
      standings: standings.slice(0, 5) // Top 5
    };
  });

  return (
    <StandingsPreviewSectionWrapper>
      <StandingsPreviewTabs standingsByCategory={standingsByCategory} />
    </StandingsPreviewSectionWrapper>
  );
}

function StandingsPreviewSectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <section>
      {children}
    </section>
  );
}
