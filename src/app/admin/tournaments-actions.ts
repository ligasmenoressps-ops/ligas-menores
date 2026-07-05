'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createTournament(prevState: any, formData: FormData) {
  const session = await getSession()
  if (session?.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const categoryId = formData.get('categoryId') as string
  const season = formData.get('season') as string

  if (!name || !categoryId || !season) {
    return { error: 'Todos los campos son obligatorios' }
  }

  try {
    // 1. Create a default format for the new tournament
    const format = await prisma.tournamentFormat.create({
      data: {
        name: 'Formato ' + name,
        bracketConfig: {}
      }
    })

    // 2. Create the tournament
    await prisma.tournament.create({
      data: {
        name,
        categoryId,
        season,
        formatId: format.id,
        status: 'DRAFT'
      }
    })

    revalidatePath('/admin')
    return { success: true, message: 'Torneo creado correctamente' }
  } catch (error) {
    console.error('Error creando torneo:', error)
    return { error: 'Error al crear el torneo' }
  }
}

export async function updateTournament(prevState: any, formData: FormData) {
  const session = await getSession()
  if (session?.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const categoryId = formData.get('categoryId') as string
  const season = formData.get('season') as string

  if (!id || !name || !categoryId || !season) {
    return { error: 'Todos los campos son obligatorios' }
  }

  try {
    await prisma.tournament.update({
      where: { id },
      data: {
        name,
        categoryId,
        season
      }
    })

    revalidatePath('/admin')
    return { success: true, message: 'Torneo actualizado correctamente' }
  } catch (error) {
    console.error('Error actualizando torneo:', error)
    return { error: 'Error al actualizar el torneo' }
  }
}

export async function deleteTournament(id: string) {
  const session = await getSession()
  if (session?.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { matchdays: { include: { matches: true } } }
    })

    if (!tournament) {
      return { error: 'El torneo no existe' }
    }

    // Delete matches (nested within matchdays)
    const matchdayIds = tournament.matchdays.map(m => m.id)
    if (matchdayIds.length > 0) {
      await prisma.match.deleteMany({
        where: { matchdayId: { in: matchdayIds } }
      })
    }

    // Delete Matchdays
    await prisma.matchday.deleteMany({
      where: { tournamentId: id }
    })

    // Delete TournamentTeams
    await prisma.tournamentTeam.deleteMany({
      where: { tournamentId: id }
    })

    // Delete the Tournament
    await prisma.tournament.delete({
      where: { id }
    })
    
    // Opt: Delete the associated format if not used by others? 
    try {
      await prisma.tournamentFormat.delete({
        where: { id: tournament.formatId }
      })
    } catch (e) {
      // Ignore if it fails
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error eliminando torneo:', error)
    return { error: 'Error al eliminar el torneo' }
  }
}
