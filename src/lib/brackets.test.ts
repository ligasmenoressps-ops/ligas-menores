import { describe, it, expect } from 'vitest'
import { generarCrucesEliminatoria, TournamentFormatConfig } from './brackets'
import { StandingsRow } from './standings'

describe('generarCrucesEliminatoria', () => {
  it('should generate correct knockout matches for 13 teams, 6 qualifying, 2 direct, 4 preliminary (SINGLE leg)', () => {
    // Generar 13 equipos con posiciones del 1 al 13
    const standings: StandingsRow[] = Array.from({ length: 13 }, (_, i) => ({
      teamId: `t${i + 1}`,
      teamName: `Team ${i + 1}`,
      played: 12,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      position: i + 1,
      recentForm: []
    }))

    const config: TournamentFormatConfig = {
      groupStage: 'SINGLE',
      qualifiersCount: 6,
      directToSemisCount: 2,
      preliminaryRoundCount: 4,
      knockoutRounds: [
        { name: 'Cuartos de Final', legs: 'SINGLE', tiebreaker: 'PENALTIES' }
      ]
    }

    const matches = generarCrucesEliminatoria(standings, config)

    // De los 4 equipos preliminares (posiciones 3, 4, 5, 6), se generan 2 partidos
    expect(matches).toHaveLength(2)

    // Partido 1: 3ro (t3) vs 6to (t6). High seed en casa
    expect(matches[0]).toEqual({
      homeTeamId: 't3',
      awayTeamId: 't6',
      roundName: 'Cuartos de Final',
      leg: 1
    })

    // Partido 2: 4to (t4) vs 5to (t5). High seed en casa
    expect(matches[1]).toEqual({
      homeTeamId: 't4',
      awayTeamId: 't5',
      roundName: 'Cuartos de Final',
      leg: 1
    })
  })

  it('should generate correct knockout matches for 13 teams, 6 qualifying, 2 direct, 4 preliminary (DOUBLE leg)', () => {
    // Generar 13 equipos con posiciones del 1 al 13
    const standings: StandingsRow[] = Array.from({ length: 13 }, (_, i) => ({
      teamId: `t${i + 1}`,
      teamName: `Team ${i + 1}`,
      played: 12,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      position: i + 1,
      recentForm: []
    }))

    const config: TournamentFormatConfig = {
      groupStage: 'SINGLE',
      qualifiersCount: 6,
      directToSemisCount: 2,
      preliminaryRoundCount: 4,
      knockoutRounds: [
        { name: 'Cuartos de Final', legs: 'DOUBLE', tiebreaker: 'AWAY_GOALS' }
      ]
    }

    const matches = generarCrucesEliminatoria(standings, config)

    // Deberían ser 4 partidos en total (2 cruces x 2 partidos)
    expect(matches).toHaveLength(4)

    // Cruce 1, Ida (Leg 1): 6to (t6) recibe al 3ro (t3)
    expect(matches[0]).toEqual({
      homeTeamId: 't6',
      awayTeamId: 't3',
      roundName: 'Cuartos de Final',
      leg: 1
    })
    
    // Cruce 1, Vuelta (Leg 2): 3ro (t3) recibe al 6to (t6)
    expect(matches[1]).toEqual({
      homeTeamId: 't3',
      awayTeamId: 't6',
      roundName: 'Cuartos de Final',
      leg: 2
    })

    // Cruce 2, Ida (Leg 1): 5to (t5) recibe al 4to (t4)
    expect(matches[2]).toEqual({
      homeTeamId: 't5',
      awayTeamId: 't4',
      roundName: 'Cuartos de Final',
      leg: 1
    })

    // Cruce 2, Vuelta (Leg 2): 4to (t4) recibe al 5to (t5)
    expect(matches[3]).toEqual({
      homeTeamId: 't4',
      awayTeamId: 't5',
      roundName: 'Cuartos de Final',
      leg: 2
    })
  })
})
