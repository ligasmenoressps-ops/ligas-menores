'use client'

import { useActionState, useRef } from 'react'
import { createTournament } from './tournaments-actions'

type Category = {
  id: string
  name: string
}

export default function CreateTournamentForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createTournament, null)
  const formRef = useRef<HTMLFormElement>(null)

  // Reset form on success
  if (state?.success && formRef.current) {
    formRef.current.reset()
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="sm:flex sm:space-y-0 sm:space-x-4 items-end">
        <div className="flex-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 whitespace-nowrap">Nombre del Torneo</label>
          <input 
            type="text" 
            name="name" 
            id="name"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ej: Liga Apertura"
          />
        </div>
        
        <div className="w-full sm:w-48">
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Categoría</label>
          <select 
            name="categoryId" 
            id="categoryId"
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
          >
            <option value="">Seleccione...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-32">
          <label htmlFor="season" className="block text-sm font-medium text-gray-700">Temporada</label>
          <input 
            type="text" 
            name="season" 
            id="season"
            required
            defaultValue={new Date().getFullYear().toString()}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="pt-2 sm:pt-0">
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 whitespace-nowrap"
          >
            {isPending ? 'Guardando...' : 'Crear Torneo'}
          </button>
        </div>
      </div>
      
      {state?.error && <p className="text-red-500 text-sm mt-2">{state.error}</p>}
      {state?.success && <p className="text-green-500 text-sm mt-2">{state.message}</p>}
    </form>
  )
}
