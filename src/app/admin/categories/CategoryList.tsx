'use client'

import { useState } from 'react'
import { updateCategory } from './actions'
import { Category } from '@/generated/prisma/client'
import Link from 'next/link'

export default function CategoryList({ categories }: { categories: (Category & { _count: { teams: number, tournaments: number } })[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setError(null)
  }

  const saveEdit = async (id: string) => {
    setLoading(true)
    setError(null)
    const result = await updateCategory(id, editName)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setEditingId(null)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <ul className="divide-y divide-gray-200">
        {categories.map((cat) => (
          <li key={cat.id} className="p-6 hover:bg-gray-50 transition-colors">
            {editingId === cat.id ? (
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  disabled={loading}
                />
                <div className="flex space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => saveEdit(cat.id)}
                    disabled={loading}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    disabled={loading}
                    className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
                {error && <span className="text-red-500 text-sm mt-2 sm:mt-0">{error}</span>}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Equipos: <span className="font-medium text-gray-700">{cat._count.teams}</span> | Torneos: <span className="font-medium text-gray-700">{cat._count.tournaments}</span>
                  </p>
                </div>
                <div className="flex space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => startEdit(cat)}
                    className="flex-1 sm:flex-none bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Editar Nombre
                  </button>
                  <Link
                    href={`/admin/teams?category=${encodeURIComponent(cat.name)}`}
                    className="flex-1 sm:flex-none bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
                  >
                    Ver Equipos
                  </Link>
                </div>
              </div>
            )}
          </li>
        ))}
        {categories.length === 0 && (
          <li className="p-6 text-center text-gray-500">
            No hay categorías registradas.
          </li>
        )}
      </ul>
    </div>
  )
}
