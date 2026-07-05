'use client'

import { useState } from 'react'
import { MatchForm } from './MatchForm'
import { MatchResultForm } from './MatchResultForm'

export function MatchEditRow({
  match,
  tournamentId,
  matchdayId,
  teams,
  venues,
  delegates,
  isFinalLeg
}: {
  match: any
  tournamentId: string
  matchdayId: string
  teams: any[]
  venues: any[]
  delegates: any[]
  isFinalLeg?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingResult, setIsEditingResult] = useState(false)

  if (isEditing) {
    return (
      <div className="p-4 sm:px-6 relative">
        <button 
          onClick={() => setIsEditing(false)}
          className="absolute top-6 right-8 text-sm text-gray-500 hover:text-gray-700 font-medium z-10"
        >
          Cancelar
        </button>
        <MatchForm 
          tournamentId={tournamentId}
          matchdayId={matchdayId}
          match={match}
          teams={teams}
          venues={venues}
          delegates={delegates}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="p-4 sm:px-6 hover:bg-gray-50 group">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-4 text-sm font-medium text-gray-900">
          <div className="flex items-center space-x-2 w-32 justify-end">
            <span>{match.homeTeam.name}</span>
            {match.homeTeam.logoUrl && <img src={match.homeTeam.logoUrl} alt="logo" className="w-5 h-5" />}
          </div>
          <div className="px-3 flex flex-col justify-center items-center min-w-[4rem]">
            {match.status === 'PLAYED' ? (
              <>
                <div className="px-3 py-1 bg-gray-100 rounded text-center font-bold text-gray-900 w-full whitespace-nowrap">
                  {match.homeGoals} - {match.awayGoals}
                </div>
                {(match.homePenalties !== null && match.awayPenalties !== null) && (
                  <div className="text-[10px] sm:text-xs text-orange-600 font-bold mt-1">
                    ({match.homePenalties}-{match.awayPenalties} pen)
                  </div>
                )}
              </>
            ) : (
              <div className="px-3 py-1 bg-gray-100 rounded text-center text-gray-500 w-full">
                vs
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 w-32">
            {match.awayTeam.logoUrl && <img src={match.awayTeam.logoUrl} alt="logo" className="w-5 h-5" />}
            <span>{match.awayTeam.name}</span>
          </div>
        </div>
        <div className="flex flex-col items-end text-xs text-gray-500">
          <div className="flex space-x-3 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setIsEditing(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Editar Info
            </button>
            {match.status === 'PLAYED' && (
              <button 
                onClick={() => setIsEditingResult(!isEditingResult)}
                className="text-orange-600 hover:text-orange-800 font-medium"
              >
                {isEditingResult ? 'Cerrar Resultado' : 'Editar Resultado'}
              </button>
            )}
          </div>
          <div>{match.time ? new Date(match.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Hora por definir'}</div>
          <div>{match.venue?.name || 'Cancha por definir'}</div>
          {match.delegate && <div>Del: {match.delegate.name}</div>}
          <div className={`mt-1 font-semibold ${match.status === 'PLAYED' ? 'text-green-600' : 'text-blue-600'}`}>
            {match.status === 'PLAYED' ? 'Finalizado' : 'Programado'}
          </div>
        </div>
      </div>

      {(match.status === 'SCHEDULED' || isEditingResult) && (
        <MatchResultForm tournamentId={tournamentId} matchdayId={matchdayId} match={match} isFinalLeg={isFinalLeg} />
      )}
    </div>
  )
}
