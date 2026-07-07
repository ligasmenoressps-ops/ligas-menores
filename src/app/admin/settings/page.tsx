import { getSettings } from './actions'
import { SettingsForm } from './SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Configuración Global</h1>
      </div>

      <div className="text-gray-600 mb-4 max-w-2xl">
        Aquí puedes personalizar la información principal de la plataforma, como el nombre de la liga, el logo que aparece en la cabecera y el texto de presentación de la portada.
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  )
}
