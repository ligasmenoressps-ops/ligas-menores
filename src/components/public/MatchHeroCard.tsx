import React from 'react';
import Link from 'next/link';

export type MatchHeroData = {
  id: string;
  homeTeam: { name: string; logoUrl: string | null };
  awayTeam: { name: string; logoUrl: string | null };
  homeGoals: number | null;
  awayGoals: number | null;
  date: Date;
  venueName: string | null;
  status: 'SCHEDULED' | 'PLAYED' | 'SUSPENDED' | 'POSTPONED';
  isNextMatch: boolean;
};

export type CategoryStatsData = {
  leader: { name: string; logoUrl: string | null } | null;
  matchdaysPlayed: number;
  nextMatchdayName: string | null;
  categorySlug: string;
  tournamentId: string;
};

type MatchHeroCardProps = {
  match: MatchHeroData | null;
  stats: CategoryStatsData;
};

export function MatchHeroCard({ match, stats }: MatchHeroCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Main Match Card */}
      <div className="lg:col-span-2 bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl overflow-hidden shadow-xl text-white p-6 md:p-8 relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg width="240" height="240" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold tracking-widest uppercase mb-4 border border-blue-400/20">
              {match ? (match.isNextMatch ? 'Próximo Partido Destacado' : 'Último Resultado Destacado') : 'Sin Partidos'}
            </span>
          </div>

          {match ? (
            <div className="flex items-center justify-between mt-6 mb-4">
              {/* Home Team */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center p-3 mb-4 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  {match.homeTeam.logoUrl ? (
                    <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-2xl md:text-4xl">
                      {match.homeTeam.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg md:text-2xl text-center line-clamp-2 drop-shadow-md">{match.homeTeam.name}</h3>
              </div>

              {/* Score / VS */}
              <div className="flex flex-col items-center px-2 md:px-6 flex-shrink-0">
                {match.status === 'PLAYED' ? (
                  <div className="text-4xl md:text-7xl font-black tracking-tighter drop-shadow-lg">
                    {match.homeGoals} - {match.awayGoals}
                  </div>
                ) : (
                  <div className="text-3xl md:text-6xl font-black text-blue-400/80 italic drop-shadow-md">VS</div>
                )}
                <div className="text-blue-200 text-xs md:text-sm mt-3 font-semibold text-center uppercase tracking-wider">
                  {new Date(match.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                  {' • '}
                  {new Date(match.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-slate-300 text-[10px] md:text-xs mt-1 uppercase tracking-widest font-medium">
                  {match.venueName || 'Sede por definir'}
                </div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center p-3 mb-4 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  {match.awayTeam.logoUrl ? (
                    <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-2xl md:text-4xl">
                      {match.awayTeam.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg md:text-2xl text-center line-clamp-2 drop-shadow-md">{match.awayTeam.name}</h3>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-12">
              <p className="text-blue-300 text-lg">No hay partidos programados en este torneo.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Block */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full block"></span>
            Estado del Torneo
          </h3>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Líder Actual</p>
                {stats.leader ? (
                  <p className="font-bold text-slate-900 text-lg">{stats.leader.name}</p>
                ) : (
                  <p className="font-medium text-slate-400">Por definir</p>
                )}
              </div>
              {stats.leader?.logoUrl && (
                <img src={stats.leader.logoUrl} alt="Líder" className="w-12 h-12 object-contain drop-shadow-sm" />
              )}
            </div>
            
            <div className="flex items-center justify-between px-2">
              <p className="text-sm font-semibold text-slate-500">Jornadas Jugadas</p>
              <p className="font-black text-slate-900 text-xl">{stats.matchdaysPlayed}</p>
            </div>
            
            <div className="flex items-center justify-between px-2 border-t border-slate-100 pt-5">
              <p className="text-sm font-semibold text-slate-500">Próxima Jornada</p>
              <p className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{stats.nextMatchdayName || 'No programada'}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Link href={`/tournaments/${stats.tournamentId}/standings`} className="flex items-center justify-center w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-bold rounded-xl transition-colors border-2 border-slate-100 hover:border-blue-100">
            Ver tabla completa
          </Link>
        </div>
      </div>
    </div>
  );
}
