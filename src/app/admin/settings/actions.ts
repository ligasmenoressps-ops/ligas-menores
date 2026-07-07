'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function getSettings() {
  const settings = await prisma.systemSettings.findFirst()
  return settings
}

export async function updateSettings(formData: FormData) {
  try {
    const appName = formData.get('appName') as string
    const heroSubtitle = formData.get('heroSubtitle') as string
    const logoFile = formData.get('logo') as File | null

    let logoUrl: string | undefined = undefined

    if (logoFile && logoFile.size > 0) {
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `global-logo-${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('team-logos') // We reuse this bucket to avoid extra config
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading logo:', error)
        throw new Error('No se pudo subir el logo')
      }

      const { data: publicUrlData } = supabase.storage
        .from('team-logos')
        .getPublicUrl(fileName)

      logoUrl = publicUrlData.publicUrl
    }

    const currentSettings = await prisma.systemSettings.findFirst()

    if (currentSettings) {
      await prisma.systemSettings.update({
        where: { id: currentSettings.id },
        data: {
          appName,
          heroSubtitle,
          ...(logoUrl && { appLogoUrl: logoUrl })
        }
      })
    } else {
      await prisma.systemSettings.create({
        data: {
          appName,
          heroSubtitle,
          ...(logoUrl && { appLogoUrl: logoUrl })
        }
      })
    }

    revalidatePath('/')
    revalidatePath('/admin/settings')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to update settings:', error)
    return { success: false, error: 'Failed to update settings' }
  }
}
