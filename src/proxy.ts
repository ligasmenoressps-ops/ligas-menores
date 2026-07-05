import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value
  const session = sessionCookie ? await decrypt(sessionCookie) : null

  // Restrict access to /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role-based restriction inside /admin
    if (request.nextUrl.pathname.startsWith('/admin/users') && session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Redirect authenticated users away from login
  if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
