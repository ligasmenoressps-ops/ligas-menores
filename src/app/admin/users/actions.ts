'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function createUser(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string
  const teamId = formData.get('teamId') as string | null

  if (!name || !email || !password || !role) {
    return { error: 'All fields are required' }
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role as 'ADMIN' | 'DELEGATE',
        teamId: teamId || null,
      }
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    return { error: 'Error creating user (Email might be in use)' }
  }
}
