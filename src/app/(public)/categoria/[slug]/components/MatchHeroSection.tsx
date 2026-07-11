import React from 'react';
import { MatchHeroCard, MatchHeroData, CategoryStatsData } from '@/components/public/MatchHeroCard';
import { getActiveTournament } from '@/lib/data/tournaments';
import { calcularTabla } from '@/lib/standings';

export async function MatchHeroSection({ slug, categoryId }: { slug: string; categoryId: string }) {
  const tournament = await getActiveTournament(categoryId);

  let heroMatch: MatchHeroData | null = null;
  let stats: CategoryStatsData = {
    leader: null,
    matchdaysPlayed: 0,
    nextMatchdayName: null,
    categorySlug: slug,
    tournamentId: tournament?.id || ''
  };

  if (tournament) {
    // Collect all matches
    const allMatches = tournament.matchdays.flatMap(md => 
      md.matches.map(m => ({ ...m, matchdayNumber: md.number, date: m.time || md.date }))
    );

    // Recent results (PLAYED), sorted by date desc
    const playedMatches = allMatches
      .filter(m => m.status === 'PLAYED')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Next match (SCHEDULED), sorted by date asc
    const nextMatch = allMatches
      .filter(m => m.status === 'SCHEDULED' || m.status === 'POSTPONED')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    if (nextMatch) {
      heroMatch = {
        id: nextMatch.id,
        homeTeam: { name: nextMatch.homeTeam.name, logoUrl: nextMatch.homeTeam.logoUrl },
        awayTeam: { name: nextMatch.awayTeam.name, logoUrl: nextMatch.awayTeam.logoUrl },
        homeGoals: nextMatch.homeGoals,
        awayGoals: nextMatch.awayGoals,
        date: nextMatch.date,
        venueName: nextMatch.venue?.name || null,
        status: nextMatch.status as 'SCHEDULED' | 'POSTPONED',
        isNextMatch: true
      };
      
      stats.nextMatchdayName = `Jornada ${nextMatch.matchdayNumber}`;
    } else if (playedMatches.length > 0) {
      const lastMatch = playedMatches[0];
      heroMatch = {
        id: lastMatch.id,
        homeTeam: { name: lastMatch.homeTeam.name, logoUrl: lastMatch.homeTeam.logoUrl },
        awayTeam: { name: lastMatch.awayTeam.name, logoUrl: lastMatch.awayTeam.logoUrl },
        homeGoals: lastMatch.homeGoals,
        awayGoals: lastMatch.awayGoals,
        date: lastMatch.date,
        venueName: lastMatch.venue?.name || null,
        status: lastMatch.status as 'PLAYED',
        isNextMatch: false
      };
      stats.nextMatchdayName = 'Fase Finalizada';
    }

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
    
    if (standings.length > 0) {
      const leader = standings[0];
      stats.leader = {
        name: leader.teamName,
        logoUrl: leader.logoUrl || null
      };
    }
    
    // Calcular jornadas jugadas
    if (playedMatches.length > 0) {
      stats.matchdaysPlayed = Math.max(...playedMatches.map(m => m.matchdayNumber));
    }
  }

  return <MatchHeroCard match={heroMatch} stats={stats} />;
}
