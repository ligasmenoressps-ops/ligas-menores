import { StandingsRow } from './standings'

export type GroupStageModality = 'SINGLE' | 'DOUBLE'

export type KnockoutRoundConfig = {
  name: string
  legs: 'SINGLE' | 'DOUBLE'
  tiebreaker: 'AWAY_GOALS' | 'GLOBAL' | 'PENALTIES'
}

export type TournamentFormatConfig = {
  groupStage: GroupStageModality
  qualifiersCount: number
  directToSemisCount: number
  preliminaryRoundCount: number
  knockoutRounds: KnockoutRoundConfig[]
  hasFinalisima?: boolean
}

export type GeneratedMatch = {
  homeTeamId: string
  awayTeamId: string
  roundName: string
  leg: number // 1 or 2
}

/**
 * Generates the preliminary knockout matches based on the final group standings and format config.
 */
export function generarCrucesEliminatoria(
  standings: StandingsRow[],
  formatConfig: TournamentFormatConfig
): GeneratedMatch[] {
  // Sort standings by position just to be safe
  const sortedStandings = [...standings].sort((a, b) => a.position - b.position)

  // Validate configuration
  if (formatConfig.qualifiersCount > sortedStandings.length) {
    throw new Error('qualifiersCount cannot be greater than the number of teams')
  }
  
  if (formatConfig.directToSemisCount + formatConfig.preliminaryRoundCount !== formatConfig.qualifiersCount) {
    throw new Error('directToSemisCount + preliminaryRoundCount must equal qualifiersCount')
  }

  if (formatConfig.preliminaryRoundCount % 2 !== 0) {
    throw new Error('preliminaryRoundCount must be an even number')
  }

  // Identify the teams that will play the preliminary round
  // E.g., if qualifiers=6, direct=2, preliminary=4.
  // We skip the first 2 (index 0, 1) and take the next 4 (index 2, 3, 4, 5).
  const startIndex = formatConfig.directToSemisCount
  const endIndex = formatConfig.directToSemisCount + formatConfig.preliminaryRoundCount
  const preliminaryTeams = sortedStandings.slice(startIndex, endIndex)

  // We need to know the configuration for this specific preliminary round.
  // The user configures `knockoutRounds`. The preliminary round is usually the first one in the array (e.g. QUARTERS).
  // If there are no knockout rounds configured, we default to SINGLE leg.
  const roundConfig = formatConfig.knockoutRounds[0] || { name: 'Ronda Previa', legs: 'SINGLE' }

  const matches: GeneratedMatch[] = []

  // Standard seeding: Best vs Worst available
  // e.g. 4 teams: 1st vs 4th, 2nd vs 3rd (within the preliminary subset).
  // If preliminaryTeams has 4 teams (3rd, 4th, 5th, 6th overall):
  // i=0: 3rd vs 6th
  // i=1: 4th vs 5th
  const numMatches = preliminaryTeams.length / 2
  for (let i = 0; i < numMatches; i++) {
    const highSeed = preliminaryTeams[i]
    const lowSeed = preliminaryTeams[preliminaryTeams.length - 1 - i]

    if (roundConfig.legs === 'SINGLE') {
      // In single leg, high seed plays at home
      matches.push({
        homeTeamId: highSeed.teamId,
        awayTeamId: lowSeed.teamId,
        roundName: roundConfig.name,
        leg: 1
      })
    } else {
      // In double leg, low seed plays at home first
      matches.push({
        homeTeamId: lowSeed.teamId,
        awayTeamId: highSeed.teamId,
        roundName: roundConfig.name,
        leg: 1
      })
      // High seed plays at home second
      matches.push({
        homeTeamId: highSeed.teamId,
        awayTeamId: lowSeed.teamId,
        roundName: roundConfig.name,
        leg: 2
      })
    }
  }

  return matches
}
