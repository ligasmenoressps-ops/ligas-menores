'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { updateTeam } from './actions'

type Team = {
  id: string
  name: string
  logoUrl: string | null
  users?: { id: string }[]
}

type Delegate = {
  id: string
  name: string
  email: string
}

export default function EditTeamForm({ team, delegates, isAdmin }: { team: Team, delegates: Delegate[], isAdmin: boolean }) {
  const [state, formAction, isPending] = useActionState(updateTeam, null)
  const [preview, setPreview] = useState<string | null>(team.logoUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona una imagen.')
        e.target.value = ''
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no debe pesar más de 2MB.')
        e.target.value = ''
        return
      }
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
    }
  }

  // Limpiar object URL al desmontar
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const assignedDelegateId = team.users && team.users.length > 0 ? team.users[0].id : ''

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <form ref={formRef} action={formAction} className="space-y-4">
        <input type="hidden" name="teamId" value={team.id} />
        
        <div className="flex flex-col md:flex-row md:space-x-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border">
              {preview ? (
                <img src={preview} alt="Logo preview" className="w-full h-full object-contain" />
              ) : (
                <span className="text-gray-400 text-xs text-center p-2">Sin Logo</span>
              )}
            </div>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Cambiar Logo
            </button>
            <input 
              type="file" 
              name="logo" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/webp" 
              className="hidden" 
            />
          </div>

          <div className="flex-1 space-y-4 mt-4 md:mt-0">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Equipo</label>
              <input 
                type="text" 
                name="name" 
                defaultValue={team.name}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Delegado Asignado</label>
                <select 
                  name="delegateId" 
                  defaultValue={assignedDelegateId}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                >
                  <option value="">-- Sin Delegado --</option>
                  {delegates.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.email})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Selecciona el usuario que administrará los jugadores de este equipo.
                </p>
              </div>
            )}
            
            {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
            {state?.success && <p className="text-green-500 text-sm">{state.message}</p>}

            <div>
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full md:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

