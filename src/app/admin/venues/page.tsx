import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CreateVenueForm } from './CreateVenueForm'
import { VenueListItem } from './VenueListItem'

export default async function VenuesPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    redirect('/login')
  }

  const venues = await prisma.venue.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Canchas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra las canchas y sedes donde se jugarán los partidos del campeonato.
          </p>
        </div>
        <Link href="/admin" className="text-gray-500 hover:text-gray-700 font-medium">
          Volver al Dashboard
        </Link>
      </div>

      <CreateVenueForm />

      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Listado de Canchas</h3>
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {venues.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">
              No hay canchas registradas aún.
            </li>
          ) : (
            venues.map((venue) => (
              <VenueListItem key={venue.id} venue={venue} />
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
