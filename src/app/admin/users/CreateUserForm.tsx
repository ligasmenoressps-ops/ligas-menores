'use client'

import { useActionState, useRef } from 'react'
import { createUser } from './actions'

type Team = { id: string, name: string }

export default function CreateUserForm({ teams }: { teams: Team[] }) {
  const [state, formAction, isPending] = useActionState(createUser, null)
  const formRef = useRef<HTMLFormElement>(null)

  if (state?.success) {
    formRef.current?.reset()
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input type="text" name="name" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input type="password" name="password" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rol</label>
          <select name="role" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="DELEGATE">Delegado</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Equipo (Solo Delegados)</label>
          <select name="teamId" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="">Ninguno</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>
      
      {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
      {state?.success && <p className="text-green-500 text-sm">Usuario creado exitosamente.</p>}

      <button type="submit" disabled={isPending} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
        {isPending ? 'Guardando...' : 'Crear Usuario'}
      </button>
    </form>
  )
}
