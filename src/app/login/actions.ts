'use server'

import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { error: 'Invalid credentials' }
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

  if (!isPasswordValid) {
    return { error: 'Invalid credentials' }
  }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    teamId: user.teamId,
  })

  return { success: true }
}
