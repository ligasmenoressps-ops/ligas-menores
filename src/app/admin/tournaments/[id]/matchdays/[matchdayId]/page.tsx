import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MatchForm } from '../MatchForm'
import { MatchEditRow } from '../MatchEditRow'

export default async function MatchdayDetailPage(props: { params: Promise<{ id: string, matchdayId: string }> }) {
  const params = await props.params
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const matchday = await prisma.matchday.findUnique({
    where: { id: params.matchdayId },
    include: {
      matches: {
        include: {
          homeTeam: true,
          awayTeam: true,
          venue: true,
          delegate: true
        },
        orderBy: { time: 'asc' }
      }
    }
  })

  if (!matchday) return <div>Jornada no encontrada</div>

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      teams: { include: { team: true }, orderBy: { team: { name: 'asc' } } }
    }
  })

  const venues = await prisma.venue.findMany({ orderBy: { name: 'asc' } })
  const delegates = await prisma.user.findMany({ where: { role: 'DELEGATE' }, orderBy: { name: 'asc' } })

  const teamOptions = tournament?.teams.map(t => ({ id: t.teamId, name: t.team.name })) || []
  const venueOptions = venues.map(v => ({ id: v.id, name: v.name }))
  const delegateOptions = delegates.map(d => ({ id: d.id, name: d.name }))

  // Calculate resting teams
  const teamsPlayingIds = new Set(
    matchday.matches.flatMap(m => [m.homeTeamId, m.awayTeamId])
  )
  const restingTeams = teamOptions.filter(t => !teamsPlayingIds.has(t.id))

  // Fetch all matches for this tournament to find multi-leg ties properly
  const allTournamentKnockoutMatches = await prisma.match.findMany({
    where: {
      matchday: { tournamentId: params.id },
      phase: { not: 'GROUP_STAGE' }
    },
    orderBy: [
      { time: 'asc' },
      { createdAt: 'asc' }
    ]
  })

  const isKnockout = matchday.matches.some(m => m.phase !== 'GROUP_STAGE')
  const phaseName = isKnockout ? matchday.matches.find(m => m.phase !== 'GROUP_STAGE')?.phase : null
  const displayTitle = isKnockout && phaseName ? phaseName : `Jornada ${matchday.number}`

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center space-x-4 mb-4">
        <Link href={`/admin/tournaments/${params.id}/matchdays`} className="text-gray-500 hover:text-gray-700">
          &larr; Volver a Jornadas
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {displayTitle} <span className="text-gray-500 text-xl font-normal">| {tournament?.name}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Fecha: {new Date(matchday.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <MatchForm 
        tournamentId={params.id} 
        matchdayId={matchday.id} 
        teams={teamOptions} 
        venues={venueOptions} 
        delegates={delegateOptions}
      />

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200 mt-8">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Partidos Programados</h3>
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {matchday.matches.map((match) => {
            let aggregateInfo = null;
            let isFinalLeg = false;

            if (match.phase !== 'GROUP_STAGE') {
               // Calculate aggregate by looking at all matches between these two in the same phase across the tournament
               const legMatches = allTournamentKnockoutMatches.filter(m => 
                 m.phase === match.phase && 
                 ((m.homeTeamId === match.homeTeamId && m.awayTeamId === match.awayTeamId) || 
                  (m.homeTeamId === match.awayTeamId && m.awayTeamId === match.homeTeamId))
               )
               
               if (legMatches.length > 0 && legMatches[legMatches.length - 1].id === match.id) {
                 isFinalLeg = true;
               }

               const allPlayed = legMatches.every(m => m.status === 'PLAYED')
               if (allPlayed && legMatches.length > 0 && isFinalLeg) {
                 let homeBaseGoals = 0
                 let awayBaseGoals = 0
                 let homeBasePenalties = 0
                 let awayBasePenalties = 0
                 
                 legMatches.forEach(m => {
                   if (m.homeTeamId === match.homeTeamId) {
                     homeBaseGoals += m.homeGoals || 0
                     awayBaseGoals += m.awayGoals || 0
                     homeBasePenalties += m.homePenalties || 0
                     awayBasePenalties += m.awayPenalties || 0
                   } else {
                     homeBaseGoals += m.awayGoals || 0
                     awayBaseGoals += m.homeGoals || 0
                     homeBasePenalties += m.awayPenalties || 0
                     awayBasePenalties += m.homePenalties || 0
                   }
                 })
                 
                 let advancingTeam = null
                 if (homeBaseGoals > awayBaseGoals) advancingTeam = match.homeTeam.name
                 else if (awayBaseGoals > homeBaseGoals) advancingTeam = match.awayTeam.name
                 else if (homeBasePenalties > awayBasePenalties) advancingTeam = match.homeTeam.name
                 else if (awayBasePenalties > homeBasePenalties) advancingTeam = match.awayTeam.name
                 
                 aggregateInfo = {
                   score: `${homeBaseGoals} - ${awayBaseGoals}`,
                   penalties: homeBasePenalties > 0 || awayBasePenalties > 0 ? `(${homeBasePenalties}-${awayBasePenalties} pen)` : null,
                   advancingTeam
                 }
               }
            }

            return (
              <li key={match.id} className="relative">
                <MatchEditRow 
                  match={match} 
                  tournamentId={params.id} 
                  matchdayId={matchday.id} 
                  teams={teamOptions} 
                  venues={venueOptions}
                  delegates={delegateOptions}
                  isFinalLeg={isFinalLeg}
                />
                {aggregateInfo && (
                  <div className="bg-green-50 px-4 py-2 border-t border-green-100 flex items-center justify-center space-x-2 text-sm">
                    <span className="text-gray-600">
                      Global: <strong>{aggregateInfo.score}</strong> {aggregateInfo.penalties && <span className="text-orange-600 font-semibold">{aggregateInfo.penalties}</span>}
                    </span>
                    <span className="text-gray-400">|</span>
                    {aggregateInfo.advancingTeam ? (
                      <span className="text-green-700 font-bold">
                        {match.phase.toLowerCase() === 'final' || match.phase.toLowerCase() === 'finalísima' || match.phase.toLowerCase() === 'finalisima' ? '🏆 Equipo Campeón:' : '🎉 Avanza:'} {aggregateInfo.advancingTeam}
                      </span>
                    ) : (
                      <span className="text-orange-600 font-bold">⚠️ Global Empatado (Requiere penales)</span>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        {matchday.matches.length === 0 && (
          <div className="p-6 text-center text-gray-500">No hay partidos programados en esta jornada.</div>
        )}
        {restingTeams.length > 0 && (
          <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              🛌 Equipo Libre (Descansa): {restingTeams.map(t => t.name).join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
