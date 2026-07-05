'use client'

import { useState } from 'react'
import { unenrollTeam } from './actions'

type EnrolledTeam = {
  id: string
  teamId: string
  team: {
    name: string
  }
}

export default function EnrolledTeamList({ tournamentId, enrolledTeams }: { tournamentId: string, enrolledTeams: EnrolledTeam[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRemove = async (tournamentTeamId: string) => {
    if (!confirm('¿Estás seguro de que deseas remover a este equipo del torneo?')) return
    
    setLoadingId(tournamentTeamId)
    const result = await unenrollTeam(tournamentTeamId, tournamentId)
    if (result?.error) {
      alert(result.error)
    }
    setLoadingId(null)
  }

  if (enrolledTeams.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
        No hay equipos inscritos en este torneo aún.
      </div>
    )
  }

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Equipos Inscritos ({enrolledTeams.length})</h3>
      </div>
      <ul role="list" className="divide-y divide-gray-200">
        {enrolledTeams.map((et) => (
          <li key={et.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {et.team.name}
              </p>
              <div className="ml-2 flex-shrink-0 flex space-x-2">
                <a
                  href={`/admin/tournaments/${tournamentId}/teams/${et.teamId}/matches`}
                  className="px-3 py-1.5 text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                >
                  Ver Partidos
                </a>
                <button
                  onClick={() => handleRemove(et.id)}
                  disabled={loadingId === et.id}
                  className="px-3 py-1.5 text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50 transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

