// Guild System Data Structures and Constants

export const GUILD_TIERS = {
  casual: {
    name: 'Casual',
    maxMembers: 5,
    xpBonus: 0.10, // 10%
    color: '#7fb3d5',
    icon: '🛡️',
    description: 'Perfect for friends starting their journey together'
  },
  competitive: {
    name: 'Competitive',
    maxMembers: 7,
    xpBonus: 0.15, // 15%
    color: '#f39c12',
    icon: '⚔️',
    description: 'For dedicated heroes seeking greater challenges',
    requirement: 'Guild Level 3'
  },
  elite: {
    name: 'Elite',
    maxMembers: 10,
    xpBonus: 0.20, // 20%
    color: '#e74c3c',
    icon: '👑',
    description: 'The pinnacle of heroic guilds',
    requirement: 'Guild Level 7'
  }
}

export const GUILD_ROLES = {
  leader: {
    name: 'Guild Leader',
    icon: '👑',
    color: '#ffd700',
    permissions: ['all']
  },
  officer: {
    name: 'Officer',
    icon: '⭐',
    color: '#ff6b6b',
    permissions: ['accept_members', 'kick_members', 'set_quests', 'manage_treasury']
  },
  member: {
    name: 'Member',
    icon: '🛡️',
    color: '#a0a0a0',
    permissions: ['chat', 'contribute', 'donate']
  }
}

export const GUILD_BANNERS = [
  { id: 'dragon', icon: '🐉', name: 'Dragon Banner', cost: 0 },
  { id: 'phoenix', icon: '🔥', name: 'Phoenix Banner', cost: 100 },
  { id: 'wolf', icon: '🐺', name: 'Wolf Pack Banner', cost: 100 },
  { id: 'eagle', icon: '🦅', name: 'Eagle Banner', cost: 100 },
  { id: 'lion', icon: '🦁', name: 'Lion Banner', cost: 200 },
  { id: 'skull', icon: '💀', name: 'Skull Banner', cost: 200 },
  { id: 'crown', icon: '👑', name: 'Royal Crown', cost: 500 },
  { id: 'star', icon: '⭐', name: 'Stellar Banner', cost: 500 },
  { id: 'sword', icon: '⚔️', name: 'Crossed Swords', cost: 300 },
  { id: 'shield', icon: '🛡️', name: 'Divine Shield', cost: 300 }
]

export const WEEKLY_GUILD_QUESTS = [
  {
    id: 'total_quests_100',
    name: 'Century Challenge',
    description: 'Complete 100 total quests as a guild',
    target: 100,
    rewards: { gold: 500, guildXP: 1000 }
  },
  {
    id: 'total_quests_200',
    name: 'Double Century',
    description: 'Complete 200 total quests as a guild',
    target: 200,
    rewards: { gold: 1000, guildXP: 2000 }
  },
  {
    id: 'hard_quests_50',
    name: 'Trial by Fire',
    description: 'Complete 50 Hard difficulty quests',
    target: 50,
    difficulty: 'hard',
    rewards: { gold: 800, guildXP: 1500 }
  },
  {
    id: 'diverse_categories',
    name: 'Well Rounded',
    description: 'Complete at least 10 quests in each category',
    target: 10,
    categories: ['strength', 'intelligence', 'agility', 'charisma'],
    rewards: { gold: 600, guildXP: 1200 }
  },
  {
    id: 'member_participation',
    name: 'United We Stand',
    description: 'All guild members complete at least 5 quests',
    target: 5,
    type: 'participation',
    rewards: { gold: 1000, guildXP: 2500 }
  }
]

export const GUILD_ACHIEVEMENTS = [
  {
    id: 'first_guild',
    name: 'Guild Founder',
    description: 'Create your first guild',
    icon: '🏰',
    rewards: { gold: 100 }
  },
  {
    id: 'guild_level_5',
    name: 'Rising Power',
    description: 'Reach Guild Level 5',
    icon: '📈',
    rewards: { gold: 500 }
  },
  {
    id: 'guild_level_10',
    name: 'Legendary Guild',
    description: 'Reach Guild Level 10',
    icon: '🌟',
    rewards: { gold: 1000 }
  },
  {
    id: 'full_roster',
    name: 'Full House',
    description: 'Reach maximum guild capacity',
    icon: '👥',
    rewards: { gold: 300 }
  },
  {
    id: 'weekly_quest_streak_4',
    name: 'Unstoppable',
    description: 'Complete weekly guild quest 4 weeks in a row',
    icon: '🔥',
    rewards: { gold: 800 }
  },
  {
    id: 'top_10_guild',
    name: 'Elite Circle',
    description: 'Enter the top 10 guilds',
    icon: '🏆',
    rewards: { gold: 1500 }
  }
]

export function calculateGuildLevel(guildXP) {
  // Guild leveling formula: Level = floor(sqrt(XP / 100))
  const level = Math.floor(Math.sqrt(guildXP / 100))
  const currentLevelXP = level * level * 100
  const nextLevelXP = (level + 1) * (level + 1) * 100
  const xpToNextLevel = nextLevelXP - guildXP
  const progress = ((guildXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  
  return {
    level: Math.max(1, level),
    xpToNextLevel,
    progress: Math.min(100, Math.max(0, progress))
  }
}

export function getGuildBonusMultiplier(guildLevel, tier) {
  const baseTierBonus = GUILD_TIERS[tier]?.xpBonus || 0.10
  const levelBonus = Math.floor(guildLevel / 5) * 0.05 // +5% every 5 levels
  return baseTierBonus + levelBonus
}
