'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function performDraw(tournamentId: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      where: { tournamentId },
      include: { team: true },
    })

    if (tournamentTeams.length === 0) {
      return { error: 'No hay equipos inscritos en este torneo' }
    }

    // Algoritmo Fisher-Yates para barajar (shuffle)
    const shuffledTeams = [...tournamentTeams]
    for (let i = shuffledTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledTeams[i], shuffledTeams[j]] = [shuffledTeams[j], shuffledTeams[i]]
    }

    // Actualizar con transacciones
    await prisma.$transaction(
      shuffledTeams.map((tTeam, index) => 
        prisma.tournamentTeam.update({
          where: { id: tTeam.id },
          data: { assignedNumber: index + 1 },
        })
      )
    )

    revalidatePath(`/admin/tournaments/${tournamentId}/draw`)
    revalidatePath(`/categorias/u13/sorteo`) // En un caso real haríamos esto dinámico o revalidaríamos todo

    return { success: true, message: 'Sorteo realizado con éxito' }
  } catch (error) {
    console.error('Error realizando sorteo:', error)
    return { error: 'Ocurrió un error al realizar el sorteo' }
  }
}
