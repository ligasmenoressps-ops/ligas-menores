'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StandingsTable from '@/components/StandingsTable';
import { StandingsRow } from '@/lib/standings';

type CategoryStandings = {
  categoryId: string;
  categoryName: string;
  tournamentId: string;
  standings: StandingsRow[];
};

export function StandingsPreviewTabs({ 
  standingsByCategory, 
  compact = true 
}: { 
  standingsByCategory: Record<string, CategoryStandings>,
  compact?: boolean
}) {
  const categories = Object.keys(standingsByCategory);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || '');

  const activeData = standingsByCategory[activeCategory];

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
      <div className="bg-brand-dark px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-black text-white uppercase tracking-wide">Posiciones Destacadas</h2>
        
        {/* Category Selector */}
        <select 
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-1.5 font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>Categoría {cat}</option>
          ))}
        </select>
      </div>

      <div className="p-0 sm:p-2">
        {activeData && activeData.standings.length > 0 ? (
          <StandingsTable standings={activeData.standings} compact={compact} />
        ) : (
          <div className="p-8 text-center text-gray-500 italic">No hay datos de posiciones aún.</div>
        )}
      </div>

      {activeData && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 flex justify-center">
          <Link 
            href={`/tournaments/${activeData.tournamentId}/standings`}
            className="inline-flex items-center justify-center bg-white px-6 py-2 border-2 border-gray-200 hover:border-brand-primary/30 text-gray-700 hover:text-brand-primary font-bold rounded-xl transition-all duration-200 shadow-sm"
          >
            Ver tabla completa de {activeCategory}
          </Link>
        </div>
      )}
    </div>
  );
}
