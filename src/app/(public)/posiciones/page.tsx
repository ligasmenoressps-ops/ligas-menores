import { prisma } from '@/lib/prisma';
import { calcularTabla, StandingsRow } from '@/lib/standings';
import { StandingsPreviewTabs } from '@/components/public/StandingsPreviewTabs';

export default async function PosicionesPage() {
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
      standings: standings // Todas las posiciones, no usamos slice
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-brand-dark pt-12 pb-16 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Tabla de Posiciones</h1>
          <p className="mt-2 text-xl text-gray-400">Estadísticas y clasificación actual de todos los torneos activos.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <StandingsPreviewTabs standingsByCategory={standingsByCategory} compact={false} />
      </main>
    </div>
  );
}
