export type MatchSummary = {
  id: string;
  homeTeam: { name: string; logoUrl: string | null };
  awayTeam: { name: string; logoUrl: string | null };
  homeGoals: number | null;
  awayGoals: number | null;
  date: Date;
  time?: Date | null;
  venueName?: string | null;
  matchdayNumber?: number;
  categoryName?: string;
};
