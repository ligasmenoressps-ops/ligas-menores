'use client'

import { useActionState, useRef } from 'react'
import { createVenue } from './actions'

export function CreateVenueForm() {
  const [state, formAction, isPending] = useActionState(createVenue, null)
  const formRef = useRef<HTMLFormElement>(null)

  if (state?.success && formRef.current) {
    formRef.current.reset()
  }

  return (
    <form ref={formRef} action={formAction} className="bg-white shadow sm:rounded-lg p-6 mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Añadir Nueva Cancha</h3>
      
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre de la Cancha
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="Ej: Estadio Nacional"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Ubicación / Dirección (Opcional)
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="address"
              id="address"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="Ej: Av. Principal 123"
            />
          </div>
        </div>

        <div className="sm:col-span-1 flex items-end">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isPending ? 'Guardando...' : 'Agregar'}
          </button>
        </div>
      </div>

      {state?.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="mt-2 text-sm text-green-600">{state.message}</p>
      )}
    </form>
  )
}
