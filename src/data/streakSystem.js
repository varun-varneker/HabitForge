// Comprehensive Streak System with Engagement Mechanics

export const STREAK_MILESTONES = [
  { days: 3, name: 'Committed', icon: '🔥', reward: { gold: 50, xp: 100 }, multiplier: 1.1 },
  { days: 7, name: 'Weekly Warrior', icon: '⚡', reward: { gold: 100, xp: 200 }, multiplier: 1.15 },
  { days: 14, name: 'Fortnight Champion', icon: '💪', reward: { gold: 200, xp: 400 }, multiplier: 1.2 },
  { days: 30, name: 'Monthly Master', icon: '👑', reward: { gold: 500, xp: 1000 }, multiplier: 1.3 },
  { days: 50, name: 'Dedication King', icon: '🏆', reward: { gold: 750, xp: 1500 }, multiplier: 1.4 },
  { days: 75, name: 'Legendary Streak', icon: '⭐', reward: { gold: 1000, xp: 2000 }, multiplier: 1.5 },
  { days: 100, name: 'Centurion', icon: '💯', reward: { gold: 2000, xp: 5000 }, multiplier: 1.75 },
  { days: 150, name: 'Unstoppable', icon: '🚀', reward: { gold: 3000, xp: 7500 }, multiplier: 2.0 },
  { days: 200, name: 'Mythic Dedication', icon: '✨', reward: { gold: 5000, xp: 10000 }, multiplier: 2.5 },
  { days: 365, name: 'Year of Excellence', icon: '🎆', reward: { gold: 10000, xp: 25000 }, multiplier: 3.0 }
]

export const STREAK_FREEZE_COST = 100 // Gold cost to freeze streak for 1 day

/**
 * Get current streak multiplier based on active streak days
 */
export function getStreakMultiplier(streakDays) {
  let multiplier = 1.0
  
  for (let i = STREAK_MILESTONES.length - 1; i >= 0; i--) {
    if (streakDays >= STREAK_MILESTONES[i].days) {
      multiplier = STREAK_MILESTONES[i].multiplier
      break
    }
  }
  
  return multiplier
}

/**
 * Get next milestone info
 */
export function getNextMilestone(streakDays) {
  for (const milestone of STREAK_MILESTONES) {
    if (streakDays < milestone.days) {
      return {
        ...milestone,
        daysRemaining: milestone.days - streakDays,
        progress: (streakDays / milestone.days) * 100
      }
    }
  }
  return null // Max milestone reached
}

/**
 * Get current milestone
 */
export function getCurrentMilestone(streakDays) {
  let current = null
  
  for (const milestone of STREAK_MILESTONES) {
    if (streakDays >= milestone.days) {
      current = milestone
    } else {
      break
    }
  }
  
  return current
}

/**
 * Check if user completed any quests today
 */
export function hasCompletedTodayQuest(habits) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return habits.some(habit => {
    if (!habit.lastCompleted) return false
    const completedDate = new Date(habit.lastCompleted)
    completedDate.setHours(0, 0, 0, 0)
    return completedDate.getTime() === today.getTime()
  })
}

/**
 * Calculate streak data
 */
export function calculateStreak(streakData, habits) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastActive = streakData.lastActiveDate ? new Date(streakData.lastActiveDate) : null
  
  if (!lastActive) {
    // First time
    return {
      currentStreak: 0,
      longestStreak: streakData.longestStreak || 0,
      lastActiveDate: null,
      streakFreezes: streakData.streakFreezes || 0,
      totalLoginDays: streakData.totalLoginDays || 0,
      isFrozen: false
    }
  }
  
  const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate())
  const daysDiff = Math.floor((today - lastActiveDay) / (1000 * 60 * 60 * 24))
  
  let currentStreak = streakData.currentStreak || 0
  let isBroken = false
  
  if (daysDiff === 0) {
    // Same day - maintain streak
    return streakData
  } else if (daysDiff === 1) {
    // Consecutive day - only increment if they completed a quest today
    if (hasCompletedTodayQuest(habits)) {
      currentStreak += 1
    }
  } else if (daysDiff > 1) {
    // Missed days - check for freeze
    if (streakData.freezeActive && streakData.freezeUntil) {
      const freezeUntil = new Date(streakData.freezeUntil)
      if (today <= freezeUntil) {
        // Streak is frozen, maintain it
        return {
          ...streakData,
          lastActiveDate: today.toISOString()
        }
      }
    }
    // Streak broken
    currentStreak = 0
    isBroken = true
  }
  
  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, streakData.longestStreak || 0),
    lastActiveDate: today.toISOString(),
    streakFreezes: streakData.streakFreezes || 0,
    totalLoginDays: (streakData.totalLoginDays || 0) + 1,
    isFrozen: false,
    isBroken
  }
}

/**
 * Apply streak freeze
 */
export function applyStreakFreeze(streakData, gold) {
  if (gold < STREAK_FREEZE_COST) {
    return { success: false, message: 'Not enough gold!' }
  }
  
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(23, 59, 59, 999)
  
  return {
    success: true,
    updatedStreak: {
      ...streakData,
      freezeActive: true,
      freezeUntil: tomorrow.toISOString(),
      streakFreezes: (streakData.streakFreezes || 0) + 1
    },
    goldSpent: STREAK_FREEZE_COST
  }
}

/**
 * Get streak recovery offer (if broken within 24 hours)
 */
export function getRecoveryOffer(streakData) {
  if (!streakData.lastActiveDate) return null
  
  const lastActive = new Date(streakData.lastActiveDate)
  const now = new Date()
  const hoursSince = (now - lastActive) / (1000 * 60 * 60)
  
  // Offer recovery within 24 hours of breaking streak
  if (hoursSince <= 24 && (streakData.longestStreak || 0) >= 3) {
    const recoveryCost = Math.min(500, streakData.longestStreak * 10)
    return {
      available: true,
      cost: recoveryCost,
      streakToRecover: streakData.longestStreak
    }
  }
  
  return { available: false }
}

/**
 * Weekly bonus for maintaining 7-day streak
 */
export function getWeeklyBonus(streakDays) {
  if (streakDays > 0 && streakDays % 7 === 0) {
    return {
      gold: 200,
      xp: 500,
      message: `🎁 Weekly Bonus! ${streakDays} days strong!`
    }
  }
  return null
}

/**
 * Generate motivational messages based on streak
 */
export function getStreakMotivation(streakDays) {
  if (streakDays === 0) {
    return "Start your journey today! 🌟"
  } else if (streakDays === 1) {
    return "Great start! Come back tomorrow! 🔥"
  } else if (streakDays < 7) {
    return `${streakDays} days strong! Keep it up! 💪`
  } else if (streakDays < 30) {
    return `${streakDays} day streak! You're unstoppable! ⚡`
  } else if (streakDays < 100) {
    return `${streakDays} days of excellence! Legendary! 👑`
  } else {
    return `${streakDays} DAYS! You're a true master! ✨`
  }
}

/**
 * Check if user is at risk of losing streak
 */
export function isStreakAtRisk(lastActiveDate) {
  if (!lastActiveDate) return false
  
  const lastActive = new Date(lastActiveDate)
  const now = new Date()
  const hoursSince = (now - lastActive) / (1000 * 60 * 60)
  
  // At risk if more than 20 hours since last activity
  return hoursSince >= 20 && hoursSince < 24
}

/**
 * Get streak display color
 */
export function getStreakColor(streakDays) {
  if (streakDays === 0) return '#95a5a6'
  if (streakDays < 7) return '#3498db'
  if (streakDays < 30) return '#9b59b6'
  if (streakDays < 100) return '#e74c3c'
  if (streakDays < 200) return '#f39c12'
  return '#d4af37' // Gold for 200+
}
