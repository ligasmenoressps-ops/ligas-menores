import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Cleaning up teams...')
  
  // 1. Delete all matches (since they depend on teams)
  await prisma.match.deleteMany({})
  console.log('Matches deleted.')

  // 2. Delete all TournamentTeam relations
  await prisma.tournamentTeam.deleteMany({})
  console.log('TournamentTeam relations deleted.')

  // 3. Disconnect users from teams
  await prisma.user.updateMany({
    where: { teamId: { not: null } },
    data: { teamId: null }
  })
  console.log('Users disconnected from teams.')

  // 4. Delete all teams
  const deleted = await prisma.team.deleteMany({})
  console.log(`Deleted ${deleted.count} teams.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
