import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCategories } from '@/lib/data/categories';
import { CategoryTabs } from '@/components/public/CategoryTabs';
import { MatchHeroCard, MatchHeroData, CategoryStatsData } from '@/components/public/MatchHeroCard';
import { RecentResultsGrid } from '@/components/public/RecentResultsGrid';
import { MatchSummary } from '@/lib/types';
import { StandingsPreview } from '@/components/public/StandingsPreview';
import { calcularTabla } from '@/lib/standings';

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

  // Fetch all categories for the tab navigation and find active tournament for this category in parallel
  const [allCategories, tournament] = await Promise.all([
    getCategories(),
    prisma.tournament.findFirst({
      where: { categoryId: category.id },
      orderBy: { createdAt: 'desc' },
      include: {
        teams: {
          include: { team: true }
        },
        matchdays: {
          include: {
            matches: {
              include: {
                homeTeam: true,
                awayTeam: true,
                venue: true
              }
            }
          },
          orderBy: { number: 'asc' }
        }
      }
    })
  ]);

  let heroMatch: MatchHeroData | null = null;
  let recentMatches: MatchSummary[] = [];
  let standings: import('@/lib/standings').StandingsRow[] = [];
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
    
    recentMatches = playedMatches.slice(0, 6).map(m => ({
      id: m.id,
      homeTeam: { name: m.homeTeam.name, logoUrl: m.homeTeam.logoUrl },
      awayTeam: { name: m.awayTeam.name, logoUrl: m.awayTeam.logoUrl },
      homeGoals: m.homeGoals,
      awayGoals: m.awayGoals,
      date: m.date,
      venueName: m.venue?.name || null,
      matchdayNumber: m.matchdayNumber
    }));

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

    standings = calcularTabla(matchesInput, teamsInput);
    
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

  return (
    <div>
      <CategoryTabs 
        currentCategorySlug={slug} 
        currentCategoryName={categoryName} 
        activeTournamentId={tournament?.id || null}
        categories={allCategories}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <MatchHeroCard match={heroMatch} stats={stats} />
        
        {recentMatches.length > 0 && (
          <RecentResultsGrid matches={recentMatches} categorySlug={slug} tournamentId={tournament?.id || ''} />
        )}
        
        {standings.length > 0 && (
          <StandingsPreview standings={standings} categorySlug={slug} tournamentId={tournament?.id || ''} />
        )}
      </div>
    </div>
  );
}
