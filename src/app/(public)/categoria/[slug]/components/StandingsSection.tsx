import React from 'react';
import { StandingsPreview } from '@/components/public/StandingsPreview';
import { getActiveTournament } from '@/lib/data/tournaments';
import { calcularTabla } from '@/lib/standings';

export async function StandingsSection({ slug, categoryId }: { slug: string; categoryId: string }) {
  const tournament = await getActiveTournament(categoryId);

  if (!tournament) return null;

  const allMatches = tournament.matchdays.flatMap(md => 
    md.matches.map(m => ({ ...m, matchdayNumber: md.number, date: m.time || md.date }))
  );

  // Recent results (PLAYED), sorted by date desc
  const playedMatches = allMatches
    .filter(m => m.status === 'PLAYED')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calcular tabla
  const teamsInput = tournament.teams.map(tt => tt.team);
  const matchesInput = playedMatches.map(m => ({
    homeTeamId: m.homeTeamId,
    awayTeamId: m.awayTeamId,
    homeGoals: m.homeGoals,
    awayGoals: m.awayGoals,
    status: m.status
  }));

  const standings = calcularTabla(matchesInput, teamsInput);

  if (standings.length === 0) return null;

  return (
    <StandingsPreview standings={standings} categorySlug={slug} tournamentId={tournament.id} />
  );
}
