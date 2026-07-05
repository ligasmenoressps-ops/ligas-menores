import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function TeamMatchesPage(props: { params: Promise<{ id: string, teamId: string }> }) {
  const params = await props.params
  const session = await getSession()
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/login')
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: { category: true }
  })

  const team = await prisma.team.findUnique({
    where: { id: params.teamId }
  })

  if (!tournament || !team) {
    return <div>Torneo o equipo no encontrado</div>
  }

  const matches = await prisma.match.findMany({
    where: {
      matchday: { tournamentId: params.id },
      OR: [
        { homeTeamId: params.teamId },
        { awayTeamId: params.teamId }
      ]
    },
    include: {
      matchday: true,
      homeTeam: true,
      awayTeam: true,
      venue: true
    },
    orderBy: {
      matchday: {
        number: 'asc'
      }
    }
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-4">
        <Link href={`/admin/tournaments/${params.id}/teams`} className="text-gray-500 hover:text-gray-700">
          &larr; Volver a Equipos Inscritos
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex items-center gap-4">
          {team.logoUrl ? (
            <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 relative">
              <Image src={team.logoUrl} alt={team.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-500 font-medium text-lg">{team.name.substring(0, 2).toUpperCase()}</span>
            </div>
          )}
          <div>
            <h3 className="text-xl leading-6 font-bold text-gray-900">
              Historial de Partidos: {team.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Torneo: {tournament.name} ({tournament.category.name})
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {matches.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">
                Este equipo no tiene partidos programados o jugados en este torneo aún.
              </li>
            ) : (
              matches.map((match) => {
                const isHome = match.homeTeamId === team.id
                const opponent = isHome ? match.awayTeam : match.homeTeam
                const homeScore = match.homeGoals !== null ? match.homeGoals : '-'
                const awayScore = match.awayGoals !== null ? match.awayGoals : '-'
                
                let resultClass = "bg-gray-100 text-gray-800"
                let resultText = "POR JUGAR"
                
                if (match.status === 'PLAYED' && match.homeGoals !== null && match.awayGoals !== null) {
                  if (match.homeGoals === match.awayGoals) {
                    resultClass = "bg-yellow-100 text-yellow-800"
                    resultText = "EMPATE"
                  } else if ((isHome && match.homeGoals > match.awayGoals) || (!isHome && match.awayGoals > match.homeGoals)) {
                    resultClass = "bg-green-100 text-green-800"
                    resultText = "VICTORIA"
                  } else {
                    resultClass = "bg-red-100 text-red-800"
                    resultText = "DERROTA"
                  }
                }

                return (
                  <li key={match.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-blue-600 mb-1">
                          Jornada {match.matchday.number} &bull; {new Date(match.matchday.date).toLocaleDateString()}
                        </span>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <span className={isHome ? "font-bold text-black" : "text-gray-500"}>{match.homeTeam.name}</span>
                          <span className="px-2 py-1 bg-gray-100 rounded font-mono text-center min-w-[3rem]">
                            {homeScore} - {awayScore}
                          </span>
                          <span className={!isHome ? "font-bold text-black" : "text-gray-500"}>{match.awayTeam.name}</span>
                        </div>
                        {match.venue && (
                          <span className="text-xs text-gray-500 mt-1">📍 {match.venue.name}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${resultClass}`}>
                          {resultText}
                        </span>
                        <Link 
                          href={`/admin/tournaments/${params.id}/matchdays/${match.matchdayId}`}
                          className="text-indigo-600 hover:text-indigo-900 text-xs font-medium ml-2 border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-50"
                        >
                          Ir a Jornada
                        </Link>
                      </div>
                    </div>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
