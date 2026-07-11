import { prisma } from '@/lib/prisma'
import Image from 'next/image'

export default async function PublicCalendarPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const matchdays = await prisma.matchday.findMany({
    where: { tournamentId: params.id },
    include: {
      matches: {
        include: {
          homeTeam: true,
          awayTeam: true,
          venue: true
        },
        orderBy: { time: 'asc' }
      }
    },
    orderBy: { number: 'asc' }
  })

  return (
    <div className="space-y-12">
      <h3 className="text-xl font-semibold text-gray-900">Calendario y Resultados</h3>
      
      {matchdays.length === 0 ? (
        <div className="text-gray-500 bg-white p-6 rounded-lg shadow text-center">
          Aún no hay jornadas programadas para este torneo.
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {matchdays.map((md) => {
            const isKnockout = md.matches.some(m => m.phase !== 'GROUP_STAGE')
            const phaseName = isKnockout ? md.matches.find(m => m.phase !== 'GROUP_STAGE')?.phase : null
            const displayTitle = isKnockout && phaseName ? phaseName : `Jornada ${md.number}`

            return (
            <div key={md.id} className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
              <div className="bg-blue-600 px-4 py-3 text-white flex justify-between items-center">
                <span className="font-bold capitalize">{displayTitle}</span>
                <span className="text-sm text-blue-100">{new Date(md.date).toLocaleDateString()}</span>
              </div>
              <ul className="divide-y divide-gray-100">
                {md.matches.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-gray-500">Sin partidos</li>
                ) : (
                  md.matches.map((match) => (
                    <li key={match.id} className="px-4 py-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{match.phase.replace('_', ' ')}</span>
                        <span className="text-xs text-gray-500 text-right">
                          {match.time ? new Date(match.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hora TBD'}
                          {match.venue && ` • ${match.venue.name}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2 sm:space-x-3 w-5/12 justify-end min-w-0">
                          <span className="text-sm font-medium text-gray-900 text-right truncate">{match.homeTeam.name}</span>
                          {match.homeTeam.logoUrl ? (
                            <Image src={match.homeTeam.logoUrl} width={32} height={32} className="w-6 h-6 sm:w-8 sm:h-8 object-contain shrink-0" alt="" />
                          ) : (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 shrink-0" />
                          )}
                        </div>
                        <div className="w-2/12 flex flex-col justify-center items-center shrink-0">
                          {match.status === 'PLAYED' ? (
                            <>
                              <div className="px-2 sm:px-3 py-1 bg-gray-900 text-white rounded font-bold text-xs sm:text-sm whitespace-nowrap">
                                {match.homeGoals} - {match.awayGoals}
                              </div>
                              {(match.homePenalties !== null && match.awayPenalties !== null) && (
                                <div className="text-[10px] sm:text-xs text-orange-600 font-bold mt-1">
                                  ({match.homePenalties}-{match.awayPenalties} pen)
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-500 rounded font-medium text-xs sm:text-sm">
                              vs
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 w-5/12 min-w-0">
                          {match.awayTeam.logoUrl ? (
                            <Image src={match.awayTeam.logoUrl} width={32} height={32} className="w-6 h-6 sm:w-8 sm:h-8 object-contain shrink-0" alt="" />
                          ) : (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 shrink-0" />
                          )}
                          <span className="text-sm font-medium text-gray-900 truncate">{match.awayTeam.name}</span>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
