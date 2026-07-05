import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EditTeamForm from './EditTeamForm'
import { Team, Category, User } from '@prisma/client'
import CategoryFilter from './CategoryFilter'
import CreateTeamForm from './CreateTeamForm'

type TeamWithCategory = Team & { category: Category, users: User[] }

export default async function AdminTeamsPage(props: { searchParams: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams
  const selectedCategory = searchParams.category || 'all'
  
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  // Fetch teams based on role
  let teams: TeamWithCategory[] = []
  if (session.role === 'ADMIN') {
    teams = await prisma.team.findMany({
      include: { category: true, users: true },
      orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }]
    })
  } else if (session.teamId) {
    const team = await prisma.team.findUnique({
      where: { id: session.teamId },
      include: { category: true, users: true }
    })
    if (team) teams = [team]
  }

  const delegates = await prisma.user.findMany({
    where: { role: 'DELEGATE' },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true }
  })

  // Todas las categorías (para el form de crear)
  const allCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  // Get unique categories for the dropdown filter (only categories that have teams)
  const categoryNamesWithTeams = Array.from(new Set(teams.map(t => t.category.name)))

  // Filter teams if a specific category is selected
  const filteredTeams = selectedCategory === 'all' 
    ? teams 
    : teams.filter(t => t.category.name === selectedCategory)

  // Agrupar por categoría
  const groupedTeams = filteredTeams.reduce((acc, team) => {
    const cat = team.category.name
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(team)
    return acc
  }, {} as Record<string, typeof teams>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Equipos</h1>
      </div>

      {session.role === 'ADMIN' && (
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Añadir Nuevo Equipo</h3>
          <CreateTeamForm categories={allCategories} />
        </div>
      )}

      {categoryNamesWithTeams.length > 0 && (
        <CategoryFilter categories={categoryNamesWithTeams} />
      )}

      {Object.entries(groupedTeams).length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          No tienes equipos asignados o no hay equipos en esta categoría.
        </div>
      ) : (
        Object.entries(groupedTeams).map(([categoryName, categoryTeams]) => (
          <div key={categoryName} className="space-y-4">
            <h2 className="text-xl font-medium text-gray-800 border-b pb-2">Categoría {categoryName}</h2>
            <div className="grid grid-cols-1 gap-6">
              {categoryTeams.map(team => (
                <EditTeamForm key={team.id} team={team} delegates={delegates} isAdmin={session.role === 'ADMIN'} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
