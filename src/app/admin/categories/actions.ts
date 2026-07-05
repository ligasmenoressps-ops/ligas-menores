'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateCategory(id: string, newName: string) {
  const session = await getSession()
  if (session?.role !== 'ADMIN') {
    return { error: 'No autorizado' }
  }

  if (!newName.trim()) {
    return { error: 'El nombre no puede estar vacío' }
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { name: newName.trim() }
    })
    
    revalidatePath('/admin/categories')
    revalidatePath('/admin/teams')
    revalidatePath('/admin')
    
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Error al actualizar la categoría. Quizás el nombre ya existe.' }
  }
}
