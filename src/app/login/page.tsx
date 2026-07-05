'use client'

import { useActionState, useEffect } from 'react'
import { loginUser } from './actions'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      router.push('/admin')
    }
  }, [state, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Iniciar Sesión</h2>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              defaultValue="admin@ligasmenores.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              defaultValue="admin123"
            />
          </div>
          
          {state?.error && (
            <div className="text-red-500 text-sm text-center">{state.error}</div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isPending ? 'Iniciando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
