// Achievement system with visible and hidden achievements
export const achievements = [
  // Visible Achievements - Stat Milestones
  {
    id: 'strength_25',
    name: 'Strength Builder',
    description: 'Reach 25 Strength',
    icon: '💪',
    category: 'stats',
    hidden: false,
    checkUnlocked: (character) => character.stats.strength >= 25,
    reward: { gold: 50, xp: 100 }
  },
  {
    id: 'strength_50',
    name: 'Mighty Warrior',
    description: 'Reach 50 Strength',
    icon: '⚔️',
    category: 'stats',
    hidden: false,
    checkUnlocked: (character) => character.stats.strength >= 50,
    reward: { gold: 100, xp: 200 }
  },
  {
    id: 'intelligence_25',
    name: 'Scholar',
    description: 'Reach 25 Intelligence',
    icon: '🧠',
    category: 'stats',
    hidden: false,
    checkUnlocked: (character) => character.stats.intelligence >= 25,
    reward: { gold: 50, xp: 100 }
  },
  {
    id: 'intelligence_50',
    name: 'Archmage',
    description: 'Reach 50 Intelligence',
    icon: '🔮',
    category: 'stats',
    hidden: false,
    checkUnlocked: (character) => character.stats.intelligence >= 50,
    reward: { gold: 100, xp: 200 }
  },
  {
    id: 'agility_25',
    name: 'Swift',
    description: 'Reach 25 Agility',
    icon: '⚡',
    category: 'stats',
    hidden: false,
    checkUnlocked: (character) => character.stats.agility >= 25,
    reward: { gold: 50, xp: 100 }
  },
  {
    id: 'agility_50',
    name: 'Master Rogue',
    description: 'Reach 50 Agility',
    icon: '🗡️',
    category: 'stats',
    hidden: false,
    checkUnlocked: (character) => character.stats.agility >= 50,
    reward: { gold: 100, xp: 200 }
  },
  {
    id: 'charisma_25',
    name: 'Charismatic',
    description: 'Reach 25 Charisma',
    icon: '✨',
    category: 'stats',
    hidden: false,
    checkUnlocked: (character) => character.stats.charisma >= 25,
    reward: { gold: 50, xp: 100 }
  },
  {
    id: 'charisma_50',
    name: 'Legendary Diplomat',
    description: 'Reach 50 Charisma',
    icon: '👑',
    category: 'stats',
    hidden: false,
    checkUnlocked: (character) => character.stats.charisma >= 50,
    reward: { gold: 100, xp: 200 }
  },
  {
    id: 'balanced_hero',
    name: 'Balanced Hero',
    description: 'Reach 50 in all stats',
    icon: '⚖️',
    category: 'stats',
    hidden: false,
    checkUnlocked: (character) => Object.values(character.stats).every(s => s >= 50),
    reward: { gold: 500, xp: 1000 }
  },

  // Hero Rank Milestones - Total Stats
  {
    id: 'rank_novice',
    name: 'Novice',
    description: 'Reach 40 total stats - Just beginning the hero\'s journey',
    icon: '🌱',
    category: 'milestones',
    hidden: false,
    checkUnlocked: (character) => {
      const totalStats = character.stats.strength + character.stats.intelligence + character.stats.agility + character.stats.charisma
      return totalStats >= 40
    },
    reward: { gold: 50, xp: 100 }
  },
  {
    id: 'rank_apprentice',
    name: 'Apprentice',
    description: 'Reach 101 total stats - Learning the ways of a hero',
    icon: '⚔️',
    category: 'milestones',
    hidden: false,
    checkUnlocked: (character) => {
      const totalStats = character.stats.strength + character.stats.intelligence + character.stats.agility + character.stats.charisma
      return totalStats >= 101
    },
    reward: { gold: 100, xp: 200 }
  },
  {
    id: 'rank_adventurer',
    name: 'Adventurer',
    description: 'Reach 201 total stats - Proven through many quests',
    icon: '🗡️',
    category: 'milestones',
    hidden: false,
    checkUnlocked: (character) => {
      const totalStats = character.stats.strength + character.stats.intelligence + character.stats.agility + character.stats.charisma
      return totalStats >= 201
    },
    reward: { gold: 200, xp: 400 }
  },
  {
    id: 'rank_champion',
    name: 'Champion',
    description: 'Reach 351 total stats - A formidable force for good',
    icon: '🛡️',
    category: 'milestones',
    hidden: false,
    checkUnlocked: (character) => {
      const totalStats = character.stats.strength + character.stats.intelligence + character.stats.agility + character.stats.charisma
      return totalStats >= 351
    },
    reward: { gold: 300, xp: 600 }
  },
  {
    id: 'rank_hero',
    name: 'Hero',
    description: 'Reach 501 total stats - A true hero of legend',
    icon: '👑',
    category: 'milestones',
    hidden: false,
    checkUnlocked: (character) => {
      const totalStats = character.stats.strength + character.stats.intelligence + character.stats.agility + character.stats.charisma
      return totalStats >= 501
    },
    reward: { gold: 400, xp: 800 }
  },
  {
    id: 'rank_legend',
    name: 'Legend',
    description: 'Reach 751 total stats - Stories of your deeds echo through time',
    icon: '⭐',
    category: 'milestones',
    hidden: false,
    checkUnlocked: (character) => {
      const totalStats = character.stats.strength + character.stats.intelligence + character.stats.agility + character.stats.charisma
      return totalStats >= 751
    },
    reward: { gold: 500, xp: 1000 }
  },
  {
    id: 'rank_mythic',
    name: 'Mythic Hero',
    description: 'Reach 1001 total stats - Beyond mortal comprehension',
    icon: '✨',
    category: 'milestones',
    hidden: false,
    checkUnlocked: (character) => {
      const totalStats = character.stats.strength + character.stats.intelligence + character.stats.agility + character.stats.charisma
      return totalStats >= 1001
    },
    reward: { gold: 1000, xp: 2000 }
  },

  // Hidden Achievements - Discovery
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 10 hard difficulty quests',
    hint: 'Master the most challenging quests',
    icon: '💎',
    category: 'hidden',
    hidden: true,
    checkUnlocked: (character, habits) => {
      const hardCompletions = habits.filter(h => h.difficulty === 'hard')
        .reduce((sum, h) => sum + (h.totalCompletions || 0), 0)
      return hardCompletions >= 10
    },
    reward: { gold: 200, xp: 300 }
  },
  {
    id: 'jack_of_all',
    name: 'Jack of All Trades',
    description: 'Have at least one habit in each category',
    hint: 'Explore all paths of growth',
    icon: '🎭',
    category: 'hidden',
    hidden: true,
    checkUnlocked: (character, habits) => {
      const categories = new Set(habits.map(h => h.category))
      return categories.has('strength') && categories.has('intelligence') && 
             categories.has('agility') && categories.has('charisma')
    },
    reward: { gold: 150, xp: 250 }
  },
  {
    id: 'dedicated',
    name: 'Dedicated Hero',
    description: 'Maintain a 30-day streak on any habit',
    hint: 'True dedication is the path to mastery',
    icon: '🔥',
    category: 'hidden',
    hidden: true,
    checkUnlocked: (character, habits) => habits.some(h => h.streak >= 30),
    reward: { gold: 300, xp: 500 }
  },
  {
    id: 'master_of_one',
    name: 'Master of One',
    description: 'Reach Master mastery level on any habit',
    hint: 'Complete a single quest 50 times',
    icon: '🏆',
    category: 'hidden',
    hidden: true,
    checkUnlocked: (character, habits) => habits.some(h => (h.totalCompletions || 0) >= 50),
    reward: { gold: 400, xp: 600 }
  },
  {
    id: 'gold_hoarder',
    name: 'Gold Hoarder',
    description: 'Accumulate 1000 gold',
    hint: 'Wealth beyond measure',
    icon: '💰',
    category: 'hidden',
    hidden: true,
    checkUnlocked: (character) => character.gold >= 1000,
    reward: { gold: 500, xp: 500 }
  },
  {
    id: 'level_master',
    name: 'Level Master',
    description: 'Reach level 20',
    hint: 'The journey of a thousand quests',
    icon: '⭐',
    category: 'hidden',
    hidden: true,
    checkUnlocked: (character) => character.level >= 20,
    reward: { gold: 300, xp: 800 }
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Survive with 5 health or less',
    hint: 'Live dangerously',
    icon: '❤️‍🔥',
    category: 'hidden',
    hidden: true,
    checkUnlocked: (character) => character.health <= 5 && character.health > 0,
    reward: { gold: 100, xp: 150 }
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Create your first habit',
    hint: 'Every journey begins with a single step',
    icon: '🐦',
    category: 'hidden',
    hidden: true,
    checkUnlocked: (character, habits) => habits.length >= 1,
    reward: { gold: 25, xp: 50 }
  },
  {
    id: 'quest_collector',
    name: 'Quest Collector',
    description: 'Have 10 active habits',
    hint: 'Variety is the spice of life',
    icon: '📚',
    category: 'hidden',
    hidden: true,
    checkUnlocked: (character, habits) => habits.length >= 10,
    reward: { gold: 200, xp: 300 }
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Complete 100 total quests',
    hint: 'A hundred victories',
    icon: '💯',
    category: 'hidden',
    hidden: true,
    checkUnlocked: (character, habits) => {
      const totalCompletions = habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0)
      return totalCompletions >= 100
    },
    reward: { gold: 500, xp: 1000 }
  }
]

export const checkNewAchievements = (character, habits, unlockedAchievements = []) => {
  const newAchievements = []
  
  for (const achievement of achievements) {
    // Skip if already unlocked
    if (unlockedAchievements.includes(achievement.id)) continue
    
    // Check if unlocked
    if (achievement.checkUnlocked(character, habits)) {
      newAchievements.push(achievement)
    }
  }
  
  return newAchievements
}

export const getAchievementProgress = (character, habits) => {
  const total = achievements.length
  const unlocked = achievements.filter(a => a.checkUnlocked(character, habits)).length
  return { unlocked, total, percentage: Math.floor((unlocked / total) * 100) }
}
