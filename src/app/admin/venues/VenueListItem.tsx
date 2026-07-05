'use client'

import { useState } from 'react'
import { updateVenue, deleteVenue } from './actions'

type Venue = {
  id: string
  name: string
  address: string | null
}

export function VenueListItem({ venue }: { venue: Venue }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [editName, setEditName] = useState(venue.name)
  const [editAddress, setEditAddress] = useState(venue.address || '')

  const handleUpdate = async () => {
    if (!editName) {
      alert('El nombre es requerido')
      return
    }
    
    setLoading(true)
    const formData = new FormData()
    formData.append('id', venue.id)
    formData.append('name', editName)
    formData.append('address', editAddress)
    
    const result = await updateVenue(null, formData)
    if (result?.error) {
      alert(result.error)
    } else {
      setIsEditing(false)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la cancha "${venue.name}"?`)) return
    
    setIsDeleting(true)
    const result = await deleteVenue(venue.id)
    if (result?.error) {
      alert(result.error)
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <li className="px-4 py-4 sm:px-6 hover:bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
            placeholder="Nombre"
            disabled={loading}
          />
          <input
            type="text"
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
            className="flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
            placeholder="Ubicación / Dirección"
            disabled={loading}
          />
          <div className="flex space-x-2 w-full sm:w-auto">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setEditName(venue.name)
                setEditAddress(venue.address || '')
                setIsEditing(false)
              }}
              disabled={loading}
              className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className={`px-4 py-4 sm:px-6 hover:bg-gray-50 transition-opacity ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600 truncate text-lg">
            {venue.name}
          </p>
          {venue.address && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              📍 {venue.address}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <button 
            onClick={() => setIsEditing(true)}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          >
            Editar
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      </div>
    </li>
  )
}
