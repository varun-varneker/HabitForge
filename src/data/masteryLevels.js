// Habit mastery system based on completion count - 7 levels matching hero ranks
export const masteryLevels = [
  {
    level: 'Novice',
    minCompletions: 0,
    maxCompletions: 4,
    color: '#95a5a6',
    icon: '🌱',
    multiplier: 1.0,
    description: 'Just beginning the quest'
  },
  {
    level: 'Apprentice',
    minCompletions: 5,
    maxCompletions: 14,
    color: '#3498db',
    icon: '⚔️',
    multiplier: 1.2,
    description: 'Learning consistency'
  },
  {
    level: 'Adventurer',
    minCompletions: 15,
    maxCompletions: 29,
    color: '#9b59b6',
    icon: '🗡️',
    multiplier: 1.4,
    description: 'Proven dedication'
  },
  {
    level: 'Champion',
    minCompletions: 30,
    maxCompletions: 49,
    color: '#e74c3c',
    icon: '🛡️',
    multiplier: 1.6,
    description: 'Formidable discipline'
  },
  {
    level: 'Hero',
    minCompletions: 50,
    maxCompletions: 74,
    color: '#f39c12',
    icon: '👑',
    multiplier: 1.8,
    description: 'True mastery'
  },
  {
    level: 'Legend',
    minCompletions: 75,
    maxCompletions: 99,
    color: '#e67e22',
    icon: '⭐',
    multiplier: 2.0,
    description: 'Legendary dedication'
  },
  {
    level: 'Mythic Hero',
    minCompletions: 100,
    maxCompletions: Infinity,
    color: '#d4af37',
    icon: '✨',
    multiplier: 2.5,
    description: 'Beyond comprehension'
  }
]

export const calculateMasteryLevel = (completions) => {
  for (let i = masteryLevels.length - 1; i >= 0; i--) {
    if (completions >= masteryLevels[i].minCompletions) {
      return {
        ...masteryLevels[i],
        completions,
        progress: masteryLevels[i].maxCompletions === Infinity 
          ? 100 
          : Math.floor(((completions - masteryLevels[i].minCompletions) / (masteryLevels[i].maxCompletions - masteryLevels[i].minCompletions + 1)) * 100),
        nextLevel: i < masteryLevels.length - 1 ? masteryLevels[i + 1] : null
      }
    }
  }
  
  return {
    ...masteryLevels[0],
    completions,
    progress: Math.floor((completions / (masteryLevels[0].maxCompletions + 1)) * 100),
    nextLevel: masteryLevels[1]
  }
}
