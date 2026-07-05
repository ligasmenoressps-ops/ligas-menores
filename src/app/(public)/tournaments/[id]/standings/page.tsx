import { prisma } from '@/lib/prisma'
import { calcularTabla } from '@/lib/standings'
import StandingsTable from '@/components/StandingsTable'
import TournamentBracketViewer from '@/components/TournamentBracketViewer'

export default async function PublicStandingsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      matchdays: {
        include: {
          matches: {
            where: { status: 'PLAYED', phase: 'GROUP_STAGE' }
          }
        }
      },
      teams: {
        include: { team: true }
      },
      format: true
    }
  })

  if (!tournament) return <div>Torneo no encontrado</div>

  const allPlayedMatches = tournament.matchdays.flatMap(md => md.matches)
  const teamsData = tournament.teams.map(t => ({ 
    id: t.teamId, 
    name: t.team.name, 
    logoUrl: t.team.logoUrl 
  }))

  const standings = calcularTabla(allPlayedMatches, teamsData)

  const formatConfig = tournament.format.bracketConfig as any
  const qualifiersToNextPhase = formatConfig?.qualifiersToNextPhase || 0

  const knockoutMatches = await prisma.match.findMany({
    where: {
      matchday: { tournamentId: params.id },
      phase: { not: 'GROUP_STAGE' }
    },
    include: {
      homeTeam: true,
      awayTeam: true
    },
    orderBy: { time: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Tabla de Posiciones</h3>
      </div>
      {qualifiersToNextPhase > 0 && (
        <p className="text-sm text-gray-500">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-sm mr-2"></span>
          Los primeros {qualifiersToNextPhase} equipos avanzan a la fase eliminatoria.
        </p>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <StandingsTable standings={standings} qualifiedCount={qualifiersToNextPhase} />
      </div>

      <TournamentBracketViewer knockoutMatches={knockoutMatches} />
    </div>
  )
}
