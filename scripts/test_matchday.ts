import { prisma } from '../src/lib/prisma'
import { calcularTabla } from '../src/lib/standings'

async function testMatchdayFlow() {
  const category = await prisma.category.findUnique({ where: { name: 'U13' } })
  const tournament = await prisma.tournament.findFirst({ where: { categoryId: category!.id } })
  const teams = await prisma.tournamentTeam.findMany({ where: { tournamentId: tournament!.id }, include: { team: true } })
  const venue = await prisma.venue.findFirst()
  
  const teamA = teams[0].team
  const teamB = teams[1].team

  console.log(`Programando partido: ${teamA.name} vs ${teamB.name}...`)

  // 1. Create Matchday
  const md3 = await prisma.matchday.create({
    data: { tournamentId: tournament!.id, number: 3, date: new Date() }
  })

  // 2. Schedule match
  const match = await prisma.match.create({
    data: { matchdayId: md3.id, homeTeamId: teamA.id, awayTeamId: teamB.id, venueId: venue!.id, status: 'SCHEDULED', phase: 'GROUP_STAGE' }
  })

  // 3. Play match (Result: teamA wins 5-0)
  await prisma.match.update({
    where: { id: match.id },
    data: { homeGoals: 5, awayGoals: 0, status: 'PLAYED' }
  })

  console.log(`Partido jugado. Resultado: ${teamA.name} 5 - 0 ${teamB.name}`)

  // 4. Verify standings
  const allMatches = await prisma.match.findMany({
    where: { matchday: { tournamentId: tournament!.id }, status: 'PLAYED', phase: 'GROUP_STAGE' }
  })

  const teamsData = teams.map(t => ({ id: t.teamId, name: t.team.name }))
  const standings = calcularTabla(allMatches, teamsData)
  
  console.log("=== TABLA ACTUALIZADA ===")
  standings.slice(0, 3).forEach(s => {
    console.log(`${s.position}. ${s.teamName} | Puntos: ${s.points} | GF: ${s.goalsFor} | GC: ${s.goalsAgainst} | DG: ${s.goalDifference}`)
  })
}

testMatchdayFlow()
