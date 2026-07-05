import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcularTabla, Team, Match } from '@/lib/standings'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            team: true
          }
        },
        matchdays: {
          include: {
            matches: true
          }
        }
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Map Prisma models to the types expected by our pure function
    const mappedTeams: Team[] = tournament.teams.map(tt => ({
      id: tt.teamId,
      name: tt.team.name,
      logoUrl: tt.team.logoUrl,
    }))

    const mappedMatches: Match[] = tournament.matchdays.flatMap(md =>
      md.matches.map(m => ({
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        homeGoals: m.homeGoals,
        awayGoals: m.awayGoals,
        status: m.status,
      }))
    )

    const standings = calcularTabla(mappedMatches, mappedTeams)

    return NextResponse.json(standings)
  } catch (error) {
    console.error('Error calculating standings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
