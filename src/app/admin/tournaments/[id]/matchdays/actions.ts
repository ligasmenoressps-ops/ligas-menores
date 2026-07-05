'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { generarCrucesEliminatoria, TournamentFormatConfig } from '@/lib/brackets'
import { calcularTabla } from '@/lib/standings'

export async function createMatchday(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  try {
    const tournamentId = formData.get('tournamentId') as string
    const number = parseInt(formData.get('number') as string)
    const date = new Date(formData.get('date') as string)

    await prisma.matchday.create({
      data: { tournamentId, number, date }
    })

    revalidatePath(`/admin/tournaments/${tournamentId}/matchdays`)
    return { success: true, message: 'Jornada creada con éxito.' }
  } catch (error) {
    console.error('Error creating matchday:', error)
    return { error: 'Ocurrió un error al crear la jornada.' }
  }
}

export async function scheduleMatch(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  try {
    const tournamentId = formData.get('tournamentId') as string
    const matchdayId = formData.get('matchdayId') as string
    const homeTeamId = formData.get('homeTeamId') as string
    const awayTeamId = formData.get('awayTeamId') as string
    const venueId = formData.get('venueId') as string || null
    const delegateId = formData.get('delegateId') as string || null
    const timeStr = formData.get('time') as string
    const matchId = formData.get('matchId') as string // if editing

    if (homeTeamId === awayTeamId) {
      return { error: 'El equipo local y visitante no pueden ser el mismo.' }
    }

    const time = timeStr ? new Date(timeStr) : null

    if (matchId) {
      await prisma.match.update({
        where: { id: matchId },
        data: { homeTeamId, awayTeamId, venueId, delegateId, time }
      })
    } else {
      await prisma.match.create({
        data: {
          matchdayId,
          homeTeamId,
          awayTeamId,
          venueId,
          delegateId,
          time,
          phase: 'GROUP_STAGE', // Default for standard matches
          status: 'SCHEDULED'
        }
      })
    }

    revalidatePath(`/admin/tournaments/${tournamentId}/matchdays/${matchdayId}`)
    return { success: true, message: 'Partido programado con éxito.' }
  } catch (error) {
    console.error('Error scheduling match:', error)
    return { error: 'Ocurrió un error al programar el partido.' }
  }
}

export async function submitMatchResult(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  try {
    const tournamentId = formData.get('tournamentId') as string
    const matchdayId = formData.get('matchdayId') as string
    const matchId = formData.get('matchId') as string
    const homeGoals = parseInt(formData.get('homeGoals') as string)
    const awayGoals = parseInt(formData.get('awayGoals') as string)
    const homePenaltiesStr = formData.get('homePenalties') as string
    const awayPenaltiesStr = formData.get('awayPenalties') as string

    if (isNaN(homeGoals) || isNaN(awayGoals)) {
      return { error: 'Los goles deben ser números válidos.' }
    }

    const homePenalties = homePenaltiesStr ? parseInt(homePenaltiesStr) : null
    const awayPenalties = awayPenaltiesStr ? parseInt(awayPenaltiesStr) : null

    await prisma.match.update({
      where: { id: matchId },
      data: {
        homeGoals,
        awayGoals,
        homePenalties,
        awayPenalties,
        status: 'PLAYED'
      }
    })

    // Revalidate public and admin paths
    revalidatePath(`/admin/tournaments/${tournamentId}/matchdays/${matchdayId}`)
    // In a real app we might dynamically know the category slug, but we'll revalidate layout or known paths
    revalidatePath(`/categorias/u13/tabla`)

    return { success: true, message: 'Resultado guardado con éxito.' }
  } catch (error) {
    console.error('Error submitting match result:', error)
    return { error: 'Ocurrió un error al guardar el resultado.' }
  }
}

export async function generateKnockoutStage(tournamentId: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        format: true,
        matchdays: { include: { matches: { include: { homeTeam: true, awayTeam: true } } } },
        teams: { include: { team: true } }
      }
    })

    if (!tournament || !tournament.format) {
      return { error: 'El torneo no tiene un formato configurado.' }
    }

    const allMatches = tournament.matchdays.flatMap(md => md.matches)
    const formatConfig = tournament.format.bracketConfig as unknown as TournamentFormatConfig
    
    // Check if any knockout matches already exist
    const knockoutMatches = allMatches.filter(m => m.phase !== 'GROUP_STAGE')
    
    let generatedMatches: any[] = []

    if (knockoutMatches.length === 0) {
      // GENERATE FIRST ROUND (from group stage standings)
      const groupMatches = allMatches.filter(m => m.phase === 'GROUP_STAGE' && m.status === 'PLAYED')
      const teamsData = tournament.teams.map(t => ({ id: t.teamId, name: t.team.name }))
      const standings = calcularTabla(groupMatches, teamsData)

      generatedMatches = generarCrucesEliminatoria(standings, formatConfig)
    } else {
      // ADVANCE TO NEXT ROUND
      // Find the most recently generated knockout round
      const knockoutMatchdays = tournament.matchdays
        .filter(md => md.matches.some(m => m.phase !== 'GROUP_STAGE'))
        .sort((a, b) => b.number - a.number)
      
      const latestMatchday = knockoutMatchdays[0]
      const currentRoundMatches = latestMatchday.matches.filter(m => m.phase !== 'GROUP_STAGE')

      // Ensure all matches in current round are finished
      if (currentRoundMatches.some(m => m.status !== 'PLAYED')) {
        return { error: 'Debes finalizar todos los partidos de la ronda actual antes de generar la siguiente.' }
      }

      // Group by matchup to find winners
      const matchups: Record<string, any[]> = {}
      currentRoundMatches.forEach(m => {
        const key = [m.homeTeamId, m.awayTeamId].sort().join('-')
        if (!matchups[key]) matchups[key] = []
        matchups[key].push(m)
      })

      const winners: string[] = []
      for (const key in matchups) {
        const legs = matchups[key]
        const team1 = legs[0].homeTeamId
        const team2 = legs[0].awayTeamId
        
        let t1Goals = 0, t2Goals = 0, t1Pens = 0, t2Pens = 0
        legs.forEach((leg: any) => {
          if (leg.homeTeamId === team1) {
            t1Goals += leg.homeGoals || 0
            t2Goals += leg.awayGoals || 0
            t1Pens += leg.homePenalties || 0
            t2Pens += leg.awayPenalties || 0
          } else {
            t1Goals += leg.awayGoals || 0
            t2Goals += leg.homeGoals || 0
            t1Pens += leg.awayPenalties || 0
            t2Pens += leg.homePenalties || 0
          }
        })

        if (t1Goals > t2Goals) winners.push(team1)
        else if (t2Goals > t1Goals) winners.push(team2)
        else if (t1Pens > t2Pens) winners.push(team1)
        else if (t2Pens > t1Pens) winners.push(team2)
        else {
          return { error: 'Hay empates sin resolver (sin penales) en la ronda actual.' }
        }
      }

      // Check if we need to add direct qualifiers to this next round
      let advancingTeams = [...winners]
      
      if (formatConfig && formatConfig.directToSemisCount > 0) {
        const groupMatches = allMatches.filter(m => m.phase === 'GROUP_STAGE' && m.status === 'PLAYED')
        const teamsData = tournament.teams.map(t => ({ id: t.teamId, name: t.team.name }))
        const standings = calcularTabla(groupMatches, teamsData)
        const sortedStandings = [...standings].sort((a,b) => a.position - b.position)
        
        const directQualifiers = sortedStandings.slice(0, formatConfig.directToSemisCount).map(s => s.teamId)
        
        // Only add them if they haven't played ANY knockout matches yet!
        const teamsThatPlayedKnockout = new Set(knockoutMatches.flatMap(m => [m.homeTeamId, m.awayTeamId]))
        
        const freshDirectQualifiers = directQualifiers.filter(id => !teamsThatPlayedKnockout.has(id))
        
        if (freshDirectQualifiers.length > 0) {
           advancingTeams = [...freshDirectQualifiers, ...advancingTeams]
        }
      }

      let isFinalisimaGeneration = false
      if (advancingTeams.length === 1) {
        const currentPhase = currentRoundMatches[0].phase.toLowerCase()
        if (currentPhase === 'finalísima' || currentPhase === 'finalisima') {
          return { error: '¡El torneo ya tiene un campeón definitivo!' }
        }

        if (currentPhase === 'final' && formatConfig?.hasFinalisima) {
          const groupMatchesForFinalisima = allMatches.filter(m => m.phase === 'GROUP_STAGE' && m.status === 'PLAYED')
          const teamsDataForFinalisima = tournament.teams.map(t => ({ id: t.teamId, name: t.team.name }))
          const standingsFinalisima = calcularTabla(groupMatchesForFinalisima, teamsDataForFinalisima)
          const sortedStandingsFinalisima = [...standingsFinalisima].sort((a,b) => a.position - b.position)
          const groupWinnerId = sortedStandingsFinalisima[0].teamId
          
          if (groupWinnerId !== advancingTeams[0]) {
             // We need Finalisima!
             advancingTeams = [groupWinnerId, advancingTeams[0]]
             isFinalisimaGeneration = true
          } else {
             return { error: '¡El torneo ya tiene un campeón! (Campeón de tabla y liguilla es el mismo)' }
          }
        } else {
          return { error: '¡El torneo ya tiene un campeón!' }
        }
      }

      // Pair them up
      const nextRoundMatches = []
      const numMatches = advancingTeams.length / 2
      
      let roundName = 'Siguiente Ronda'
      if (isFinalisimaGeneration) roundName = 'Finalísima'
      else if (numMatches === 1) roundName = 'Final'
      else if (numMatches === 2) roundName = 'Semifinal'
      else if (numMatches === 4) roundName = 'Cuartos de final'
      else if (numMatches === 8) roundName = 'Octavos de final'

      const isFinal = numMatches === 1 || isFinalisimaGeneration
      let legs = 'SINGLE'
      
      if (formatConfig && formatConfig.knockoutRounds && !isFinalisimaGeneration) {
        const config = formatConfig.knockoutRounds.find(r => r.name.toLowerCase() === roundName.toLowerCase())
        if (config) {
          legs = config.legs
        }
      }

      for (let i = 0; i < numMatches; i++) {
        const highSeed = advancingTeams[i]
        const lowSeed = advancingTeams[advancingTeams.length - 1 - i]
        
        if (legs === 'SINGLE') {
          nextRoundMatches.push({ homeTeamId: highSeed, awayTeamId: lowSeed, roundName, leg: 1 })
        } else {
          nextRoundMatches.push({ homeTeamId: lowSeed, awayTeamId: highSeed, roundName, leg: 1 })
          nextRoundMatches.push({ homeTeamId: highSeed, awayTeamId: lowSeed, roundName, leg: 2 })
        }
      }
      
      generatedMatches = nextRoundMatches
    }

    if (generatedMatches.length === 0) {
      return { error: 'No se generaron cruces.' }
    }

    // Crear una nueva jornada
    const nextMatchdayNum = tournament.matchdays.length + 1
    const knockoutMd = await prisma.matchday.create({
      data: {
        tournamentId,
        number: nextMatchdayNum,
        date: new Date()
      }
    })

    // Guardar los partidos generados
    for (const match of generatedMatches) {
      await prisma.match.create({
        data: {
          matchdayId: knockoutMd.id,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          phase: match.roundName,
          status: 'SCHEDULED'
        }
      })
    }

    revalidatePath(`/admin/tournaments/${tournamentId}/matchdays`)
    return { success: true, message: 'Cruces generados con éxito.' }
  } catch (error: any) {
    console.error('Error generating knockouts:', error)
    return { error: error.message || 'Ocurrió un error al generar los cruces.' }
  }
}

export async function deleteMatchday(matchdayId: string, tournamentId: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  try {
    await prisma.match.deleteMany({
      where: { matchdayId }
    })
    await prisma.matchday.delete({
      where: { id: matchdayId }
    })

    revalidatePath(`/admin/tournaments/${tournamentId}/matchdays`)
    return { success: true, message: 'Jornada eliminada correctamente.' }
  } catch (error) {
    console.error('Error deleting matchday:', error)
    return { error: 'Ocurrió un error al eliminar la jornada.' }
  }
}

export async function generateLeagueFixtures(tournamentId: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        format: true,
        teams: { include: { team: true } }
      }
    })

    if (!tournament || !tournament.format) {
      return { error: 'El torneo no tiene un formato configurado.' }
    }

    const enrolledTeams = tournament.teams.map(t => t.teamId)
    if (enrolledTeams.length < 2) {
      return { error: 'Se necesitan al menos 2 equipos para generar un fixture.' }
    }

    const formatConfig = tournament.format.bracketConfig as unknown as TournamentFormatConfig
    const isDoubleRoundRobin = formatConfig?.groupStage === 'DOUBLE'

    let teams = [...enrolledTeams]
    if (teams.length % 2 !== 0) {
      teams.push('BYE')
    }

    const n = teams.length
    const totalMatchdays = n - 1
    const generatedMatchdays: any[] = []

    for (let round = 0; round < totalMatchdays; round++) {
      const matchdayMatches: any[] = []
      
      for (let i = 0; i < n / 2; i++) {
        let home = teams[i]
        let away = teams[n - 1 - i]
        
        if (i === 0 && round % 2 === 1) {
          home = teams[n - 1 - i]
          away = teams[i]
        }
        
        if (home !== 'BYE' && away !== 'BYE') {
          matchdayMatches.push({ homeTeamId: home, awayTeamId: away })
        }
      }
      
      generatedMatchdays.push(matchdayMatches)
      
      const last = teams.pop()!
      teams.splice(1, 0, last)
    }

    if (isDoubleRoundRobin) {
      for (let round = 0; round < totalMatchdays; round++) {
        const firstRoundMatches = generatedMatchdays[round]
        const reverseMatches = firstRoundMatches.map((m: any) => ({
          homeTeamId: m.awayTeamId,
          awayTeamId: m.homeTeamId
        }))
        generatedMatchdays.push(reverseMatches)
      }
    }

    const existingMatchdays = await prisma.matchday.findMany({
      where: { tournamentId }
    })
    let nextNum = existingMatchdays.length > 0 
      ? Math.max(...existingMatchdays.map(m => m.number)) + 1 
      : 1

    await prisma.$transaction(async (tx) => {
      for (const mdMatches of generatedMatchdays) {
        if (mdMatches.length === 0) continue

        const md = await tx.matchday.create({
          data: {
            tournamentId,
            number: nextNum++,
            date: new Date()
          }
        })

        const matchRecords = mdMatches.map((m: any) => ({
          matchdayId: md.id,
          homeTeamId: m.homeTeamId,
          awayTeamId: m.awayTeamId,
          phase: 'GROUP_STAGE',
          status: 'SCHEDULED' as const
        }))

        await tx.match.createMany({
          data: matchRecords
        })
      }
    })

    revalidatePath(`/admin/tournaments/${tournamentId}/matchdays`)
    return { success: true, message: `Se generaron ${generatedMatchdays.length} jornadas automáticamente.` }

  } catch (error: any) {
    console.error('Error generating league fixtures:', error)
    return { error: 'Ocurrió un error al generar las jornadas de liga.' }
  }
}
