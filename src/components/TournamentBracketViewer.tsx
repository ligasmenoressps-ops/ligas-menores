'use client'

import { useMemo } from 'react'

const PHASE_ORDER = [
  'Dieciseisavos de final',
  'Octavos de final',
  'Cuartos de final',
  'Semifinal',
  'Final'
]

export default function TournamentBracketViewer({ knockoutMatches }: { knockoutMatches: any[] }) {
  const bracketData = useMemo(() => {
    // 1. Group by phase
    const matchesByPhase: Record<string, any[]> = {}
    knockoutMatches.forEach(m => {
      if (!matchesByPhase[m.phase]) matchesByPhase[m.phase] = []
      matchesByPhase[m.phase].push(m)
    })

    // 2. Merge multi-leg matches
    const mergedByPhase: Record<string, any[]> = {}
    for (const phase in matchesByPhase) {
      const merged: Record<string, any> = {}
      matchesByPhase[phase].forEach(m => {
        const key = [m.homeTeamId, m.awayTeamId].sort().join('-')
        if (!merged[key]) {
          merged[key] = { ...m, legs: [m] }
        } else {
          merged[key].legs.push(m)
        }
      })
      mergedByPhase[phase] = Object.values(merged).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }

    // 3. Sort phases
    const sortedPhases = Object.keys(mergedByPhase).sort((a, b) => {
      const idxA = PHASE_ORDER.indexOf(a)
      const idxB = PHASE_ORDER.indexOf(b)
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      return 0
    })

    // 4. Construct internal format
    const rounds: any[] = []
    
    sortedPhases.forEach((phase) => {
      const currentPhaseMatches = mergedByPhase[phase]
      const matches: any[] = []

      currentPhaseMatches.forEach((m) => {
        let homeGoals = 0
        let awayGoals = 0
        let homePens = 0
        let awayPens = 0
        let allPlayed = true

        m.legs.forEach((leg: any) => {
          if (leg.status !== 'PLAYED') allPlayed = false
          if (leg.homeTeamId === m.homeTeamId) {
            homeGoals += leg.homeGoals || 0
            awayGoals += leg.awayGoals || 0
            homePens += leg.homePenalties || 0
            awayPens += leg.awayPenalties || 0
          } else {
            homeGoals += leg.awayGoals || 0
            awayGoals += leg.homeGoals || 0
            homePens += leg.awayPenalties || 0
            awayPens += leg.homePenalties || 0
          }
        })

        let homeWon = false
        let awayWon = false
        if (allPlayed) {
          if (homeGoals > awayGoals) homeWon = true
          else if (awayGoals > homeGoals) awayWon = true
          else if (homePens > awayPens) homeWon = true
          else if (awayPens > homePens) awayWon = true
        }

        matches.push({
          id: m.id,
          name: phase,
          date: m.date,
          status: allPlayed ? 'Finalizado' : 'Pendiente',
          homeTeam: {
            name: m.homeTeam?.name || 'Por definir',
            logo: m.homeTeam?.logoUrl,
            score: allPlayed ? homeGoals : null,
            penalties: allPlayed && homePens > 0 ? homePens : null,
            isWinner: homeWon
          },
          awayTeam: {
            name: m.awayTeam?.name || 'Por definir',
            logo: m.awayTeam?.logoUrl,
            score: allPlayed ? awayGoals : null,
            penalties: allPlayed && awayPens > 0 ? awayPens : null,
            isWinner: awayWon
          }
        })
      })

      rounds.push({
        title: phase,
        matches
      })
    })

    return rounds
  }, [knockoutMatches])

  if (!bracketData || bracketData.length === 0) {
    return null
  }

  return (
    <div className="w-full overflow-hidden bg-gray-50 mt-8 rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Cuadro Eliminatorio</h3>
      </div>
      
      <div className="p-8 overflow-x-auto">
        <div className="flex flex-row min-w-max" style={{ gap: '4rem' }}>
          {bracketData.map((round, rIndex) => (
            <div key={rIndex} className="flex flex-col relative" style={{ width: '260px' }}>
              {/* Round Title */}
              <div className="text-center mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{round.title}</h4>
              </div>

              {/* Matches Container */}
              <div className="flex flex-col justify-around flex-grow relative">
                {round.matches.map((match: any, mIndex: number) => {
                  const isLastRound = rIndex === bracketData.length - 1
                  const isEven = mIndex % 2 === 0

                  return (
                    <div key={match.id} className="relative py-4">
                      
                      {/* Match Card */}
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden z-10 relative">
                        {/* Status / Date Header */}
                        <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                          <span className={`text-xs font-semibold ${match.status === 'Finalizado' ? 'text-gray-500' : 'text-blue-500'}`}>
                            {match.status}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(match.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>

                        {/* Teams */}
                        <div className="flex flex-col">
                          {/* Home Team */}
                          <div className={`flex items-center justify-between px-3 py-2 border-b border-gray-100 ${match.homeTeam.isWinner ? 'bg-green-50/30' : ''}`}>
                            <div className="flex items-center space-x-2 overflow-hidden">
                              {match.homeTeam.logo ? (
                                <img src={match.homeTeam.logo} alt="" className="w-5 h-5 rounded-full object-cover" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-gray-200" />
                              )}
                              <span className={`text-sm truncate ${match.homeTeam.isWinner ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                {match.homeTeam.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {match.homeTeam.penalties !== null && (
                                <span className="text-xs text-gray-400">({match.homeTeam.penalties})</span>
                              )}
                              <span className={`text-sm font-semibold w-5 text-center ${match.homeTeam.isWinner ? 'text-green-600' : 'text-gray-900'}`}>
                                {match.homeTeam.score !== null ? match.homeTeam.score : '-'}
                              </span>
                            </div>
                          </div>

                          {/* Away Team */}
                          <div className={`flex items-center justify-between px-3 py-2 ${match.awayTeam.isWinner ? 'bg-green-50/30' : ''}`}>
                            <div className="flex items-center space-x-2 overflow-hidden">
                              {match.awayTeam.logo ? (
                                <img src={match.awayTeam.logo} alt="" className="w-5 h-5 rounded-full object-cover" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-gray-200" />
                              )}
                              <span className={`text-sm truncate ${match.awayTeam.isWinner ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                {match.awayTeam.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {match.awayTeam.penalties !== null && (
                                <span className="text-xs text-gray-400">({match.awayTeam.penalties})</span>
                              )}
                              <span className={`text-sm font-semibold w-5 text-center ${match.awayTeam.isWinner ? 'text-green-600' : 'text-gray-900'}`}>
                                {match.awayTeam.score !== null ? match.awayTeam.score : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Connector Lines (CSS pseudo-elements conceptually) */}
                      {!isLastRound && (
                        <>
                          {/* Horizontal line going out to the right */}
                          <div className="absolute top-1/2 -right-[2rem] w-[2rem] border-t-2 border-gray-300" />
                          
                          {/* Vertical line connecting pairs */}
                          {isEven && round.matches.length > mIndex + 1 && (
                            <div 
                              className="absolute top-1/2 -right-[2rem] w-[2rem] border-r-2 border-gray-300"
                              style={{ height: 'calc(100% + 2rem)' }} 
                            />
                          )}
                        </>
                      )}
                      
                      {/* Incoming horizontal line from the left */}
                      {rIndex > 0 && (
                        <div className="absolute top-1/2 -left-[2rem] w-[2rem] border-t-2 border-gray-300" />
                      )}

                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
