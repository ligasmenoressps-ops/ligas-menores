import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function PublicTournamentLayout(props: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { children } = props
  const params = await props.params
  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: { category: true }
  })

  if (!tournament) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tournament Info & Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 border-b border-gray-100 mb-2">
            <h1 className="text-3xl font-black text-brand-dark tracking-tight">
              {tournament.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500 font-medium">
              Categoría {tournament.category.name} <span className="mx-2">•</span> Temporada {tournament.season}
            </p>
          </div>
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <Link
              href={`/tournaments/${tournament.id}/standings`}
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Tabla de Posiciones
            </Link>
            <Link
              href={`/tournaments/${tournament.id}/calendar`}
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Calendario y Resultados
            </Link>
            <Link
              href={`/tournaments/${tournament.id}/teams`}
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Equipos
            </Link>
            <Link
              href={`/tournaments/${tournament.id}/bracket`}
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Fase Final
            </Link>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
