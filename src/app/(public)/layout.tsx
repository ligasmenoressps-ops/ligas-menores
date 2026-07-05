import React from 'react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { prisma } from '@/lib/prisma';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = await prisma.category.findMany({
    select: { name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader categories={categories} />
      <main className="flex-grow">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
