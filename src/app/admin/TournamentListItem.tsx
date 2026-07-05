'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateTournament, deleteTournament } from './tournaments-actions'

type Tournament = {
  id: string
  name: string
  season: string
  categoryId: string
  category: { name: string }
}

type Category = {
  id: string
  name: string
}

export default function TournamentListItem({ tournament, categories }: { tournament: Tournament, categories: Category[] }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Edit State
  const [editName, setEditName] = useState(tournament.name)
  const [editCategory, setEditCategory] = useState(tournament.categoryId)
  const [editSeason, setEditSeason] = useState(tournament.season)

  const handleUpdate = async () => {
    setLoading(true)
    const formData = new FormData()
    formData.append('id', tournament.id)
    formData.append('name', editName)
    formData.append('categoryId', editCategory)
    formData.append('season', editSeason)
    
    await updateTournament(null, formData)
    setIsEditing(false)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este torneo? Esto borrará TODOS los partidos, jornadas y equipos inscritos en él.')) return
    
    setIsDeleting(true)
    await deleteTournament(tournament.id)
    // The item will disappear due to revalidatePath
  }

  if (isEditing) {
    return (
      <li className="px-4 py-4 sm:px-6 hover:bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
            disabled={loading}
          />
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="w-full sm:w-48 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md p-2 border bg-white"
            disabled={loading}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={editSeason}
            onChange={(e) => setEditSeason(e.target.value)}
            className="w-full sm:w-24 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md p-2 border"
            disabled={loading}
          />
          <div className="flex space-x-2 w-full sm:w-auto">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              Guardar
            </button>
            <button
              onClick={() => setIsEditing(false)}
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
            {tournament.name} <span className="text-gray-500 text-sm ml-2">({tournament.category.name} - {tournament.season})</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <Link 
            href={`/admin/tournaments/${tournament.id}/format`}
            className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Formato
          </Link>
          <Link 
            href={`/admin/tournaments/${tournament.id}/draw`}
            className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Sorteo
          </Link>
          <Link 
            href={`/admin/tournaments/${tournament.id}/matchdays`}
            className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Jornadas
          </Link>
          <Link 
            href={`/admin/tournaments/${tournament.id}/teams`}
            className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700"
          >
            Equipos
          </Link>
          <Link 
            href={`/admin/tournaments/${tournament.id}/standings`}
            className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            Tabla
          </Link>
          <span className="w-px h-6 bg-gray-300 mx-2 hidden sm:block"></span>
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
