export const characterQuiz = [
  {
    id: 1,
    question: "When faced with a difficult challenge, how do you typically approach it?",
    options: [
      { text: "Face it head-on with determination and power", type: "warrior", points: 3 },
      { text: "Analyze it carefully and devise a strategic plan", type: "wizard", points: 3 },
      { text: "Find the quickest and most efficient solution", type: "rogue", points: 3 }
    ]
  },
  {
    id: 2,
    question: "What motivates you most when working towards a goal?",
    options: [
      { text: "Proving my strength and overcoming obstacles", type: "warrior", points: 3 },
      { text: "Learning and understanding complex concepts", type: "wizard", points: 3 },
      { text: "Achieving results quickly and efficiently", type: "rogue", points: 3 }
    ]
  },
  {
    id: 3,
    question: "In a team setting, what role do you naturally take?",
    options: [
      { text: "The leader who drives everyone forward", type: "warrior", points: 3 },
      { text: "The advisor who provides insights and solutions", type: "wizard", points: 3 },
      { text: "The flexible one who adapts to what's needed", type: "rogue", points: 3 }
    ]
  },
  {
    id: 4,
    question: "How do you prefer to spend your free time?",
    options: [
      { text: "Physical activities and exercise", type: "warrior", points: 3 },
      { text: "Reading, learning, or solving puzzles", type: "wizard", points: 3 },
      { text: "Exploring new places or trying new experiences", type: "rogue", points: 3 }
    ]
  },
  {
    id: 5,
    question: "What's your approach to learning a new skill?",
    options: [
      { text: "Practice repeatedly until I master it through effort", type: "warrior", points: 3 },
      { text: "Study the theory and understand the principles first", type: "wizard", points: 3 },
      { text: "Jump in and learn by doing, adapting as I go", type: "rogue", points: 3 }
    ]
  },
  {
    id: 6,
    question: "When making important decisions, you rely most on:",
    options: [
      { text: "My gut feeling and conviction", type: "warrior", points: 3 },
      { text: "Careful analysis and logical reasoning", type: "wizard", points: 3 },
      { text: "Flexibility and considering multiple options", type: "rogue", points: 3 }
    ]
  },
  {
    id: 7,
    question: "What type of habits are you most interested in building?",
    options: [
      { text: "Physical fitness and endurance", type: "warrior", points: 3 },
      { text: "Mental growth and knowledge acquisition", type: "wizard", points: 3 },
      { text: "Productivity and skill development", type: "rogue", points: 3 }
    ]
  },
  {
    id: 8,
    question: "How do you handle setbacks or failures?",
    options: [
      { text: "Push harder and refuse to give up", type: "warrior", points: 3 },
      { text: "Reflect on what went wrong and plan differently", type: "wizard", points: 3 },
      { text: "Quickly adapt and try a different approach", type: "rogue", points: 3 }
    ]
  },
  {
    id: 9,
    question: "What describes your ideal achievement?",
    options: [
      { text: "Conquering a major challenge through sheer willpower", type: "warrior", points: 3 },
      { text: "Solving a complex problem with knowledge", type: "wizard", points: 3 },
      { text: "Efficiently accomplishing multiple goals", type: "rogue", points: 3 }
    ]
  },
  {
    id: 10,
    question: "Your personal motto would be closest to:",
    options: [
      { text: "Strength conquers all", type: "warrior", points: 3 },
      { text: "Knowledge is power", type: "wizard", points: 3 },
      { text: "Adaptability leads to success", type: "rogue", points: 3 }
    ]
  }
]

export const characterClasses = {
  warrior: {
    name: "Warrior",
    icon: "⚔️",
    description: "Strong and determined, you face challenges head-on with unwavering resolve.",
    statBonus: { health: 20, xp: 0, gold: 0 },
    color: "#e63946",
    dominantStat: "strength"
  },
  wizard: {
    name: "Wizard",
    icon: "🧙",
    description: "Wise and strategic, you solve problems through knowledge and careful planning.",
    statBonus: { health: 0, xp: 20, gold: 0 },
    color: "#4361ee",
    dominantStat: "intelligence"
  },
  rogue: {
    name: "Rogue",
    icon: "🗡️",
    description: "Quick and adaptable, you achieve success through efficiency and flexibility.",
    statBonus: { health: 0, xp: 10, gold: 10 },
    color: "#06ffa5",
    dominantStat: "agility"
  },
  ascendant: {
    name: "Ascendant",
    icon: "✨",
    description: "Transcendent master of all paths. You have achieved perfection in every discipline.",
    statBonus: { health: 50, xp: 50, gold: 50 },
    color: "#d4af37",
    dominantStat: "all"
  }
}

/**
 * Check if user qualifies for Ascendant class
 * Requirements: Level 7 in all three base classes + all stats maxed
 */
export function checkAscendantUnlock(character, classProgress) {
  // Check if reached level 7 in all three base classes
  const hasWarriorMastery = classProgress?.warrior?.maxLevel >= 7
  const hasWizardMastery = classProgress?.wizard?.maxLevel >= 7
  const hasRogueMastery = classProgress?.rogue?.maxLevel >= 7
  
  // Check if all stats are at maximum (let's say 100+ each)
  const allStatsMaxed = 
    character.stats.strength >= 100 &&
    character.stats.intelligence >= 100 &&
    character.stats.agility >= 100 &&
    character.stats.charisma >= 100
  
  return hasWarriorMastery && hasWizardMastery && hasRogueMastery && allStatsMaxed
}

/**
 * Determine class based on stat dominance rule
 * A stat must exceed the other two core stats by at least 10 points
 * Returns the new class or null if no change needed
 */
export function calculateClassByStatDominance(stats, currentClass, isAscendant) {
  const { strength, intelligence, agility } = stats
  
  // If Ascendant, they can stay Ascendant regardless of stats
  // But if they want to switch, dominance rule still applies
  
  // Check Warrior (Strength dominance)
  if (strength >= intelligence + 10 && strength >= agility + 10) {
    return 'warrior'
  }
  
  // Check Wizard (Intelligence dominance)
  if (intelligence >= strength + 10 && intelligence >= agility + 10) {
    return 'wizard'
  }
  
  // Check Rogue (Agility dominance)
  if (agility >= strength + 10 && agility >= intelligence + 10) {
    return 'rogue'
  }
  
  // No stat has +10 dominance - keep current class
  return null
}

export function calculateCharacterClass(answers) {
  const scores = {
    warrior: 0,
    wizard: 0,
    rogue: 0
  }

  answers.forEach(answer => {
    scores[answer.type] += answer.points
  })

  // Find the class with highest score
  const maxScore = Math.max(scores.warrior, scores.wizard, scores.rogue)
  
  if (scores.warrior === maxScore) return 'warrior'
  if (scores.wizard === maxScore) return 'wizard'
  return 'rogue'
}
