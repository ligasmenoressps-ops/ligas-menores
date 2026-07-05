'use client'

import { useActionState, useState } from 'react'
import { submitMatchResult } from './actions'

export function MatchResultForm({ 
  tournamentId, 
  matchdayId, 
  match,
  isFinalLeg
}: { 
  tournamentId: string, 
  matchdayId: string, 
  match: any,
  isFinalLeg?: boolean
}) {
  const [state, formAction, isPending] = useActionState(submitMatchResult, null)
  const [showPenalties, setShowPenalties] = useState(match.homePenalties !== null && match.homePenalties !== undefined)

  return (
    <form action={formAction} className="bg-gray-50 rounded-lg p-4 mt-2 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Cargar Resultado</h4>
      
      {state?.error && <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded">{state.error}</div>}
      {state?.success && <div className="mb-3 text-xs text-green-600 bg-green-50 p-2 rounded">{state.message}</div>}
      
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <input type="hidden" name="matchdayId" value={matchdayId} />
      <input type="hidden" name="matchId" value={match.id} />
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold truncate w-24 text-right" title={match.homeTeam.name}>
            {match.homeTeam.name.substring(0, 10)}.
          </span>
          <input 
            type="number" 
            name="homeGoals" 
            defaultValue={match.homeGoals ?? ''} 
            required 
            min="0"
            className="w-16 border border-gray-300 rounded-md py-1 px-2 text-center"
          />
        </div>
        <span className="text-gray-500 font-bold">-</span>
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            name="awayGoals" 
            defaultValue={match.awayGoals ?? ''} 
            required 
            min="0"
            className="w-16 border border-gray-300 rounded-md py-1 px-2 text-center"
          />
          <span className="text-sm font-semibold truncate w-24" title={match.awayTeam.name}>
            {match.awayTeam.name.substring(0, 10)}.
          </span>
        </div>
        <div className="ml-auto">
          <button type="submit" disabled={isPending} className="bg-green-600 border border-transparent rounded-md shadow-sm py-1 px-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
            {isPending ? '...' : 'Guardar'}
          </button>
        </div>
      </div>

      {isFinalLeg && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          {!showPenalties ? (
            <button 
              type="button" 
              onClick={() => setShowPenalties(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Agregar resultado de penales
            </button>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-500">Penales (solo llenar si hubo desempate por penales)</p>
                <button 
                  type="button" 
                  onClick={() => setShowPenalties(false)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Cancelar penales
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400 font-semibold w-12 text-right">Penales</span>
                <input 
                  type="number" 
                  name="homePenalties" 
                  defaultValue={match.homePenalties ?? ''} 
                  min="0"
                  placeholder="Local"
                  className="w-16 border border-gray-300 rounded py-1 px-2 text-center text-xs bg-orange-50"
                />
                <span className="text-gray-400 font-bold">-</span>
                <input 
                  type="number" 
                  name="awayPenalties" 
                  defaultValue={match.awayPenalties ?? ''} 
                  min="0"
                  placeholder="Visitante"
                  className="w-16 border border-gray-300 rounded py-1 px-2 text-center text-xs bg-orange-50"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  )
}
