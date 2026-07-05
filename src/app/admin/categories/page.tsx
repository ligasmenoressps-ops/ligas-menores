import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CategoryList from './CategoryList'

export default async function CategoriesPage() {
  const session = await getSession()
  if (session?.role !== 'ADMIN') {
    redirect('/admin')
  }

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { teams: true, tournaments: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Categorías</h1>
      </div>
      
      <div className="text-gray-500 mb-6">
        Aquí puedes administrar las categorías existentes, cambiar su nombre y explorar los equipos asociados a cada una de ellas.
      </div>

      <CategoryList categories={categories} />
    </div>
  )
}
