import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { logout } from './actions'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin" className="text-xl font-bold text-blue-600">
                  Admin Ligas Menores
                </Link>
              </div>
              <nav className="ml-6 flex space-x-8">
                <Link
                  href="/admin"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                {session.role === 'ADMIN' && (
                  <div className="relative group flex items-center h-full">
                    <button className="border-transparent text-gray-500 group-hover:border-gray-300 group-hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full">
                      Configuración
                    </button>
                    <div className="absolute top-full left-0 hidden group-hover:block w-48 z-50 pt-1">
                      <div className="bg-white shadow-lg rounded-md border border-gray-200 py-1">
                        <Link href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                          Ajustes Generales
                        </Link>
                        <Link href="/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                          Usuarios
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                {session.role === 'ADMIN' && (
                  <Link
                    href="/admin/categories"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Categorías
                  </Link>
                )}
                <Link
                  href="/admin/teams"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Equipos
                </Link>
                {session.role === 'ADMIN' && (
                  <Link
                    href="/admin/venues"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Canchas
                  </Link>
                )}
              </nav>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                Hola, {session.name} ({session.role})
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Cerrar Sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
