import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CreateMatchdayForm } from './CreateMatchdayForm'
import { GenerateKnockoutButton } from './GenerateKnockoutButton'
import { GenerateLeagueButton } from './GenerateLeagueButton'
import { DeleteMatchdayButton } from './DeleteMatchdayButton'

export default async function MatchdaysPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      matchdays: {
        orderBy: { number: 'asc' },
        include: {
          matches: true
        }
      }
    }
  })

  if (!tournament) return <div>Torneo no encontrado</div>

  const nextNumber = tournament.matchdays.length > 0 
    ? Math.max(...tournament.matchdays.map(m => m.number)) + 1 
    : 1

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center space-x-4 mb-4">
        <Link href="/admin" className="text-gray-500 hover:text-gray-700">
          &larr; Volver
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Jornadas: {tournament.name} ({tournament.category.name})
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona las jornadas y programa los partidos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CreateMatchdayForm tournamentId={tournament.id} nextNumber={nextNumber} />
        
        <GenerateLeagueButton tournamentId={tournament.id} />
        
        {tournament.matchdays.length > 0 && (
          <GenerateKnockoutButton tournamentId={tournament.id} />
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {tournament.matchdays.map((md) => {
            const totalMatches = md.matches.length
            const playedMatches = md.matches.filter(m => m.status === 'PLAYED').length

            const isKnockout = md.matches.some(m => m.phase !== 'GROUP_STAGE')
            const phaseName = isKnockout ? md.matches.find(m => m.phase !== 'GROUP_STAGE')?.phase : null
            const displayTitle = isKnockout && phaseName ? phaseName : `Jornada ${md.number}`
            const shortTitle = isKnockout ? 'Elim' : `J${md.number}`

            return (
              <li key={md.id}>
                <Link href={`/admin/tournaments/${tournament.id}/matchdays/${md.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold text-xs px-1 text-center">
                          {shortTitle}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900 capitalize">{displayTitle}</h4>
                        <p className="text-sm text-gray-500">Fecha: {new Date(md.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex flex-col items-end mr-4">
                        <span className="text-sm text-gray-500">{totalMatches} partidos programados</span>
                        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full mt-1">
                          {playedMatches} jugados
                        </span>
                      </div>
                      <DeleteMatchdayButton matchdayId={md.id} tournamentId={tournament.id} />
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
        {tournament.matchdays.length === 0 && (
          <div className="p-6 text-center text-gray-500">No hay jornadas creadas aún.</div>
        )}
      </div>
    </div>
  )
}
