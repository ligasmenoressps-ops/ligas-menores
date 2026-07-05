'use client'

import React, { useState } from 'react'
import { StandingsRow } from '@/lib/standings'
import { ChevronDown, ChevronUp } from 'lucide-react'

type StandingsTableProps = {
  standings: StandingsRow[]
  qualifiedCount?: number
  compact?: boolean
}

const FormIcon = ({ result }: { result: 'G' | 'E' | 'P' }) => {
  const bgColor = 
    result === 'G' ? 'bg-green-500' :
    result === 'E' ? 'bg-gray-400' :
    'bg-red-500'
  
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold ${bgColor}`}>
      {result}
    </span>
  )
}

export default function StandingsTable({ standings, qualifiedCount = 0, compact = false }: StandingsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const toggleRow = (teamId: string) => {
    setExpandedRow(expandedRow === teamId ? null : teamId)
  }

  return (
    <div id="standings-table-container" className="w-full bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs uppercase bg-brand-dark text-gray-100 border-b">
            <tr>
              <th scope="col" className="px-4 py-3 w-10 text-center">Pos</th>
              <th scope="col" className="px-4 py-3">Equipo</th>
              <th scope="col" className="px-3 py-3 text-center">PJ</th>
              {!compact && (
                <>
                  <th scope="col" className="px-3 py-3 text-center hidden md:table-cell">PG</th>
                  <th scope="col" className="px-3 py-3 text-center hidden md:table-cell">PE</th>
                  <th scope="col" className="px-3 py-3 text-center hidden md:table-cell">PP</th>
                  <th scope="col" className="px-3 py-3 text-center hidden md:table-cell">GF</th>
                  <th scope="col" className="px-3 py-3 text-center hidden md:table-cell">GC</th>
                </>
              )}
              <th scope="col" className="px-3 py-3 text-center">DG</th>
              <th scope="col" className="px-3 py-3 text-center font-bold">Pts</th>
              {!compact && (
                <>
                  <th scope="col" className="px-4 py-3 text-center hidden lg:table-cell">Forma</th>
                  <th scope="col" className="px-2 py-3 text-center md:hidden"></th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {standings.map((row, index) => {
              const isExpanded = expandedRow === row.teamId
              const isQualified = qualifiedCount > 0 && index < qualifiedCount
              
              return (
                <React.Fragment key={row.teamId}>
                  <tr 
                    className={`border-b odd:bg-white even:bg-gray-50 hover:bg-brand-primary/5 transition-colors cursor-pointer md:cursor-default ${isQualified ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-transparent'}`}
                    onClick={() => {
                      // Solo expandir en mobile
                      if (window.innerWidth < 768) toggleRow(row.teamId)
                    }}
                  >
                    <td className="px-4 py-4 text-center font-semibold">
                      {row.position}
                    </td>
                    <td className="px-4 py-4 font-medium text-brand-dark whitespace-nowrap flex items-center space-x-3">
                      {row.logoUrl ? (
                        <img src={row.logoUrl} alt={`${row.teamName} logo`} className="w-6 h-6 object-contain" />
                      ) : (
                        <div className="w-6 h-6 bg-gray-200 rounded-full" />
                      )}
                      <span>{row.teamName}</span>
                    </td>
                    <td className="px-3 py-4 text-center">{row.played}</td>
                    {!compact && (
                      <>
                        <td className="px-3 py-4 text-center hidden md:table-cell">{row.won}</td>
                        <td className="px-3 py-4 text-center hidden md:table-cell">{row.drawn}</td>
                        <td className="px-3 py-4 text-center hidden md:table-cell">{row.lost}</td>
                        <td className="px-3 py-4 text-center hidden md:table-cell">{row.goalsFor}</td>
                        <td className="px-3 py-4 text-center hidden md:table-cell">{row.goalsAgainst}</td>
                      </>
                    )}
                    <td className="px-3 py-4 text-center">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                    <td className="px-3 py-4 text-center font-bold text-brand-dark">{row.points}</td>
                    {!compact && (
                      <>
                        <td className="px-4 py-4 text-center hidden lg:table-cell">
                          <div className="flex items-center justify-center space-x-1">
                            {row.recentForm.length > 0 ? (
                              row.recentForm.map((result, i) => <FormIcon key={i} result={result} />)
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-4 text-center md:hidden text-gray-400">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </td>
                      </>
                    )}
                  </tr>
                  
                  {/* Expanded Row for Mobile */}
                  {!compact && isExpanded && (
                    <tr className="md:hidden bg-brand-primary/5 border-b">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-gray-500">Partidos Ganados:</span>
                            <span className="font-medium">{row.won}</span>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-gray-500">Goles a Favor:</span>
                            <span className="font-medium">{row.goalsFor}</span>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-gray-500">Partidos Empatados:</span>
                            <span className="font-medium">{row.drawn}</span>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-gray-500">Goles en Contra:</span>
                            <span className="font-medium">{row.goalsAgainst}</span>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-gray-500">Partidos Perdidos:</span>
                            <span className="font-medium">{row.lost}</span>
                          </div>
                          <div className="flex items-center justify-between col-span-2 pt-1">
                            <span className="text-gray-500">Forma Reciente:</span>
                            <div className="flex items-center space-x-1">
                              {row.recentForm.length > 0 ? (
                                row.recentForm.map((result, i) => <FormIcon key={i} result={result} />)
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
