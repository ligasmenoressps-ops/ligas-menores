'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

type CategoryTabsProps = {
  currentCategorySlug: string;
  currentCategoryName: string;
  activeTournamentId?: string | null;
};

const CATEGORIES = [
  { name: 'U7', slug: 'u7' },
  { name: 'U9', slug: 'u9' },
  { name: 'U11', slug: 'u11' },
  { name: 'U13', slug: 'u13' },
  { name: 'U15', slug: 'u15' },
  { name: 'U17', slug: 'u17' },
];

export function CategoryTabs({ currentCategorySlug, currentCategoryName, activeTournamentId }: CategoryTabsProps) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = activeTournamentId ? [
    { label: 'Resumen', href: `/categoria/${currentCategorySlug}` },
    { label: 'Posiciones', href: `/tournaments/${activeTournamentId}/standings` },
    { label: 'Calendario', href: `/tournaments/${activeTournamentId}/calendar` },
    { label: 'Equipos', href: `/tournaments/${activeTournamentId}/teams` },
    { label: 'Fixture/Bracket', href: `/tournaments/${activeTournamentId}/bracket` },
  ] : [
    { label: 'Resumen', href: `/categoria/${currentCategorySlug}` },
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-14 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title and Quick Selector */}
        <div className="pt-6 pb-2 flex items-center">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            Categoría 
            <select
              className="ml-2 block w-auto pl-3 pr-8 py-1.5 text-base sm:text-lg rounded-md font-black text-blue-600 bg-blue-50 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 cursor-pointer"
              value={currentCategorySlug}
              onChange={(e) => router.push(`/categoria/${e.target.value}`)}
              aria-label="Seleccionar categoría"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </h1>
        </div>

        {/* Tabs */}
        <nav className="-mb-px flex space-x-6 overflow-x-auto scrollbar-hide" aria-label="Tabs" role="tablist">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-4 font-semibold text-sm transition-colors
                  ${isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }
                `}
                role="tab"
                aria-selected={isActive}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
