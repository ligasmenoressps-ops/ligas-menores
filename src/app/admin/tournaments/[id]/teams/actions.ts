'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function enrollTeam(prevState: any, formData: FormData) {
  const session = await getSession()
  if (session?.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const tournamentId = formData.get('tournamentId') as string
  const teamId = formData.get('teamId') as string

  if (!tournamentId || !teamId) {
    return { error: 'El torneo y el equipo son obligatorios' }
  }

  try {
    // Check if team is already enrolled
    const existing = await prisma.tournamentTeam.findUnique({
      where: {
        tournamentId_teamId: {
          tournamentId,
          teamId
        }
      }
    })

    if (existing) {
      return { error: 'El equipo ya está inscrito en este torneo' }
    }

    await prisma.tournamentTeam.create({
      data: {
        tournamentId,
        teamId
      }
    })

    revalidatePath(`/admin/tournaments/${tournamentId}/teams`)
    return { success: true, message: 'Equipo inscrito correctamente' }
  } catch (error) {
    console.error('Error inscribiendo equipo:', error)
    return { error: 'Error al inscribir el equipo' }
  }
}

export async function unenrollTeam(tournamentTeamId: string, tournamentId: string) {
  const session = await getSession()
  if (session?.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    // Check if the team has matches in this tournament
    // Currently, a team with matches should not be easily deleted. 
    // We could either block it or delete their matches. For now, block it.
    const tournamentTeam = await prisma.tournamentTeam.findUnique({
      where: { id: tournamentTeamId }
    })

    if (!tournamentTeam) return { error: 'No se encontró la inscripción' }

    const matches = await prisma.match.findFirst({
      where: {
        matchday: { tournamentId },
        OR: [
          { homeTeamId: tournamentTeam.teamId },
          { awayTeamId: tournamentTeam.teamId }
        ]
      }
    })

    if (matches) {
      return { error: 'No se puede remover el equipo porque ya tiene partidos programados en este torneo.' }
    }

    await prisma.tournamentTeam.delete({
      where: { id: tournamentTeamId }
    })

    revalidatePath(`/admin/tournaments/${tournamentId}/teams`)
    return { success: true }
  } catch (error) {
    console.error('Error removiendo equipo:', error)
    return { error: 'Error al remover el equipo' }
  }
}
