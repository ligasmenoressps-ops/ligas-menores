import { prisma } from '@/lib/prisma'

export default async function PublicBracketPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      matchdays: {
        include: {
          matches: {
            where: {
              phase: { not: 'GROUP_STAGE' } // Obtenemos solo los partidos de rondas eliminatorias
            },
            include: {
              homeTeam: true,
              awayTeam: true
            }
          }
        },
        orderBy: { number: 'asc' }
      }
    }
  })

  if (!tournament) return <div>Torneo no encontrado</div>

  // Extraer todos los partidos de eliminatoria de todas las jornadas
  const knockoutMatches = tournament.matchdays.flatMap(md => md.matches)

  if (knockoutMatches.length === 0) {
    return (
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-gray-900">Fase Final</h3>
        <div className="text-gray-500 bg-white p-6 rounded-lg shadow text-center">
          La fase final aún no se ha generado o no hay partidos programados.
        </div>
      </div>
    )
  }

  // Agrupar por nombre de fase (ej. "Cuartos de Final", "Semifinales")
  const matchesByPhase = knockoutMatches.reduce((acc, match) => {
    if (!acc[match.phase]) acc[match.phase] = []
    acc[match.phase].push(match)
    return acc
  }, {} as Record<string, typeof knockoutMatches>)

  return (
    <div className="space-y-12">
      <h3 className="text-xl font-semibold text-gray-900">Llaves de Fase Final</h3>
      
      <div className="space-y-10">
        {Object.entries(matchesByPhase).map(([phaseName, matches]) => (
          <div key={phaseName} className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <div className="bg-gray-900 px-6 py-4 text-white">
              <h4 className="font-bold text-lg">{phaseName}</h4>
            </div>
            <div className="p-6 overflow-x-auto">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-w-[300px]">
                {matches.map((match) => (
                  <div key={match.id} className="border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                    <div className="flex flex-col">
                      {/* Local */}
                      <div className="flex items-center justify-between p-3 border-b bg-white">
                        <div className="flex items-center space-x-3">
                          {match.homeTeam.logoUrl ? (
                            <img src={match.homeTeam.logoUrl} className="w-6 h-6 object-contain" alt="" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200" />
                          )}
                          <span className="text-sm font-semibold truncate w-24" title={match.homeTeam.name}>{match.homeTeam.name}</span>
                        </div>
                        <span className={`text-sm font-bold ${match.status === 'PLAYED' ? 'text-gray-900' : 'text-gray-400'}`}>
                          {match.status === 'PLAYED' ? (
                            <>
                              {match.homeGoals}
                              {match.homePenalties !== null && <span className="text-orange-500 text-[10px] ml-1">({match.homePenalties})</span>}
                            </>
                          ) : '-'}
                        </span>
                      </div>
                      
                      {/* Visitante */}
                      <div className="flex items-center justify-between p-3 bg-white">
                        <div className="flex items-center space-x-3">
                          {match.awayTeam.logoUrl ? (
                            <img src={match.awayTeam.logoUrl} className="w-6 h-6 object-contain" alt="" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200" />
                          )}
                          <span className="text-sm font-semibold truncate w-24" title={match.awayTeam.name}>{match.awayTeam.name}</span>
                        </div>
                        <span className={`text-sm font-bold ${match.status === 'PLAYED' ? 'text-gray-900' : 'text-gray-400'}`}>
                          {match.status === 'PLAYED' ? (
                            <>
                              {match.awayGoals}
                              {match.awayPenalties !== null && <span className="text-orange-500 text-[10px] ml-1">({match.awayPenalties})</span>}
                            </>
                          ) : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
