import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import CreateTournamentForm from './CreateTournamentForm'
import TournamentListItem from './TournamentListItem'

export default async function AdminDashboardPage() {
  const session = await getSession()
  const isAdmin = session?.role === 'ADMIN'

  const tournaments = isAdmin ? await prisma.tournament.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  }) : []

  const categories = isAdmin ? await prisma.category.findMany({
    orderBy: { name: 'asc' }
  }) : []

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Bienvenido al Panel de Administración
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            {isAdmin ? (
              <p>
                Desde aquí podrás gestionar las categorías, torneos, equipos y jornadas.
              </p>
            ) : (
              <p>
                Como delegado, tienes acceso restringido. Por favor, dirígete a la sección de <Link href="/admin/teams" className="text-blue-600 hover:underline">Equipos</Link> para gestionar tu plantilla.
              </p>
            )}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Crear Nuevo Torneo</h3>
          <CreateTournamentForm categories={categories} />
        </div>
      )}

      {isAdmin && (
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Tus Torneos</h3>
          </div>
          <ul role="list" className="divide-y divide-gray-200">
            {tournaments.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">
                No hay torneos creados aún. Usa el formulario de arriba para crear uno.
              </li>
            ) : (
              tournaments.map((tournament) => (
                <TournamentListItem key={tournament.id} tournament={tournament} categories={categories} />
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

