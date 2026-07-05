import { prisma } from '../src/lib/prisma'

async function testDraw() {
  const category = await prisma.category.findUnique({ where: { name: 'U13' } })
  const tournament = await prisma.tournament.findFirst({ where: { categoryId: category!.id } })
  
  const tournamentTeams = await prisma.tournamentTeam.findMany({
    where: { tournamentId: tournament!.id },
    include: { team: true },
  })

  // Algoritmo Fisher-Yates
  const shuffledTeams = [...tournamentTeams]
  for (let i = shuffledTeams.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledTeams[i], shuffledTeams[j]] = [shuffledTeams[j], shuffledTeams[i]]
  }

  // Update DB
  await prisma.$transaction(
    shuffledTeams.map((tTeam, index) => 
      prisma.tournamentTeam.update({
        where: { id: tTeam.id },
        data: { assignedNumber: index + 1 },
      })
    )
  )

  const updatedTeams = await prisma.tournamentTeam.findMany({
    where: { tournamentId: tournament!.id },
    include: { team: true },
    orderBy: { assignedNumber: 'asc' }
  })

  console.log("=== RESULTADO DEL SORTEO U13 ===")
  updatedTeams.forEach(t => {
    console.log(`Número ${t.assignedNumber}: ${t.team.name}`)
  })
}

testDraw()
