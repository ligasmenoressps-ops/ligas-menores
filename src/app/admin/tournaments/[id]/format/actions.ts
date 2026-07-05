'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function saveFormat(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    const tournamentId = formData.get('tournamentId') as string
    
    // Parse main fields
    const groupStage = formData.get('groupStage') as string
    const qualifiersCount = parseInt(formData.get('qualifiersCount') as string)
    const directToSemisCount = parseInt(formData.get('directToSemisCount') as string)
    const preliminaryRoundCount = parseInt(formData.get('preliminaryRoundCount') as string)
    
    // Build knockoutRounds array from form data
    const knockoutRounds = []
    
    // Cuartos de final
    if (preliminaryRoundCount > 0) {
      knockoutRounds.push({
        name: 'Cuartos de Final',
        legs: formData.get('qf_legs') as string,
        tiebreaker: formData.get('qf_tiebreaker') as string
      })
    }

    // Semifinales y Final (siempre se asume que existen si hay fase de eliminación)
    if (qualifiersCount > 0) {
      knockoutRounds.push({
        name: 'Semifinales',
        legs: formData.get('sf_legs') as string,
        tiebreaker: formData.get('sf_tiebreaker') as string
      })
      knockoutRounds.push({
        name: 'Final',
        legs: formData.get('final_legs') as string,
        tiebreaker: formData.get('final_tiebreaker') as string
      })
    }

    const hasFinalisima = formData.get('hasFinalisima') === 'on'

    const formatConfig = {
      groupStage,
      qualifiersCount,
      directToSemisCount,
      preliminaryRoundCount,
      knockoutRounds,
      hasFinalisima
    }

    // validations
    if (directToSemisCount + preliminaryRoundCount !== qualifiersCount) {
      return { error: 'Los pases directos más los pases a ronda previa deben sumar el total de clasificados.' }
    }

    if (preliminaryRoundCount % 2 !== 0) {
      return { error: 'La cantidad de equipos en la ronda previa debe ser par para poder armar cruces.' }
    }

    // Check if tournament already has a format
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { format: true }
    })

    if (tournament?.format) {
      // Update existing format
      await prisma.tournamentFormat.update({
        where: { id: tournament.format.id },
        data: {
          bracketConfig: formatConfig as any
        }
      })
    } else {
      // Create new format and link
      const newFormat = await prisma.tournamentFormat.create({
        data: {
          name: `Formato Personalizado - ${tournament?.name}`,
          bracketConfig: formatConfig as any
        }
      })
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { formatId: newFormat.id }
      })
    }

    revalidatePath(`/admin/tournaments/${tournamentId}/format`)

    return { success: true, message: 'Configuración de formato guardada correctamente.' }
  } catch (error) {
    console.error('Error saving format:', error)
    return { error: 'Ocurrió un error al guardar la configuración.' }
  }
}
