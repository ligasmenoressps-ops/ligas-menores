import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // 1. Create Categories
  const categoriesData = ['U7', 'U9', 'U11', 'U13', 'U15', 'U17']
  for (const name of categoriesData) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log('Categories seeded')

  const u13Category = await prisma.category.findUnique({ where: { name: 'U13' } })
  
  if (!u13Category) throw new Error("Category U13 not found after seed")

  // 2. Create Tournament Format
  const format = await prisma.tournamentFormat.create({
    data: {
      name: 'Format Standard - Grupos e Ida',
      bracketConfig: {
        groupStage: 'single_round_robin',
        qualifiersToNextPhase: 4,
        directToSemis: 0,
        playoffs: 'single_leg',
      },
    }
  })

  // 3. Create Tournament
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Liga Apertura 2026',
      categoryId: u13Category.id,
      season: '2026',
      status: 'DRAFT',
      formatId: format.id,
    }
  })
  console.log('Tournament seeded')

  // 4. Create 8 Teams and enroll them
  const teamsData = [
    { name: 'Leones FC', primaryColor: '#ff0000' },
    { name: 'Tigres Juveniles', primaryColor: '#ffff00' },
    { name: 'Águilas Doradas', primaryColor: '#0000ff' },
    { name: 'Halcones', primaryColor: '#00ff00' },
    { name: 'Real Madrid Junior', primaryColor: '#ffffff' },
    { name: 'Barcelona Cantera', primaryColor: '#800080' },
    { name: 'Rayo Vallecano', primaryColor: '#ff0000' },
    { name: 'Atlético Juvenil', primaryColor: '#000000' },
  ]

  const createdTeams = []
  for (const [index, t] of teamsData.entries()) {
    const team = await prisma.team.create({
      data: {
        name: t.name,
        primaryColor: t.primaryColor,
        categoryId: u13Category.id,
        logoUrl: '/placeholder-logo.png',
      }
    })
    createdTeams.push(team)

    await prisma.tournamentTeam.create({
      data: {
        tournamentId: tournament.id,
        teamId: team.id,
        assignedNumber: index + 1,
      }
    })
  }
  // 4.1 Create a Venue
  const venue = await prisma.venue.create({
    data: {
      name: 'Estadio Municipal U13',
      address: 'Av. Principal 123'
    }
  })
  console.log('Venue seeded')

  // 4.5. Create mock Matchdays and Matches
  const md1 = await prisma.matchday.create({
    data: {
      tournamentId: tournament.id,
      number: 1,
      date: new Date('2026-03-01'),
    }
  })

  // Leones vs Tigres (2-1)
  await prisma.match.create({
    data: { matchdayId: md1.id, homeTeamId: createdTeams[0].id, awayTeamId: createdTeams[1].id, homeGoals: 2, awayGoals: 1, status: 'PLAYED', phase: 'GROUP_STAGE', venueId: venue.id }
  })
  // Águilas vs Halcones (1-1)
  await prisma.match.create({
    data: { matchdayId: md1.id, homeTeamId: createdTeams[2].id, awayTeamId: createdTeams[3].id, homeGoals: 1, awayGoals: 1, status: 'PLAYED', phase: 'GROUP_STAGE', venueId: venue.id }
  })
  // Real vs Barcelona (0-3)
  await prisma.match.create({
    data: { matchdayId: md1.id, homeTeamId: createdTeams[4].id, awayTeamId: createdTeams[5].id, homeGoals: 0, awayGoals: 3, status: 'PLAYED', phase: 'GROUP_STAGE', venueId: venue.id }
  })
  // Rayo vs Atlético (0-0)
  await prisma.match.create({
    data: { matchdayId: md1.id, homeTeamId: createdTeams[6].id, awayTeamId: createdTeams[7].id, homeGoals: 0, awayGoals: 0, status: 'PLAYED', phase: 'GROUP_STAGE', venueId: venue.id }
  })

  const md2 = await prisma.matchday.create({
    data: {
      tournamentId: tournament.id,
      number: 2,
      date: new Date('2026-03-08'),
    }
  })

  // Tigres vs Águilas (0-2)
  await prisma.match.create({
    data: { matchdayId: md2.id, homeTeamId: createdTeams[1].id, awayTeamId: createdTeams[2].id, homeGoals: 0, awayGoals: 2, status: 'PLAYED', phase: 'GROUP_STAGE', venueId: venue.id }
  })
  // Barcelona vs Leones (2-2)
  await prisma.match.create({
    data: { matchdayId: md2.id, homeTeamId: createdTeams[5].id, awayTeamId: createdTeams[0].id, homeGoals: 2, awayGoals: 2, status: 'PLAYED', phase: 'GROUP_STAGE', venueId: venue.id }
  })
  // Halcones vs Rayo (3-1)
  await prisma.match.create({
    data: { matchdayId: md2.id, homeTeamId: createdTeams[3].id, awayTeamId: createdTeams[6].id, homeGoals: 3, awayGoals: 1, status: 'PLAYED', phase: 'GROUP_STAGE', venueId: venue.id }
  })
  // Atlético vs Real (1-0)
  await prisma.match.create({
    data: { matchdayId: md2.id, homeTeamId: createdTeams[7].id, awayTeamId: createdTeams[4].id, homeGoals: 1, awayGoals: 0, status: 'PLAYED', phase: 'GROUP_STAGE', venueId: venue.id }
  })
  console.log('Mock matches seeded')

  // 5. Create Admin User
  const passwordHash = await bcrypt.hash('admin123', 10)
  
  await prisma.user.upsert({
    where: { email: 'admin@ligasmenores.com' },
    update: { passwordHash },
    create: {
      name: 'Admin',
      email: 'admin@ligasmenores.com',
      passwordHash,
      role: 'ADMIN',
    }
  })
  console.log('Admin user seeded')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
