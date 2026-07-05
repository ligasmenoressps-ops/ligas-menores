'use client'

import { useState } from 'react'
import { deleteMatchday } from './actions'

export function DeleteMatchdayButton({ matchdayId, tournamentId }: { matchdayId: string, tournamentId: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault() // prevent navigating to matchday page if it's inside a link
    if (!confirm('¿Estás seguro de eliminar esta jornada y todos sus partidos?')) return
    
    setLoading(true)
    const result = await deleteMatchday(matchdayId, tournamentId)
    if (result?.error) {
      alert(result.error)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="ml-4 px-3 py-1 text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50"
    >
      Eliminar
    </button>
  )
}
