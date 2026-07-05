import { prisma } from '@/lib/prisma'

export default async function PublicTeamsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      teams: {
        include: { team: true },
        orderBy: { team: { name: 'asc' } }
      }
    }
  })

  if (!tournament) return <div>Torneo no encontrado</div>

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900">Equipos Participantes</h3>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {tournament.teams.map((tTeam) => (
          <div key={tTeam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
            {tTeam.team.logoUrl ? (
              <img src={tTeam.team.logoUrl} alt={tTeam.team.name} className="w-24 h-24 object-contain mb-4" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-gray-400 text-sm font-medium">Sin Logo</span>
              </div>
            )}
            <h4 className="text-sm font-bold text-gray-900 text-center">{tTeam.team.name}</h4>
          </div>
        ))}
      </div>
      
      {tournament.teams.length === 0 && (
        <div className="text-gray-500 bg-white p-6 rounded-lg shadow text-center">
          No hay equipos inscritos en este torneo.
        </div>
      )}
    </div>
  )
}
