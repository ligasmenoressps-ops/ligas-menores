import React from 'react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { getCategories } from '@/lib/data/categories';
import { getSystemSettings } from '@/lib/data/settings';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  const settings = await getSystemSettings();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader categories={categories} settings={settings ? { appName: settings.appName, appLogoUrl: settings.appLogoUrl } : undefined} />
      <main className="flex-grow">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
