import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, MapPin, Trophy, ChevronRight } from 'lucide-react';

export default async function CalendarioPage() {
  const now = new Date();
  
  const upcomingMatches = await prisma.match.findMany({
    where: { 
      status: 'SCHEDULED',
      time: { gte: now }
    },
    orderBy: { time: 'asc' },
    take: 50,
    include: {
      homeTeam: true,
      awayTeam: true,
      venue: true,
      matchday: {
        include: {
          tournament: {
            include: { category: true }
          }
        }
      }
    }
  });

  // Group by date string (e.g. "Sábado, 4 de julio")
  const matchesByDate: Record<string, typeof upcomingMatches> = {};
  
  upcomingMatches.forEach(match => {
    const dateStr = match.time 
      ? new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(match.time)
      : new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(match.matchday.date);
    
    // Capitalize first letter
    const capitalizedStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    
    if (!matchesByDate[capitalizedStr]) {
      matchesByDate[capitalizedStr] = [];
    }
    matchesByDate[capitalizedStr].push(match);
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-brand-dark pt-12 pb-16 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Calendario General</h1>
          <p className="mt-2 text-xl text-gray-400">Próximos encuentros programados en todas las categorías.</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="p-6">
            {Object.keys(matchesByDate).length > 0 ? (
              <div className="space-y-10">
                {Object.entries(matchesByDate).map(([date, matches]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                      <Calendar className="w-5 h-5 text-brand-primary" />
                      <h3 className="text-xl font-bold text-brand-dark">{date}</h3>
                    </div>
                    
                    <ul className="divide-y divide-gray-100">
                      {matches.map(match => (
                        <li key={match.id} className="py-4 hover:bg-gray-50 transition-colors rounded-lg px-2 group">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-[120px]">
                              <span className="font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
                                {match.time ? new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(match.time) : 'TBD'}
                              </span>
                              <span className="text-sm font-bold text-brand-primary uppercase tracking-wider">
                                {match.matchday.tournament.category.name}
                              </span>
                            </div>

                            <div className="flex-1 flex items-center justify-center gap-4">
                              <span className="text-base md:text-lg font-bold text-right flex-1 truncate text-brand-dark">{match.homeTeam.name}</span>
                              <span className="text-xl font-black italic text-gray-300">vs</span>
                              <span className="text-base md:text-lg font-bold text-left flex-1 truncate text-brand-dark">{match.awayTeam.name}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500 w-[180px] justify-end">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{match.venue?.name || 'Por definir'}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Trophy className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700">No hay partidos próximos</h3>
                <p className="text-gray-500 mt-2">Pronto se programarán nuevas fechas.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
