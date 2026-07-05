'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Calendar } from 'lucide-react';

export type MatchPreview = {
  id: string;
  homeTeamName: string;
  awayTeamName: string;
  homeGoals: number | null;
  awayGoals: number | null;
  time: Date | null;
  date: Date;
  categoryName: string;
};

export function RecentResultsTabs({ resultsByCategory }: { resultsByCategory: Record<string, MatchPreview[]> }) {
  const categories = Object.keys(resultsByCategory);
  const [activeTab, setActiveTab] = useState<string>('Todas');

  const allResults = Object.values(resultsByCategory).flat().sort((a, b) => {
    const timeA = a.time ? a.time.getTime() : a.date.getTime();
    const timeB = b.time ? b.time.getTime() : b.date.getTime();
    return timeB - timeA;
  }).slice(0, 7);

  const displayedResults = activeTab === 'Todas' 
    ? allResults 
    : resultsByCategory[activeTab]?.slice(0, 7) || [];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-brand-dark px-6 py-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-black text-white uppercase tracking-wide">Últimos Resultados</h2>
      </div>
      
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-100 hide-scrollbar">
        <button
          onClick={() => setActiveTab('Todas')}
          className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'Todas' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Todas
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === cat ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="p-2">
        {displayedResults.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {displayedResults.map(match => (
              <li key={match.id} className="p-3 hover:bg-gray-50 transition-colors rounded-lg flex items-center justify-between group cursor-pointer">
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full">
                    {/* Date/Time */}
                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1 min-w-[100px]">
                      <Calendar className="w-3 h-3" />
                      {match.time 
                        ? new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(match.time) 
                        : new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(match.date)}
                    </div>
                    
                    {/* Teams and Score */}
                    <div className="flex-1 flex items-center justify-center sm:justify-start md:justify-center gap-3">
                      <span className={`text-sm md:text-base font-bold text-right flex-1 truncate ${match.homeGoals! > match.awayGoals! ? 'text-brand-dark' : 'text-gray-600'}`}>{match.homeTeamName}</span>
                      <div className="bg-gray-100 text-brand-dark px-3 py-1 rounded-md font-black text-lg tracking-widest tabular-nums">
                        {match.homeGoals} - {match.awayGoals}
                      </div>
                      <span className={`text-sm md:text-base font-bold text-left flex-1 truncate ${match.awayGoals! > match.homeGoals! ? 'text-brand-dark' : 'text-gray-600'}`}>{match.awayTeamName}</span>
                    </div>

                    {activeTab === 'Todas' && (
                      <div className="hidden lg:block text-xs font-bold text-gray-400 w-[40px] text-right">
                        {match.categoryName}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-primary ml-2 flex-shrink-0" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500 italic">No hay resultados recientes para esta categoría.</div>
        )}
      </div>
      
      {activeTab !== 'Todas' && displayedResults.length > 0 && (
        <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
          <Link href={`/categoria/${activeTab.toLowerCase()}`} className="text-sm font-bold text-brand-primary hover:text-brand-accent transition-colors">
            Ver más resultados de {activeTab} &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
