'use client'

import { useState, useTransition } from 'react'
import { generateKnockoutStage } from './actions'

export function GenerateKnockoutButton({ tournamentId }: { tournamentId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleGenerate = () => {
    if (!window.confirm('¿Estás seguro de generar la fase eliminatoria? Asegúrate de que todos los partidos de grupo estén completados.')) return

    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await generateKnockoutStage(tournamentId)
      if (result.error) setError(result.error)
      else setSuccess(result.message || 'Exito')
    })
  }

  return (
    <div className="bg-white shadow sm:rounded-lg p-6 flex flex-col items-start border border-blue-200">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Fase Eliminatoria</h3>
      <p className="text-sm text-gray-500 mb-4">
        Genera automáticamente los cruces de la siguiente ronda basado en la configuración de formato y la tabla actual.
      </p>
      
      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded w-full">{error}</div>}
      {success && <div className="mb-4 text-sm text-green-600 bg-green-50 p-2 rounded w-full">{success}</div>}
      
      <button 
        onClick={handleGenerate}
        disabled={isPending}
        className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isPending ? 'Generando...' : 'Generar Cruces Eliminatorios'}
      </button>
    </div>
  )
}
