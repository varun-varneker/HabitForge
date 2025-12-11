// Inventory Management System

const DEFAULT_INVENTORY_SIZE = 20

export const createInventory = () => {
  return {
    items: {}, // { itemId: quantity }
    activeEffects: [], // Active buffs/effects
    maxSize: DEFAULT_INVENTORY_SIZE,
    purchasedUpgrades: [] // Permanent upgrades
  }
}

// Add item to inventory
export const addItemToInventory = (inventory, itemId, quantity = 1) => {
  const newInventory = { ...inventory }
  const currentQuantity = newInventory.items[itemId] || 0
  newInventory.items[itemId] = currentQuantity + quantity
  return newInventory
}

// Remove item from inventory
export const removeItemFromInventory = (inventory, itemId, quantity = 1) => {
  const newInventory = { ...inventory }
  const currentQuantity = newInventory.items[itemId] || 0
  const newQuantity = Math.max(0, currentQuantity - quantity)
  
  if (newQuantity === 0) {
    delete newInventory.items[itemId]
  } else {
    newInventory.items[itemId] = newQuantity
  }
  
  return newInventory
}

// Get item quantity
export const getItemQuantity = (inventory, itemId) => {
  return inventory.items[itemId] || 0
}

// Check if inventory has space
export const hasInventorySpace = (inventory) => {
  const totalItems = Object.values(inventory.items).reduce((sum, qty) => sum + qty, 0)
  return totalItems < inventory.maxSize
}

// Get total inventory usage
export const getInventoryUsage = (inventory) => {
  const totalItems = Object.values(inventory.items).reduce((sum, qty) => sum + qty, 0)
  return {
    used: totalItems,
    max: inventory.maxSize,
    percentage: (totalItems / inventory.maxSize) * 100
  }
}

// Apply inventory upgrade
export const applyInventoryUpgrade = (inventory, slotIncrease, upgradeId) => {
  const newInventory = { ...inventory }
  newInventory.maxSize += slotIncrease
  if (!newInventory.purchasedUpgrades.includes(upgradeId)) {
    newInventory.purchasedUpgrades.push(upgradeId)
  }
  return newInventory
}

// Active Effects Management
export const addActiveEffect = (inventory, effect) => {
  const newInventory = { ...inventory }
  const activeEffect = {
    ...effect,
    startTime: Date.now(),
    endTime: Date.now() + effect.duration,
    id: `${effect.type}_${Date.now()}`
  }
  newInventory.activeEffects.push(activeEffect)
  return newInventory
}

export const removeExpiredEffects = (inventory) => {
  const now = Date.now()
  const newInventory = { ...inventory }
  newInventory.activeEffects = newInventory.activeEffects.filter(
    effect => effect.endTime > now
  )
  return newInventory
}

export const getActiveEffects = (inventory) => {
  const now = Date.now()
  return inventory.activeEffects.filter(effect => effect.endTime > now)
}

export const hasActiveEffect = (inventory, effectType) => {
  const activeEffects = getActiveEffects(inventory)
  return activeEffects.some(effect => effect.type === effectType)
}

export const getEffectMultiplier = (inventory, effectType) => {
  const activeEffects = getActiveEffects(inventory)
  const effect = activeEffects.find(e => e.type === effectType)
  return effect ? effect.multiplier : 1.0
}

// Calculate total multipliers
export const calculateTotalMultipliers = (inventory) => {
  const activeEffects = getActiveEffects(inventory)
  
  let xpMultiplier = 1.0
  let goldMultiplier = 1.0
  
  activeEffects.forEach(effect => {
    if (effect.type === 'xp_boost') {
      xpMultiplier *= effect.multiplier
    } else if (effect.type === 'gold_boost') {
      goldMultiplier *= effect.multiplier
    }
  })
  
  return { xpMultiplier, goldMultiplier }
}

// Format time remaining
export const getTimeRemaining = (effect) => {
  const now = Date.now()
  const remaining = effect.endTime - now
  
  if (remaining <= 0) return 'Expired'
  
  const minutes = Math.floor(remaining / (60 * 1000))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}
