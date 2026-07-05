'use client'

import { useState } from 'react'
import { generateLeagueFixtures } from './actions'

export function GenerateLeagueButton({ tournamentId }: { tournamentId: string }) {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!confirm('¿Estás seguro? Esto generará todas las jornadas de la fase regular según los equipos inscritos. Si ya existen jornadas, se añadirán al final.')) return
    
    setLoading(true)
    const result = await generateLeagueFixtures(tournamentId)
    if (result?.error) {
      alert(result.error)
    } else if (result?.message) {
      alert(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Fase Regular (Fixture)</h3>
      <p className="text-sm text-gray-500 mb-4">
        Genera automáticamente todos los cruces de la fase regular basado en los equipos inscritos y la modalidad (Ida / Ida y Vuelta).
      </p>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Generando...' : 'Generar Fase Regular'}
      </button>
    </div>
  )
}
