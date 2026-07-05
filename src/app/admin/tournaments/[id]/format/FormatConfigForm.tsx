'use client'

import { useActionState, useState } from 'react'
import { saveFormat } from './actions'
import { TournamentFormatConfig, KnockoutRoundConfig } from '@/lib/brackets'

type Props = {
  tournamentId: string
  existingConfig: TournamentFormatConfig | null
}

const defaultRoundConfig: KnockoutRoundConfig = {
  name: '',
  legs: 'SINGLE',
  tiebreaker: 'PENALTIES'
}

export default function FormatConfigForm({ tournamentId, existingConfig }: Props) {
  const [state, formAction, isPending] = useActionState(saveFormat, null)
  
  const [qualifiers, setQualifiers] = useState(existingConfig?.qualifiersCount ?? 6)
  const [directToSemis, setDirectToSemis] = useState(existingConfig?.directToSemisCount ?? 2)
  const [preliminary, setPreliminary] = useState(existingConfig?.preliminaryRoundCount ?? 4)

  const getRoundConfig = (name: string) => {
    if (!existingConfig) return defaultRoundConfig
    return existingConfig.knockoutRounds?.find(r => r.name === name) || defaultRoundConfig
  }

  const qfConfig = getRoundConfig('Cuartos de Final')
  const sfConfig = getRoundConfig('Semifinales')
  const finalConfig = getRoundConfig('Final')

  return (
    <form action={formAction} className="space-y-8 bg-white p-6 rounded-lg shadow border border-gray-200">
      <input type="hidden" name="tournamentId" value={tournamentId} />

      {state?.error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 text-sm text-green-700">
          {state.message}
        </div>
      )}

      {/* Fase de Grupos */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Fase de Grupos</h3>
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad de Partidos</label>
          <select 
            name="groupStage" 
            defaultValue={existingConfig?.groupStage || 'SINGLE'}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="SINGLE">Solo Ida</option>
            <option value="DOUBLE">Ida y Vuelta</option>
          </select>
        </div>
      </section>

      {/* Clasificación */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Clasificación a Eliminatorias</h3>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Clasificados</label>
            <input 
              type="number" 
              name="qualifiersCount" 
              value={qualifiers}
              onChange={(e) => setQualifiers(parseInt(e.target.value) || 0)}
              min="0"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Directo a Semifinales</label>
            <input 
              type="number" 
              name="directToSemisCount" 
              value={directToSemis}
              onChange={(e) => setDirectToSemis(parseInt(e.target.value) || 0)}
              min="0"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Juegan Ronda Previa (Cuartos)</label>
            <input 
              type="number" 
              name="preliminaryRoundCount" 
              value={preliminary}
              onChange={(e) => setPreliminary(parseInt(e.target.value) || 0)}
              min="0"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
            />
          </div>
        </div>
      </section>

      {/* Reglas de Eliminatorias */}
      {qualifiers > 0 && (
        <section>
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Reglas de Fases Eliminatorias</h3>
          
          <div className="space-y-6">
            {/* Cuartos de final */}
            {preliminary > 0 && (
              <div className="bg-gray-50 p-4 rounded-md border">
                <h4 className="font-medium text-gray-800 mb-3">Ronda Previa (Cuartos)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Partidos</label>
                    <select name="qf_legs" defaultValue={qfConfig.legs} className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md text-sm">
                      <option value="SINGLE">Partido Único</option>
                      <option value="DOUBLE">Ida y Vuelta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Desempate</label>
                    <select name="qf_tiebreaker" defaultValue={qfConfig.tiebreaker} className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md text-sm">
                      <option value="PENALTIES">Penales Directo</option>
                      <option value="AWAY_GOALS">Gol de Visitante</option>
                      <option value="GLOBAL">Resultado Global</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Semifinales */}
            <div className="bg-gray-50 p-4 rounded-md border">
              <h4 className="font-medium text-gray-800 mb-3">Semifinales</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Partidos</label>
                  <select name="sf_legs" defaultValue={sfConfig.legs} className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md text-sm">
                    <option value="SINGLE">Partido Único</option>
                    <option value="DOUBLE">Ida y Vuelta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Desempate</label>
                  <select name="sf_tiebreaker" defaultValue={sfConfig.tiebreaker} className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md text-sm">
                    <option value="PENALTIES">Penales Directo</option>
                    <option value="AWAY_GOALS">Gol de Visitante</option>
                    <option value="GLOBAL">Resultado Global</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Final */}
            <div className="bg-gray-50 p-4 rounded-md border">
              <h4 className="font-medium text-gray-800 mb-3">Final</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Partidos</label>
                  <select name="final_legs" defaultValue={finalConfig.legs} className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md text-sm">
                    <option value="SINGLE">Partido Único</option>
                    <option value="DOUBLE">Ida y Vuelta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Desempate</label>
                  <select name="final_tiebreaker" defaultValue={finalConfig.tiebreaker} className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md text-sm">
                    <option value="PENALTIES">Penales Directo</option>
                    <option value="AWAY_GOALS">Gol de Visitante</option>
                    <option value="GLOBAL">Resultado Global</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Finalísima */}
            <div className="bg-gray-50 p-4 rounded-md border">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="hasFinalisima"
                    name="hasFinalisima"
                    type="checkbox"
                    defaultChecked={existingConfig?.hasFinalisima}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="hasFinalisima" className="font-medium text-gray-700">
                    Requiere Finalísima
                  </label>
                  <p className="text-gray-500">
                    Activar si es necesario jugar un partido adicional en caso de que el ganador de la fase regular sea diferente al campeón de las eliminatorias.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-6 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </form>
  )
}
