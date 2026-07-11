import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DrawButton from './DrawButton'

export default async function DrawPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    redirect('/login')
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      teams: {
        include: { team: true },
        orderBy: { team: { name: 'asc' } }
      }
    }
  })

  if (!tournament) {
    return <div>Torneo no encontrado</div>
  }

  const hasExistingDraw = tournament.teams.some(t => t.assignedNumber !== null)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Sorteo de Equipos: {tournament.name} ({tournament.category.name})
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Asigna un número único a cada equipo inscrito. Este número se utilizará para generar el calendario de juegos.
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {tournament.teams.map((tournamentTeam) => (
            <li key={tournamentTeam.id}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center">
                    {tournamentTeam.team.logoUrl ? (
                      <Image src={tournamentTeam.team.logoUrl} width={32} height={32} className="w-8 h-8 rounded-full" alt="logo" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
                    )}
                    <p className="ml-3 font-medium text-blue-600 truncate">{tournamentTeam.team.name}</p>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                    <div className="flex -space-x-1 overflow-hidden">
                      {tournamentTeam.assignedNumber ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                          Número {tournamentTeam.assignedNumber}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          Sin asignar
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <DrawButton tournamentId={tournament.id} hasExistingDraw={hasExistingDraw} />
    </div>
  )
}
