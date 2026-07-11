import { prisma } from '@/lib/prisma'
import { getSystemSettings } from '@/lib/data/settings'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Trophy, Activity, ChevronRight } from 'lucide-react'

export async function PublicHero() {
  const now = new Date()

  const getNextMatch = async () => {
    const match = await prisma.match.findFirst({
      where: { 
        status: 'SCHEDULED',
        time: { gte: now }
      },
      orderBy: { time: 'asc' },
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true,
        matchday: { include: { tournament: { include: { category: true } } } }
      }
    });
    if (match) return match;

    return prisma.match.findFirst({
      where: { status: 'SCHEDULED' },
      orderBy: { time: 'asc' },
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true,
        matchday: { include: { tournament: { include: { category: true } } } }
      }
    });
  };

  const [nextMatch, lastMatch, activeTournaments, settings] = await Promise.all([
    getNextMatch(),
    prisma.match.findFirst({
      where: { status: 'PLAYED' },
      orderBy: { time: 'desc' },
      include: {
        homeTeam: true,
        awayTeam: true,
        matchday: { include: { tournament: { include: { category: true } } } }
      }
    }),
    prisma.tournament.findMany({
      include: {
        category: true,
        matchdays: {
          include: {
            _count: {
              select: { matches: { where: { status: 'PLAYED' } } }
            }
          }
        }
      }
    }),
    getSystemSettings()
  ]);

  const sortedTournaments = activeTournaments.map(t => ({
    ...t,
    playedMatchesCount: t.matchdays.reduce((acc, md) => acc + md._count.matches, 0)
  })).sort((a, b) => b.playedMatchesCount - a.playedMatchesCount);

  const mostActiveTournament = sortedTournaments.length > 0 ? sortedTournaments[0] : null;
  const appName = settings?.appName || 'Ligas Menores'
  const heroSubtitle = settings?.heroSubtitle || 'Sigue de cerca a las futuras estrellas del fútbol.'

  return (
    <div className="bg-brand-dark pt-8 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            {appName}
          </h1>
          <p className="mt-2 text-xl text-gray-400">
            {heroSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative bg-brand-primary rounded-2xl overflow-hidden text-white shadow-xl border border-brand-primary/20 flex flex-col justify-between group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-blue-600 to-blue-800 opacity-90"></div>
            
            <div className="relative p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
                  <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse mr-2"></span>
                  Próximo Partido Destacado
                </span>
                {nextMatch && (
                  <span className="text-sm font-bold tracking-wider uppercase text-blue-100 bg-black/20 px-3 py-1 rounded-lg">
                    {nextMatch.matchday.tournament.category.name}
                  </span>
                )}
              </div>

              {nextMatch ? (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex-1 flex flex-col items-center text-center">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full flex items-center justify-center p-4 mb-4 backdrop-blur-sm border border-white/20 shadow-2xl">
                        {nextMatch.homeTeam.logoUrl ? (
                          <Image src={nextMatch.homeTeam.logoUrl} alt={nextMatch.homeTeam.name} width={128} height={128} className="w-full h-full object-contain drop-shadow-md" priority />
                        ) : (
                          <Trophy className="w-12 h-12 text-white/50" />
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black drop-shadow-md leading-tight">{nextMatch.homeTeam.name}</h3>
                    </div>

                    <div className="flex flex-col items-center justify-center px-4">
                      <span className="text-3xl sm:text-5xl font-black italic text-white/40 drop-shadow-sm mb-2">VS</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center text-center">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full flex items-center justify-center p-4 mb-4 backdrop-blur-sm border border-white/20 shadow-2xl">
                        {nextMatch.awayTeam.logoUrl ? (
                          <Image src={nextMatch.awayTeam.logoUrl} alt={nextMatch.awayTeam.name} width={128} height={128} className="w-full h-full object-contain drop-shadow-md" priority />
                        ) : (
                          <Trophy className="w-12 h-12 text-white/50" />
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black drop-shadow-md leading-tight">{nextMatch.awayTeam.name}</h3>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-blue-100 bg-black/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-brand-accent" />
                      <span className="font-medium text-lg">
                        {nextMatch.time ? new Intl.DateTimeFormat('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).format(nextMatch.time) : new Intl.DateTimeFormat('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        }).format(nextMatch.matchday.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-brand-accent" />
                      <span className="font-medium text-lg">{nextMatch.venue?.name || 'Por definir'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-70">
                  <Calendar className="w-16 h-16 mb-4 text-white/50" />
                  <p className="text-2xl font-bold text-center">No hay partidos próximos programados</p>
                </div>
              )}
              
              {nextMatch && (
                <div className="mt-6 flex justify-end">
                  <Link 
                    href={`/categoria/${nextMatch.matchday.tournament.category.name.toLowerCase()}`}
                    className="inline-flex items-center font-bold hover:text-brand-accent transition-colors group-hover:underline"
                  >
                    Ir a la categoría <ChevronRight className="w-5 h-5 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-brand-dark flex flex-col justify-between flex-1 group hover:shadow-2xl transition-all">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-black text-brand-dark flex items-center gap-2 uppercase tracking-wide">
                    Último Resultado
                  </h3>
                  {lastMatch && (
                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                      {lastMatch.matchday.tournament.category.name}
                    </span>
                  )}
                </div>
                
                {lastMatch ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        {lastMatch.homeTeam.logoUrl ? (
                          <Image src={lastMatch.homeTeam.logoUrl} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
                        ) : <div className="w-8 h-8 bg-gray-200 rounded-full"></div>}
                        <span className={`font-bold ${lastMatch.homeGoals! > lastMatch.awayGoals! ? 'text-brand-dark' : 'text-gray-500'}`}>{lastMatch.homeTeam.name}</span>
                      </div>
                      <span className="text-2xl font-black text-brand-dark">{lastMatch.homeGoals}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        {lastMatch.awayTeam.logoUrl ? (
                          <Image src={lastMatch.awayTeam.logoUrl} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
                        ) : <div className="w-8 h-8 bg-gray-200 rounded-full"></div>}
                        <span className={`font-bold ${lastMatch.awayGoals! > lastMatch.homeGoals! ? 'text-brand-dark' : 'text-gray-500'}`}>{lastMatch.awayTeam.name}</span>
                      </div>
                      <span className="text-2xl font-black text-brand-dark">{lastMatch.awayGoals}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No hay resultados recientes.</p>
                )}
              </div>
              {lastMatch && (
                <Link href={`/categoria/${lastMatch.matchday.tournament.category.name.toLowerCase()}`} className="mt-4 text-sm font-bold text-brand-primary hover:text-brand-accent flex items-center justify-end transition-colors">
                  Ver posiciones <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div className="bg-brand-dark rounded-2xl p-6 shadow-xl text-white flex flex-col justify-between flex-1 relative overflow-hidden group hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 text-white/5 transform group-hover:scale-110 transition-transform duration-500">
                <Activity className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">
                  Categoría Más Activa
                </h3>
                
                {mostActiveTournament && mostActiveTournament.playedMatchesCount > 0 ? (
                  <>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white">{mostActiveTournament.category.name}</span>
                    </div>
                    <p className="mt-2 text-brand-accent font-medium">
                      {mostActiveTournament.playedMatchesCount} partidos jugados
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Torneo: {mostActiveTournament.name}
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-gray-400 italic">No hay suficiente actividad aún.</p>
                )}
              </div>
              {mostActiveTournament && (
                <Link href={`/categoria/${mostActiveTournament.category.name.toLowerCase()}`} className="relative z-10 mt-6 text-sm font-bold text-white hover:text-brand-accent flex items-center transition-colors">
                  Explorar categoría <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
