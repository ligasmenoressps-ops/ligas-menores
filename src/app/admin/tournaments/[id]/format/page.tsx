import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import FormatConfigForm from './FormatConfigForm'
import { TournamentFormatConfig } from '@/lib/brackets'
import Link from 'next/link'

export default async function FormatConfigPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    redirect('/login')
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      format: true
    }
  })

  if (!tournament) {
    return <div>Torneo no encontrado</div>
  }

  // Parse existing config if it exists
  let existingConfig: TournamentFormatConfig | null = null
  if (tournament.format?.bracketConfig) {
    existingConfig = tournament.format.bracketConfig as unknown as TournamentFormatConfig
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-4">
        <Link href="/admin" className="text-gray-500 hover:text-gray-700">
          &larr; Volver
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Configuración de Formato: {tournament.name} ({tournament.category.name})
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Define las reglas de clasificación y las rondas eliminatorias para este torneo.
        </p>
      </div>

      <FormatConfigForm 
        key={tournament.format?.updatedAt?.toString() || 'new'} 
        tournamentId={tournament.id} 
        existingConfig={existingConfig} 
      />
    </div>
  )
}
