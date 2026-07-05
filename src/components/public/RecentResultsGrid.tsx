import React from 'react';
import Link from 'next/link';

import { MatchSummary } from '@/lib/types';
import { formatMatchDate } from '@/lib/format';

type RecentResultsGridProps = {
  matches: MatchSummary[];
  categorySlug: string;
  tournamentId: string;
};

export function RecentResultsGrid({ matches, categorySlug, tournamentId }: RecentResultsGridProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full block"></span>
          Últimos Resultados
        </h2>
        <Link 
          href={`/tournaments/${tournamentId}/calendar`}
          className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg"
        >
          Ver todos
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
          <p className="text-slate-500 font-medium">No hay resultados recientes en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <Link 
              key={match.id} 
              href={`/tournaments/${tournamentId}/calendar`} // Optionally add ?jornada=${match.matchdayNumber}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 p-5 group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
                <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600">Jornada {match.matchdayNumber}</span>
                <span>{formatMatchDate(match.date, match.time, 'short')}</span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                {/* Home */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center p-1.5 border border-slate-100 flex-shrink-0">
                    {match.homeTeam.logoUrl ? (
                      <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-slate-400 font-bold text-xs">{match.homeTeam.name.substring(0,2).toUpperCase()}</div>
                    )}
                  </div>
                  <span className="font-bold text-slate-800 truncate" title={match.homeTeam.name}>
                    {match.homeTeam.name}
                  </span>
                </div>
                {/* Goals */}
                <div className="font-black text-2xl text-slate-800 w-10 text-center">
                  {match.homeGoals}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                {/* Away */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center p-1.5 border border-slate-100 flex-shrink-0">
                    {match.awayTeam.logoUrl ? (
                      <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-slate-400 font-bold text-xs">{match.awayTeam.name.substring(0,2).toUpperCase()}</div>
                    )}
                  </div>
                  <span className="font-bold text-slate-800 truncate" title={match.awayTeam.name}>
                    {match.awayTeam.name}
                  </span>
                </div>
                {/* Goals */}
                <div className="font-black text-2xl text-slate-800 w-10 text-center">
                  {match.awayGoals}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-between mt-auto">
                <span className="truncate pr-4">{match.venueName || 'Sede por definir'}</span>
                <span className="text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 transform group-hover:translate-x-0 translate-x-2 duration-300">Detalle &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
