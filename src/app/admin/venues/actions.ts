'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createVenue(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  try {
    const name = formData.get('name') as string
    const address = formData.get('address') as string

    if (!name) {
      return { error: 'El nombre de la cancha es requerido.' }
    }

    await prisma.venue.create({
      data: { name, address }
    })

    revalidatePath('/admin/venues')
    return { success: true, message: 'Cancha agregada con éxito.' }
  } catch (error) {
    console.error('Error creating venue:', error)
    return { error: 'Ocurrió un error al crear la cancha.' }
  }
}

export async function updateVenue(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  try {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const address = formData.get('address') as string

    if (!name) {
      return { error: 'El nombre de la cancha es requerido.' }
    }

    await prisma.venue.update({
      where: { id },
      data: { name, address }
    })

    revalidatePath('/admin/venues')
    return { success: true, message: 'Cancha actualizada con éxito.' }
  } catch (error) {
    console.error('Error updating venue:', error)
    return { error: 'Ocurrió un error al actualizar la cancha.' }
  }
}

export async function deleteVenue(id: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  try {
    await prisma.venue.delete({
      where: { id }
    })

    revalidatePath('/admin/venues')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting venue:', error)
    // Prisma throws error if there are relations (e.g. matches assigned to this venue)
    if (error.code === 'P2003') {
      return { error: 'No se puede eliminar la cancha porque hay partidos programados en ella.' }
    }
    return { error: 'Ocurrió un error al eliminar la cancha.' }
  }
}
