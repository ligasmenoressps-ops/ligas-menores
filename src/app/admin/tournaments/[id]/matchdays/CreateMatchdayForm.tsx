'use client'

import { useActionState } from 'react'
import { createMatchday } from './actions'

export function CreateMatchdayForm({ tournamentId, nextNumber }: { tournamentId: string, nextNumber: number }) {
  const [state, formAction, isPending] = useActionState(createMatchday, null)

  return (
    <form action={formAction} className="bg-white shadow sm:rounded-lg p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Nueva Jornada</h3>
      
      {state?.error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{state.error}</div>}
      
      <input type="hidden" name="tournamentId" value={tournamentId} />
      
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Número de Jornada</label>
          <input type="number" name="number" defaultValue={nextNumber} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
          <input type="date" name="date" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={isPending} className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
          {isPending ? 'Creando...' : 'Crear Jornada'}
        </button>
      </div>
    </form>
  )
}
