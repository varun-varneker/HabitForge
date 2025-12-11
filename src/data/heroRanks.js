// Hero rank system based on total stats
export const heroRanks = [
  {
    rank: 'Novice',
    minStats: 40,
    maxStats: 100,
    color: '#95a5a6',
    icon: '🌱',
    description: 'Just beginning the hero\'s journey'
  },
  {
    rank: 'Apprentice',
    minStats: 101,
    maxStats: 200,
    color: '#3498db',
    icon: '⚔️',
    description: 'Learning the ways of a hero'
  },
  {
    rank: 'Adventurer',
    minStats: 201,
    maxStats: 350,
    color: '#9b59b6',
    icon: '🗡️',
    description: 'Proven through many quests'
  },
  {
    rank: 'Champion',
    minStats: 351,
    maxStats: 500,
    color: '#e74c3c',
    icon: '🛡️',
    description: 'A formidable force for good'
  },
  {
    rank: 'Hero',
    minStats: 501,
    maxStats: 750,
    color: '#f39c12',
    icon: '👑',
    description: 'A true hero of legend'
  },
  {
    rank: 'Legend',
    minStats: 751,
    maxStats: 1000,
    color: '#e67e22',
    icon: '⭐',
    description: 'Stories of your deeds echo through time'
  },
  {
    rank: 'Mythic Hero',
    minStats: 1001,
    maxStats: Infinity,
    color: '#d4af37',
    icon: '✨',
    description: 'Beyond mortal comprehension'
  }
]

export const calculateHeroRank = (stats) => {
  const totalStats = stats.strength + stats.intelligence + stats.agility + stats.charisma
  
  for (let i = heroRanks.length - 1; i >= 0; i--) {
    if (totalStats >= heroRanks[i].minStats) {
      return {
        ...heroRanks[i],
        totalStats,
        progress: heroRanks[i].maxStats === Infinity 
          ? 100 
          : Math.floor(((totalStats - heroRanks[i].minStats) / (heroRanks[i].maxStats - heroRanks[i].minStats + 1)) * 100),
        nextRank: i < heroRanks.length - 1 ? heroRanks[i + 1] : null
      }
    }
  }
  
  return {
    ...heroRanks[0],
    totalStats,
    progress: 0,
    nextRank: heroRanks[1]
  }
}
