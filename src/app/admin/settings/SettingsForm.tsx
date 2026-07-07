'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateSettings } from './actions'
import { Save, Loader2, Image as ImageIcon, Upload } from 'lucide-react'

export function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialSettings?.appLogoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const formData = new FormData(e.currentTarget)
      const res = await updateSettings(formData)
      if (res.success) {
        router.refresh()
      } else {
        alert(res.error || 'Hubo un error al guardar.')
      }
    } catch (error) {
      console.error(error)
      alert('Error inesperado')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Aplicación</label>
          <input
            type="text"
            name="appName"
            defaultValue={initialSettings?.appName || 'Ligas Menores'}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">Este nombre aparecerá en la cabecera y en el título principal de la portada.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Subtítulo de la Portada</label>
          <textarea
            name="heroSubtitle"
            defaultValue={initialSettings?.heroSubtitle || 'Sigue de cerca a las futuras estrellas del fútbol.'}
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">Breve descripción que se mostrará debajo del título en la página principal.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Logo Global</label>
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 relative group">
              {previewUrl ? (
                <img src={previewUrl} alt="Logo preview" className="w-full h-full object-contain p-2" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
              <div 
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <input
                type="file"
                name="logo"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Seleccionar nuevo logo
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Recomendamos una imagen cuadrada en formato PNG con fondo transparente. 
                Si no subes ninguna, se usará el logo por defecto o las iniciales del nombre de la app.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center px-6 py-2.5 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </form>
  )
}
