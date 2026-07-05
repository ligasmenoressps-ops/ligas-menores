'use client'

import { useActionState } from 'react'
import { scheduleMatch } from './actions'

type TeamOptions = { id: string, name: string }[]
type VenueOptions = { id: string, name: string }[]

export function MatchForm({ 
  tournamentId, 
  matchdayId, 
  teams, 
  venues,
  delegates,
  match, // if editing
  onSuccess
}: { 
  tournamentId: string, 
  matchdayId: string, 
  teams: TeamOptions, 
  venues: VenueOptions,
  delegates?: { id: string, name: string }[],
  match?: any,
  onSuccess?: () => void
}) {
  const [state, formAction, isPending] = useActionState(scheduleMatch, null)

  const defaultTime = match?.time ? new Date(match.time).toISOString().slice(0, 16) : ''

  if (state?.success && onSuccess) {
    onSuccess()
  }

  return (
    <form action={formAction} className="bg-white shadow sm:rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
        {match ? 'Editar Partido' : 'Programar Nuevo Partido'}
      </h3>
      
      {state?.error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{state.error}</div>}
      {state?.success && <div className="mb-4 text-sm text-green-600 bg-green-50 p-2 rounded">{state.message}</div>}
      
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <input type="hidden" name="matchdayId" value={matchdayId} />
      {match && <input type="hidden" name="matchId" value={match.id} />}
      
      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Local</label>
          <select name="homeTeamId" defaultValue={match?.homeTeamId || ''} required className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm">
            <option value="" disabled>Seleccione...</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Visitante</label>
          <select name="awayTeamId" defaultValue={match?.awayTeamId || ''} required className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm">
            <option value="" disabled>Seleccione...</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cancha</label>
          <select name="venueId" defaultValue={match?.venueId || ''} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm">
            <option value="">Por definir</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Delegado</label>
          <select name="delegateId" defaultValue={match?.delegateId || ''} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm">
            <option value="">Por definir</option>
            {delegates?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
          <input type="datetime-local" name="time" defaultValue={defaultTime} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={isPending} className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {isPending ? 'Guardando...' : 'Guardar Partido'}
        </button>
      </div>
    </form>
  )
}
