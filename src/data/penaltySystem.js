// Enhanced HP Drain & Death Penalty System

export const PENALTY_CONFIG = {
  // HP Drain amounts
  SKIP_QUEST: 10,
  MISSED_DAILY: 15,
  MISSED_WEEKLY: 25,
  MISSED_MONTHLY: 50,
  
  // Death penalties
  DEATH_GOLD_LOSS: 0.5, // 50% of current gold
  DEATH_XP_LOSS: 10,
  DEATH_RECOVERY_HOURS: 24,
  DEATH_REWARD_REDUCTION: 0.5, // 50% reduced rewards during recovery
  
  // HP regeneration
  HP_REGEN_PER_HOUR: 1,
  HP_REGEN_DELAY_PER_MISS: 1, // Hours added to regen delay
  MAX_REGEN_DELAY: 10, // Maximum hours of regen delay
  
  // Health restoration
  QUEST_HEALTH_GAIN: 2
}

export const applyQuestMissPenalty = (character, questType) => {
  const penalties = {
    daily: PENALTY_CONFIG.MISSED_DAILY,
    weekly: PENALTY_CONFIG.MISSED_WEEKLY,
    monthly: PENALTY_CONFIG.MISSED_MONTHLY
  }
  
  const hpLoss = penalties[questType] || PENALTY_CONFIG.SKIP_QUEST
  const newHealth = Math.max(0, character.health - hpLoss)
  
  return {
    ...character,
    health: newHealth,
    isDead: newHealth === 0,
    hpLost: hpLoss
  }
}

export const applyDeathPenalty = (character, streakData) => {
  const goldLoss = Math.floor(character.gold * PENALTY_CONFIG.DEATH_GOLD_LOSS)
  const xpLoss = PENALTY_CONFIG.DEATH_XP_LOSS
  
  // Calculate new XP (can't drop below current level minimum)
  const currentLevelMinXP = 0 // They keep their current level XP progress minimum
  const newXp = Math.max(currentLevelMinXP, character.xp - xpLoss)
  
  const deathTimestamp = Date.now()
  const recoveryEndTime = deathTimestamp + (PENALTY_CONFIG.DEATH_RECOVERY_HOURS * 60 * 60 * 1000)
  
  return {
    character: {
      ...character,
      health: 1, // Revive with 1 HP
      gold: Math.max(0, character.gold - goldLoss),
      xp: newXp,
      isDead: false,
      inRecovery: true,
      recoveryEndTime: recoveryEndTime,
      deathCount: (character.deathCount || 0) + 1
    },
    streak: {
      ...streakData,
      currentStreak: 0,
      lastActiveDate: new Date().toISOString(),
      streakBroken: true
    },
    penalties: {
      goldLost: goldLoss,
      xpLost: xpLoss,
      streakLost: streakData.currentStreak
    }
  }
}

export const checkRecoveryMode = (character) => {
  if (!character.inRecovery || !character.recoveryEndTime) {
    return { inRecovery: false, timeRemaining: 0 }
  }
  
  const now = Date.now()
  const timeRemaining = character.recoveryEndTime - now
  
  if (timeRemaining <= 0) {
    // Recovery period over
    return { inRecovery: false, timeRemaining: 0, recovered: true }
  }
  
  return { 
    inRecovery: true, 
    timeRemaining,
    hoursRemaining: Math.ceil(timeRemaining / (60 * 60 * 1000))
  }
}

export const calculateRewardModifier = (character) => {
  const recovery = checkRecoveryMode(character)
  
  if (recovery.inRecovery) {
    return PENALTY_CONFIG.DEATH_REWARD_REDUCTION // 50% rewards during recovery
  }
  
  return 1.0 // Normal rewards
}

export const formatTimeRemaining = (milliseconds) => {
  const hours = Math.floor(milliseconds / (60 * 60 * 1000))
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export const getWoundedState = (character) => {
  const healthPercent = (character.health / character.maxHealth) * 100
  
  if (healthPercent === 0) {
    return { wounded: true, severity: 'dead', message: '💀 DEFEATED' }
  } else if (healthPercent <= 20) {
    return { wounded: true, severity: 'critical', message: '⚠️ CRITICAL' }
  } else if (healthPercent <= 50) {
    return { wounded: true, severity: 'wounded', message: '🩹 WOUNDED' }
  }
  
  return { wounded: false, severity: 'healthy', message: '' }
}
