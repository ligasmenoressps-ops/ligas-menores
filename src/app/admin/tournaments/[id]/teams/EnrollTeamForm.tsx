'use client'

import { useActionState, useRef } from 'react'
import { enrollTeam } from './actions'

type Team = {
  id: string
  name: string
}

export default function EnrollTeamForm({ tournamentId, availableTeams }: { tournamentId: string, availableTeams: Team[] }) {
  const [state, formAction, isPending] = useActionState(enrollTeam, null)
  const formRef = useRef<HTMLFormElement>(null)

  if (state?.success && formRef.current) {
    formRef.current.reset()
  }

  if (availableTeams.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center text-sm text-gray-500">
        No hay equipos disponibles para inscribir en esta categoría, o todos ya están inscritos.
      </div>
    )
  }

  return (
    <form ref={formRef} action={formAction} className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Inscribir Nuevo Equipo</h3>
      
      <input type="hidden" name="tournamentId" value={tournamentId} />
      
      <div className="sm:flex sm:space-y-0 sm:space-x-4 items-end">
        <div className="flex-1">
          <label htmlFor="teamId" className="block text-sm font-medium text-gray-700">Seleccionar Equipo</label>
          <select 
            name="teamId" 
            id="teamId"
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md border"
          >
            <option value="">Seleccione...</option>
            {availableTeams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2 sm:pt-0 mt-4 sm:mt-0">
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 whitespace-nowrap"
          >
            {isPending ? 'Inscribiendo...' : 'Inscribir Equipo'}
          </button>
        </div>
      </div>
      
      {state?.error && <p className="text-red-500 text-sm mt-4">{state.error}</p>}
      {state?.success && <p className="text-green-500 text-sm mt-4">{state.message}</p>}
    </form>
  )
}
