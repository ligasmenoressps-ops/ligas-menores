import React from 'react';
import { RecentResultsGrid } from '@/components/public/RecentResultsGrid';
import { getActiveTournament } from '@/lib/data/tournaments';
import { MatchSummary } from '@/lib/types';

export async function RecentResultsSection({ slug, categoryId }: { slug: string; categoryId: string }) {
  const tournament = await getActiveTournament(categoryId);

  if (!tournament) return null;

  const allMatches = tournament.matchdays.flatMap(md => 
    md.matches.map(m => ({ ...m, matchdayNumber: md.number, date: m.time || md.date }))
  );

  // Recent results (PLAYED), sorted by date desc
  const playedMatches = allMatches
    .filter(m => m.status === 'PLAYED')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const recentMatches: MatchSummary[] = playedMatches.slice(0, 6).map(m => ({
    id: m.id,
    homeTeam: { name: m.homeTeam.name, logoUrl: m.homeTeam.logoUrl },
    awayTeam: { name: m.awayTeam.name, logoUrl: m.awayTeam.logoUrl },
    homeGoals: m.homeGoals,
    awayGoals: m.awayGoals,
    date: m.date,
    venueName: m.venue?.name || null,
    matchdayNumber: m.matchdayNumber
  }));

  if (recentMatches.length === 0) return null;

  return (
    <RecentResultsGrid matches={recentMatches} categorySlug={slug} tournamentId={tournament.id} />
  );
}
