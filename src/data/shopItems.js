// Shop System - Utility Items, Boosts, and Upgrades

export const SHOP_CATEGORIES = {
  CONSUMABLES: 'consumables',
  BOOSTS: 'boosts',
  PROTECTION: 'protection',
  UPGRADES: 'upgrades',
  UTILITIES: 'utilities'
}

export const SHOP_ITEMS = [
  // XP BOOST ITEMS
  {
    id: 'small_xp_potion',
    name: 'Small XP Potion',
    description: '+5% XP gain for 30 minutes',
    category: SHOP_CATEGORIES.BOOSTS,
    icon: '🧪',
    price: 50,
    effect: {
      type: 'xp_boost',
      multiplier: 1.05,
      duration: 30 * 60 * 1000 // 30 minutes in milliseconds
    },
    stackable: true,
    maxStack: 10
  },
  {
    id: 'medium_xp_scroll',
    name: 'Medium XP Scroll',
    description: '+10% XP gain for 24 hours',
    category: SHOP_CATEGORIES.BOOSTS,
    icon: '📜',
    price: 200,
    effect: {
      type: 'xp_boost',
      multiplier: 1.10,
      duration: 24 * 60 * 60 * 1000 // 24 hours
    },
    stackable: true,
    maxStack: 5
  },
  {
    id: 'major_xp_elixir',
    name: 'Major XP Elixir',
    description: '+20% XP gain for 3 days',
    category: SHOP_CATEGORIES.BOOSTS,
    icon: '⚗️',
    price: 500,
    effect: {
      type: 'xp_boost',
      multiplier: 1.20,
      duration: 3 * 24 * 60 * 60 * 1000 // 3 days
    },
    stackable: true,
    maxStack: 3
  },

  // HEALTH POTIONS
  {
    id: 'minor_health_potion',
    name: 'Minor Health Potion',
    description: 'Restores 25 HP instantly',
    category: SHOP_CATEGORIES.CONSUMABLES,
    icon: '🧉',
    price: 75,
    effect: {
      type: 'heal',
      amount: 25
    },
    stackable: true,
    maxStack: 10
  },
  {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Restores 50 HP instantly',
    category: SHOP_CATEGORIES.CONSUMABLES,
    icon: '🍶',
    price: 150,
    effect: {
      type: 'heal',
      amount: 50
    },
    stackable: true,
    maxStack: 10
  },
  {
    id: 'major_health_potion',
    name: 'Major Health Potion',
    description: 'Restores 100 HP instantly',
    category: SHOP_CATEGORIES.CONSUMABLES,
    icon: '⚱️',
    price: 300,
    effect: {
      type: 'heal',
      amount: 100
    },
    stackable: true,
    maxStack: 10
  },
  {
    id: 'full_restore',
    name: 'Full Restore',
    description: 'Restores HP to maximum',
    category: SHOP_CATEGORIES.CONSUMABLES,
    icon: '💊',
    price: 500,
    effect: {
      type: 'heal',
      amount: 'full'
    },
    stackable: true,
    maxStack: 5
  },

  // STREAK PROTECTION
  {
    id: 'streak_shield_24h',
    name: '24-Hour Streak Shield',
    description: 'Protects streak for 24 hours (basic freeze)',
    category: SHOP_CATEGORIES.PROTECTION,
    icon: '🛡️',
    price: 100,
    effect: {
      type: 'streak_freeze',
      duration: 24 * 60 * 60 * 1000
    },
    stackable: true,
    maxStack: 5
  },
  {
    id: 'premium_streak_shield',
    name: 'Premium Streak Shield',
    description: 'Protects streak for an entire week (7 days)',
    category: SHOP_CATEGORIES.PROTECTION,
    icon: '🛡️✨',
    price: 600,
    effect: {
      type: 'streak_freeze',
      duration: 7 * 24 * 60 * 60 * 1000 // 7 days
    },
    stackable: true,
    maxStack: 3
  },
  {
    id: 'immortal_shield',
    name: 'Immortal Shield',
    description: 'Prevents death once (auto-revive with 50 HP)',
    category: SHOP_CATEGORIES.PROTECTION,
    icon: '⚜️',
    price: 1000,
    effect: {
      type: 'death_protection',
      reviveHP: 50
    },
    stackable: true,
    maxStack: 1
  },

  // TASK UTILITIES
  {
    id: 'task_reset_token',
    name: 'Task Reset Token',
    description: 'Redo a missed task without penalty',
    category: SHOP_CATEGORIES.UTILITIES,
    icon: '🔄',
    price: 250,
    effect: {
      type: 'task_reset',
      allowRedo: true
    },
    stackable: true,
    maxStack: 5
  },
  {
    id: 'time_rewind',
    name: 'Time Rewind',
    description: 'Restore yesterday\'s missed daily quests',
    category: SHOP_CATEGORIES.UTILITIES,
    icon: '⏪',
    price: 400,
    effect: {
      type: 'task_restore',
      days: 1
    },
    stackable: true,
    maxStack: 3
  },

  // PERMANENT UPGRADES
  {
    id: 'inventory_upgrade_tier1',
    name: 'Inventory Upgrade (Tier 1)',
    description: 'Increases potion storage capacity by +5 slots',
    category: SHOP_CATEGORIES.UPGRADES,
    icon: '🎒',
    price: 500,
    effect: {
      type: 'inventory_upgrade',
      tier: 1,
      slotIncrease: 5
    },
    stackable: false,
    permanent: true
  },
  {
    id: 'inventory_upgrade_tier2',
    name: 'Inventory Upgrade (Tier 2)',
    description: 'Increases potion storage capacity by +10 slots',
    category: SHOP_CATEGORIES.UPGRADES,
    icon: '🎒✨',
    price: 1000,
    effect: {
      type: 'inventory_upgrade',
      tier: 2,
      slotIncrease: 10
    },
    stackable: false,
    permanent: true,
    requires: 'inventory_upgrade_tier1'
  },
  {
    id: 'inventory_upgrade_tier3',
    name: 'Inventory Upgrade (Tier 3)',
    description: 'Increases potion storage capacity by +15 slots',
    category: SHOP_CATEGORIES.UPGRADES,
    icon: '🎒💎',
    price: 2000,
    effect: {
      type: 'inventory_upgrade',
      tier: 3,
      slotIncrease: 15
    },
    stackable: false,
    permanent: true,
    requires: 'inventory_upgrade_tier2'
  },

  // QUEST SLOT UNLOCKS
  {
    id: 'quest_slot_1',
    name: 'Quest Slot Unlock +1',
    description: 'Unlock 1 additional quest slot',
    category: SHOP_CATEGORIES.UPGRADES,
    icon: '📋',
    price: 300,
    effect: {
      type: 'quest_slot',
      slots: 1
    },
    stackable: false,
    permanent: true
  },
  {
    id: 'quest_slot_2',
    name: 'Quest Slot Unlock +2',
    description: 'Unlock 2 additional quest slots',
    category: SHOP_CATEGORIES.UPGRADES,
    icon: '📋📋',
    price: 700,
    effect: {
      type: 'quest_slot',
      slots: 2
    },
    stackable: false,
    permanent: true,
    requires: 'quest_slot_1'
  },
  {
    id: 'quest_slot_3',
    name: 'Quest Slot Unlock +3',
    description: 'Unlock 3 additional quest slots',
    category: SHOP_CATEGORIES.UPGRADES,
    icon: '📋📋📋',
    price: 1500,
    effect: {
      type: 'quest_slot',
      slots: 3
    },
    stackable: false,
    permanent: true,
    requires: 'quest_slot_2'
  },

  // GOLD BOOSTERS
  {
    id: 'gold_doubler_1h',
    name: 'Gold Doubler (1 Hour)',
    description: 'Double gold rewards for 1 hour',
    category: SHOP_CATEGORIES.BOOSTS,
    icon: '💰',
    price: 100,
    effect: {
      type: 'gold_boost',
      multiplier: 2.0,
      duration: 60 * 60 * 1000 // 1 hour
    },
    stackable: true,
    maxStack: 5
  },
  {
    id: 'gold_doubler_24h',
    name: 'Gold Doubler (24 Hours)',
    description: 'Double gold rewards for 24 hours',
    category: SHOP_CATEGORIES.BOOSTS,
    icon: '💰✨',
    price: 400,
    effect: {
      type: 'gold_boost',
      multiplier: 2.0,
      duration: 24 * 60 * 60 * 1000
    },
    stackable: true,
    maxStack: 3
  },

  // STAT BOOSTERS
  {
    id: 'stat_boost_potion',
    name: 'Stat Boost Potion',
    description: '+5 to a chosen stat permanently',
    category: SHOP_CATEGORIES.CONSUMABLES,
    icon: '💪',
    price: 800,
    effect: {
      type: 'stat_boost',
      amount: 5,
      chooseStat: true
    },
    stackable: true,
    maxStack: 10
  }
]

// Get items by category
export const getItemsByCategory = (category) => {
  return SHOP_ITEMS.filter(item => item.category === category)
}

// Get item by ID
export const getItemById = (itemId) => {
  return SHOP_ITEMS.find(item => item.id === itemId)
}

// Check if item is affordable
export const canAfford = (itemPrice, currentGold) => {
  return currentGold >= itemPrice
}

// Check if upgrade is available
export const canPurchaseUpgrade = (item, purchasedUpgrades) => {
  if (!item.requires) return true
  return purchasedUpgrades.includes(item.requires)
}

// Get category display info
export const getCategoryInfo = (category) => {
  const info = {
    [SHOP_CATEGORIES.CONSUMABLES]: {
      name: 'Consumables',
      icon: '🧪',
      description: 'Potions and one-time use items'
    },
    [SHOP_CATEGORIES.BOOSTS]: {
      name: 'Boost Items',
      icon: '⚡',
      description: 'Temporary power-ups and multipliers'
    },
    [SHOP_CATEGORIES.PROTECTION]: {
      name: 'Protection',
      icon: '🛡️',
      description: 'Shields and safety items'
    },
    [SHOP_CATEGORIES.UPGRADES]: {
      name: 'Permanent Upgrades',
      icon: '⬆️',
      description: 'One-time purchases with lasting effects'
    },
    [SHOP_CATEGORIES.UTILITIES]: {
      name: 'Utilities',
      icon: '🔧',
      description: 'Task management and special tools'
    }
  }
  return info[category] || {}
}

// Format duration for display
export const formatDuration = (milliseconds) => {
  const minutes = Math.floor(milliseconds / (60 * 1000))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  return `${minutes} minute${minutes > 1 ? 's' : ''}`
}
