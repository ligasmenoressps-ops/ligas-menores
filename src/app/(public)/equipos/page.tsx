import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

export default async function EquiposPage() {
  const categories = await prisma.category.findMany({
    include: {
      teams: {
        orderBy: { name: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-brand-dark pt-12 pb-16 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Equipos Participantes</h1>
          <p className="mt-2 text-xl text-gray-400">Todos los clubes que forman parte de Ligas Menores, agrupados por categoría.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="space-y-12">
          {categories.map(category => (
            <div key={category.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-wide flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-brand-primary rounded-full block"></span>
                  Categoría {category.name}
                </h2>
                <Link href={`/categoria/${category.name.toLowerCase()}`} className="text-sm font-bold text-brand-primary hover:text-brand-accent transition-colors flex items-center">
                  Ver Torneo <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="p-8">
                {category.teams.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-start justify-items-center">
                    {category.teams.map(team => (
                      <div key={team.id} className="group flex flex-col items-center w-full">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center p-4 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                          {team.logoUrl ? (
                            <Image src={team.logoUrl} alt={team.name} width={112} height={112} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-400">
                              {team.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="mt-4 text-sm font-bold text-gray-700 group-hover:text-brand-primary text-center transition-colors line-clamp-2">
                          {team.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-8">No hay equipos registrados en esta categoría aún.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
