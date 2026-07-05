import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { calcularTabla } from '@/lib/standings'
import StandingsTable from '@/components/StandingsTable'
import { StandingsExport } from '@/components/StandingsExport'
import Link from 'next/link'
import TournamentBracketViewer from '@/components/TournamentBracketViewer'

export default async function AdminStandingsPage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    redirect('/login')
  }

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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            &larr; Volver al Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Tabla de Posiciones: {tournament.name}
          </h1>
          {qualifiersToNextPhase > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-sm mr-2"></span>
              Los primeros {qualifiersToNextPhase} equipos avanzan a la fase eliminatoria.
            </p>
          )}
        </div>
        
        <div className="mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 flex-shrink-0">
          <StandingsExport standings={standings} tournamentName={tournament.name} />
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <StandingsTable standings={standings} qualifiedCount={qualifiersToNextPhase} />
      </div>

      <TournamentBracketViewer knockoutMatches={knockoutMatches} />
    </div>
  )
}
