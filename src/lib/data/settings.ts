import { cache } from 'react';
import { prisma } from '@/lib/prisma';

export const getSystemSettings = cache(async () => {
  return prisma.systemSettings.findFirst();
});
