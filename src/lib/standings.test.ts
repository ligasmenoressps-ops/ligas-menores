import { describe, it, expect } from 'vitest'
import { calcularTabla, Team, Match } from './standings'

describe('calcularTabla', () => {
  const teams: Team[] = [
    { id: 't1', name: 'Equipo A' },
    { id: 't2', name: 'Equipo B' },
    { id: 't3', name: 'Equipo C' },
    { id: 't4', name: 'Equipo D' }, // Equipo sin partidos
  ]

  it('should correctly calculate points, goals and GD for a standard scenario', () => {
    const matches: Match[] = [
      { homeTeamId: 't1', awayTeamId: 't2', homeGoals: 2, awayGoals: 0, status: 'PLAYED' }, // t1 wins 2-0
      { homeTeamId: 't2', awayTeamId: 't3', homeGoals: 1, awayGoals: 1, status: 'PLAYED' }, // t2 draws t3 1-1
      { homeTeamId: 't1', awayTeamId: 't3', homeGoals: 0, awayGoals: 1, status: 'PLAYED' }, // t3 wins 1-0
    ]

    const standings = calcularTabla(matches, teams)

    // t3: 1 win, 1 draw => 4 pts, GF: 2, GA: 1, GD: 1
    // t1: 1 win, 1 loss => 3 pts, GF: 2, GA: 1, GD: 1
    // t2: 1 draw, 1 loss => 1 pt, GF: 1, GA: 3, GD: -2
    // t4: 0 matches => 0 pts, GF: 0, GA: 0, GD: 0

    expect(standings[0].teamId).toBe('t3')
    expect(standings[0].points).toBe(4)
    expect(standings[0].goalDifference).toBe(1)
    expect(standings[0].recentForm).toEqual(['E', 'G']) // t3 drew t2, then beat t1

    expect(standings[1].teamId).toBe('t1')
    expect(standings[1].points).toBe(3)
    expect(standings[1].goalDifference).toBe(1)
    expect(standings[1].recentForm).toEqual(['G', 'P']) // t1 beat t2, then lost to t3

    expect(standings[2].teamId).toBe('t2')
    expect(standings[2].points).toBe(1)
    expect(standings[2].goalDifference).toBe(-2)
    expect(standings[2].recentForm).toEqual(['P', 'E']) // t2 lost to t1, then drew t3

    expect(standings[3].teamId).toBe('t4')
    expect(standings[3].points).toBe(0)
    expect(standings[3].played).toBe(0)
    expect(standings[3].goalsFor).toBe(0)
    expect(standings[3].recentForm).toEqual([])
  })

  it('should resolve tiebreaker by goal difference', () => {
    const matches: Match[] = [
      { homeTeamId: 't1', awayTeamId: 't2', homeGoals: 3, awayGoals: 0, status: 'PLAYED' }, // t1 wins, +3 GD, 3 pts
      { homeTeamId: 't3', awayTeamId: 't4', homeGoals: 2, awayGoals: 0, status: 'PLAYED' }, // t3 wins, +2 GD, 3 pts
    ]

    const standings = calcularTabla(matches, teams)

    expect(standings[0].teamId).toBe('t1') // GD +3
    expect(standings[1].teamId).toBe('t3') // GD +2
    expect(standings[0].points).toBe(3)
    expect(standings[1].points).toBe(3)
  })

  it('should resolve tiebreaker by goals for if goal difference is equal', () => {
    const matches: Match[] = [
      { homeTeamId: 't1', awayTeamId: 't2', homeGoals: 3, awayGoals: 2, status: 'PLAYED' }, // t1 wins, +1 GD, 3 GF
      { homeTeamId: 't3', awayTeamId: 't4', homeGoals: 2, awayGoals: 1, status: 'PLAYED' }, // t3 wins, +1 GD, 2 GF
    ]

    const standings = calcularTabla(matches, teams)

    expect(standings[0].teamId).toBe('t1') // GF 3
    expect(standings[1].teamId).toBe('t3') // GF 2
    expect(standings[0].goalDifference).toBe(1)
    expect(standings[1].goalDifference).toBe(1)
  })

  it('should ignore matches that are not PLAYED or have null goals', () => {
    const matches: Match[] = [
      { homeTeamId: 't1', awayTeamId: 't2', homeGoals: 2, awayGoals: 0, status: 'SCHEDULED' },
      { homeTeamId: 't3', awayTeamId: 't4', homeGoals: null, awayGoals: null, status: 'PLAYED' },
    ]

    const standings = calcularTabla(matches, teams)

    expect(standings[0].played).toBe(0)
    expect(standings[1].played).toBe(0)
    expect(standings[2].played).toBe(0)
    expect(standings[3].played).toBe(0)
  })
})
