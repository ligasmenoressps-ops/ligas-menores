'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'

export async function updateTeam(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const teamId = formData.get('teamId') as string
  const name = formData.get('name') as string
  const logoFile = formData.get('logo') as File | null

  if (!teamId || !name) {
    return { error: 'El nombre del equipo es obligatorio' }
  }

  // Verificar permisos: Admin puede editar cualquiera, Delegado solo su equipo
  if (session.role !== 'ADMIN' && session.teamId !== teamId) {
    return { error: 'No tienes permiso para editar este equipo' }
  }

  try {
    let newLogoUrl: string | undefined = undefined

    if (logoFile && logoFile.size > 0) {
      // Validaciones básicas
      if (!logoFile.type.startsWith('image/')) {
        return { error: 'El archivo debe ser una imagen' }
      }
      if (logoFile.size > 2 * 1024 * 1024) {
        return { error: 'La imagen no debe pesar más de 2MB' }
      }

      const extension = logoFile.name.split('.').pop()
      const fileName = `team-${teamId}-${Date.now()}.${extension}`
      
      const { data, error } = await supabaseAdmin.storage
        .from('team-logos')
        .upload(fileName, logoFile, {
          contentType: logoFile.type,
          upsert: false
        })

      if (error) {
        console.error('Supabase upload error:', error)
        return { error: 'Error al subir la imagen a la nube' }
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('team-logos')
        .getPublicUrl(fileName)

      newLogoUrl = publicUrlData.publicUrl
    }

    // Actualizar en DB
    await prisma.team.update({
      where: { id: teamId },
      data: {
        name,
        ...(newLogoUrl && { logoUrl: newLogoUrl }),
      }
    })

    if (session.role === 'ADMIN') {
      const delegateId = formData.get('delegateId') as string | null
      
      // Limpiar delegado anterior
      await prisma.user.updateMany({
        where: { teamId, role: 'DELEGATE' },
        data: { teamId: null }
      })

      // Asignar nuevo si existe
      if (delegateId) {
        await prisma.user.update({
          where: { id: delegateId },
          data: { teamId }
        })
      }
    }

    // Revalidar rutas para actualizar UI
    revalidatePath('/admin/teams')
    revalidatePath('/categorias/u13/tabla')
    // TODO: Revalidar cualquier otra ruta de tabla pública

    return { success: true, message: 'Equipo actualizado correctamente' }
  } catch (error) {
    console.error('Error actualizando equipo:', error)
    return { error: 'Ocurrió un error al guardar' }
  }
}

export async function createTeam(prevState: any, formData: FormData) {
  const session = await getSession()
  if (session?.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const categoryId = formData.get('categoryId') as string

  if (!name || !categoryId) {
    return { error: 'El nombre y la categoría son obligatorios' }
  }

  try {
    await prisma.team.create({
      data: {
        name,
        categoryId
      }
    })

    revalidatePath('/admin/teams')
    revalidatePath('/admin/categories')
    
    return { success: true, message: 'Equipo creado correctamente' }
  } catch (error) {
    console.error('Error creando equipo:', error)
    return { error: 'Ocurrió un error al crear el equipo' }
  }
}

