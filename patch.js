const fs = require('fs');
let content = fs.readFileSync('/Users/jhonsroks/.gemini/antigravity-ide/brain/2eb83e6e-1495-4f6b-b3e7-c5b1d54d5771/scratch/generate_action.ts', 'utf8');

// We need to inject direct qualifiers
const replacement = `
      // We have the winners.
      // Check if we need to add direct qualifiers to this next round
      let advancingTeams = [...winners]
      
      // If we are coming from the FIRST knockout round, we might have direct qualifiers waiting to enter.
      // We can detect this by seeing if the number of winners is less than a standard power of 2 round.
      // For example, if we have 2 winners, but directToSemisCount is 2, the next round should be a Semifinal (4 teams).
      if (formatConfig && formatConfig.directToSemisCount > 0) {
        // We need to know if we already added them. If the previous round was the PRELIMINARY round, they weren't in it.
        // Let's see if the winners are the ONLY teams that played in the preliminary round.
        // Actually, if we just check if (winners.length + directToSemisCount === 4) or similar.
        // Safest way: fetch top teams from group stage.
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

      if (advancingTeams.length === 1) {
        return { error: '¡El torneo ya tiene un campeón!' }
      }

      // Pair them up
      const nextRoundMatches = []
      const numMatches = advancingTeams.length / 2
`;

content = content.replace(`
      // We have the winners. 
      // If there's only 1 winner, the tournament is over!
      if (winners.length === 1) {
        return { error: '¡El torneo ya tiene un campeón!' }
      }

      // Pair them up
      const nextRoundMatches = []
      // Standard bracket pairing: 1 vs N, 2 vs N-1
      const numMatches = winners.length / 2`, replacement.trim());
      
content = content.replace(/winners\.length/g, 'advancingTeams.length');
content = content.replace(/winners\[/g, 'advancingTeams[');

fs.writeFileSync('/Users/jhonsroks/.gemini/antigravity-ide/brain/2eb83e6e-1495-4f6b-b3e7-c5b1d54d5771/scratch/generate_action.ts', content);
