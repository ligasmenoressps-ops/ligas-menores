import { cache } from 'react';
import { prisma } from '@/lib/prisma';

export const getActiveTournament = cache(async (categoryId: string) => {
  return prisma.tournament.findFirst({
    where: { categoryId },
    orderBy: { createdAt: 'desc' },
    include: {
      teams: {
        include: { team: true }
      },
      matchdays: {
        include: {
          matches: {
            include: {
              homeTeam: true,
              awayTeam: true,
              venue: true
            }
          }
        },
        orderBy: { number: 'asc' }
      }
    }
  });
});
