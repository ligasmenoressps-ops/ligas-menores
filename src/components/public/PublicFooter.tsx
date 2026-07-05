import React from 'react';
import Link from 'next/link';
import { Mail, FileText } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export async function PublicFooter() {
  // Fetch categories with their teams
  const categories = await prisma.category.findMany({
    include: {
      teams: {
        orderBy: { name: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-[8px] border-blue-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Teams Grid (MLS Style) */}
        <div className="mb-16">
          <h3 className="text-white font-black text-xl mb-8 uppercase tracking-widest border-b border-slate-800 pb-4">Clubes Participantes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map(category => (
              <div key={category.id} className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <h4 className="text-blue-400 font-black text-lg mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-blue-500 rounded-full block"></span>
                  {category.name}
                </h4>
                
                {category.teams.length === 0 ? (
                  <p className="text-slate-500 text-sm italic font-medium">Próximamente...</p>
                ) : (
                  <ul className="grid grid-cols-2 gap-y-3 gap-x-2">
                    {category.teams.map(team => (
                      <li key={team.id} className="flex items-center gap-2.5">
                        {team.logoUrl ? (
                          <img src={team.logoUrl} alt={team.name} className="w-6 h-6 object-contain bg-white rounded-full p-0.5" />
                        ) : (
                          <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-300">
                            {team.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-[13px] font-semibold text-slate-400 hover:text-white transition-colors truncate" title={team.name}>
                          {team.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info & Social */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-slate-800">
          {/* About */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg">
                T
              </div>
              <span className="font-black text-2xl text-white tracking-tight">TorneoApp</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6 font-medium">
              La plataforma oficial para seguir todas las estadísticas, resultados y calendarios de los torneos de ligas menores.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-1">
            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Acerca del Torneo</h4>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="flex items-center gap-3 text-sm font-medium hover:text-brand-primary transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-brand-primary" />
                  </div>
                  Reglamento Oficial
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center gap-3 text-sm font-medium hover:text-brand-primary transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-brand-primary" />
                  </div>
                  Contacto Administrativo
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories Links */}
          <div className="md:col-span-1">
            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Categorías</h4>
            <ul className="grid grid-cols-2 gap-y-3">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/categoria/${cat.name.toLowerCase()}`} className="text-sm font-medium text-slate-400 hover:text-brand-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-500">
          <p>&copy; {currentYear} Ligas Menores. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-300 transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Términos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
