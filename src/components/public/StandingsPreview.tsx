import React from 'react';
import Link from 'next/link';
import StandingsTable from '@/components/StandingsTable';
import { StandingsRow } from '@/lib/standings';

type StandingsPreviewProps = {
  standings: StandingsRow[];
  categorySlug: string;
  tournamentId: string;
};

export function StandingsPreview({ standings, categorySlug, tournamentId }: StandingsPreviewProps) {
  // Solo mostramos el top 5
  const top5 = standings.slice(0, 5);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full block"></span>
          Posiciones
        </h2>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-0 sm:p-2">
          <StandingsTable standings={top5} qualifiedCount={0} />
        </div>
        
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex justify-center">
          <Link 
            href={`/tournaments/${tournamentId}/standings`}
            className="inline-flex items-center justify-center bg-white px-6 py-2.5 border-2 border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-600 font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow"
          >
            Ver tabla completa
          </Link>
        </div>
      </div>
    </div>
  );
}
