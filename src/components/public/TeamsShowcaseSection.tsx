import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';

export async function TeamsShowcaseSection() {
  const teams = await prisma.team.findMany({
    where: { logoUrl: { not: null } },
    take: 18,
    orderBy: { name: 'asc' }
  });

  if (teams.length === 0) return null;

  return (
    <section className="mt-20 mb-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Equipos Destacados</h2>
        <p className="text-gray-500 mt-2">Los grandes clubes que forman parte de nuestras ligas</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-8 items-center justify-items-center opacity-80 hover:opacity-100 transition-opacity duration-300">
        {teams.map(team => (
          <div key={team.id} className="group flex flex-col items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center p-3 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <Image src={team.logoUrl!} alt={team.name} width={96} height={96} loading="lazy" className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300" />
            </div>
            <span className="mt-3 text-xs font-bold text-gray-400 group-hover:text-brand-primary text-center truncate w-full px-2 transition-colors">
              {team.name}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/equipos" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-brand-primary transition-colors">
          Ver todos los equipos &rarr;
        </Link>
      </div>
    </section>
  );
}
