import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EnrollTeamForm from './EnrollTeamForm'
import EnrolledTeamList from './EnrolledTeamList'

export default async function TournamentTeamsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const { id } = resolvedParams

  const session = await getSession()
  if (session?.role !== 'ADMIN') {
    redirect('/admin')
  }

  // Fetch the tournament
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      category: true,
      teams: {
        include: {
          team: true
        },
        orderBy: {
          team: { name: 'asc' }
        }
      }
    }
  })

  if (!tournament) {
    redirect('/admin')
  }

  // Fetch teams that are in the SAME category but NOT enrolled yet
  const enrolledTeamIds = tournament.teams.map(t => t.teamId)
  
  const availableTeams = await prisma.team.findMany({
    where: {
      categoryId: tournament.categoryId,
      id: {
        notIn: enrolledTeamIds
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin" className="text-blue-600 hover:underline">
          &larr; Volver
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          Equipos Inscritos: {tournament.name} <span className="text-gray-500 text-lg">({tournament.category.name})</span>
        </h1>
      </div>

      <EnrollTeamForm tournamentId={tournament.id} availableTeams={availableTeams} />

      <EnrolledTeamList tournamentId={tournament.id} enrolledTeams={tournament.teams} />
    </div>
  )
}
