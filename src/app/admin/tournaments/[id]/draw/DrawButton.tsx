'use client'

import { useState, useTransition } from 'react'
import { performDraw } from './actions'

type DrawButtonProps = {
  tournamentId: string
  hasExistingDraw: boolean
}

export default function DrawButton({ tournamentId, hasExistingDraw }: DrawButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleDraw = () => {
    if (hasExistingDraw) {
      if (!window.confirm('Ya existen números asignados. ¿Estás seguro de que deseas re-sortear? Los números actuales se sobreescribirán.')) {
        return
      }
    }

    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await performDraw(tournamentId)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(result.message || 'Exito')
      }
    })
  }

  return (
    <div className="mt-6 flex flex-col items-center sm:items-start">
      <button
        onClick={handleDraw}
        disabled={isPending}
        className={`px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
          hasExistingDraw ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors`}
      >
        {isPending ? 'Sorteando...' : hasExistingDraw ? 'Re-sortear Equipos' : 'Realizar Sorteo'}
      </button>
      
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
    </div>
  )
}
