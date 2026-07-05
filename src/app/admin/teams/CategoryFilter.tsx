'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function CategoryFilter({ categories }: { categories: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || 'all'

  return (
    <div className="mb-6 flex items-center space-x-4">
      <label htmlFor="category-select" className="text-sm font-medium text-gray-700">
        Filtrar por Categoría:
      </label>
      <select
        id="category-select"
        value={currentCategory}
        onChange={(e) => {
          const val = e.target.value
          if (val === 'all') {
            router.push('/admin/teams')
          } else {
            router.push(`/admin/teams?category=${encodeURIComponent(val)}`)
          }
        }}
        className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border bg-white"
      >
        <option value="all">Todas las Categorías</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  )
}
