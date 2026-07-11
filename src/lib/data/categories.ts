import { cache } from 'react';
import { prisma } from '@/lib/prisma';

export const getCategories = cache(async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
});
