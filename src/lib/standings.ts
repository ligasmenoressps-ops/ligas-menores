export type Team = {
  id: string
  name: string
  logoUrl?: string | null
}

export type Match = {
  homeTeamId: string
  awayTeamId: string
  homeGoals: number | null
  awayGoals: number | null
  status: string
}

export type StandingsRow = {
  teamId: string
  teamName: string
  logoUrl?: string | null
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  position: number
  recentForm: ('G' | 'E' | 'P')[]
}

export function calcularTabla(matches: Match[], teams: Team[]): StandingsRow[] {
  // Initialize standings map
  const standingsMap = new Map<string, Omit<StandingsRow, 'position'>>()

  teams.forEach(team => {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      logoUrl: team.logoUrl,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      recentForm: [],
    })
  })

  // Process all PLAYED matches
  matches.forEach(match => {
    if (match.status !== 'PLAYED' || match.homeGoals === null || match.awayGoals === null) {
      return
    }

    const homeTeam = standingsMap.get(match.homeTeamId)
    const awayTeam = standingsMap.get(match.awayTeamId)

    if (homeTeam) {
      homeTeam.played += 1
      homeTeam.goalsFor += match.homeGoals
      homeTeam.goalsAgainst += match.awayGoals
      homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst

      if (match.homeGoals > match.awayGoals) {
        homeTeam.won += 1
        homeTeam.points += 3
        homeTeam.recentForm.push('G')
      } else if (match.homeGoals === match.awayGoals) {
        homeTeam.drawn += 1
        homeTeam.points += 1
        homeTeam.recentForm.push('E')
      } else {
        homeTeam.lost += 1
        homeTeam.recentForm.push('P')
      }
    }

    if (awayTeam) {
      awayTeam.played += 1
      awayTeam.goalsFor += match.awayGoals
      awayTeam.goalsAgainst += match.homeGoals
      awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst

      if (match.awayGoals > match.homeGoals) {
        awayTeam.won += 1
        awayTeam.points += 3
        awayTeam.recentForm.push('G')
      } else if (match.awayGoals === match.homeGoals) {
        awayTeam.drawn += 1
        awayTeam.points += 1
        awayTeam.recentForm.push('E')
      } else {
        awayTeam.lost += 1
        awayTeam.recentForm.push('P')
      }
    }
  })

  // Limit recent form to last 5 matches and convert map to array
  const standings = Array.from(standingsMap.values()).map(row => ({
    ...row,
    recentForm: row.recentForm.slice(-5)
  }))

  standings.sort((a, b) => {
    // 1. Points
    if (b.points !== a.points) {
      return b.points - a.points
    }
    // 2. Goal Difference
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference
    }
    // 3. Goals For
    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor
    }
    // Tie - keep alphabetical by name as a final fallback
    return a.teamName.localeCompare(b.teamName)
  })

  // Assign positions
  return standings.map((row, index) => ({
    ...row,
    position: index + 1,
  }))
}
