'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Ups! Algo salió mal</h2>
        <p className="text-gray-600 mb-6">
          Ha ocurrido un error inesperado al procesar tu solicitud. Por favor, intenta de nuevo.
        </p>
        <button
          onClick={() => reset()}
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
