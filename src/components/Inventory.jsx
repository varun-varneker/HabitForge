import { SHOP_ITEMS } from '../data/shopItems'
import { getItemQuantity, getActiveEffects, getTimeRemaining } from '../utils/inventoryManager'

function Inventory({ inventory, onUseItem, onClose }) {
  const activeEffects = getActiveEffects(inventory)
  
  const inventoryItems = Object.keys(inventory.items)
    .map(itemId => {
      const item = SHOP_ITEMS.find(i => i.id === itemId)
      const quantity = getItemQuantity(inventory, itemId)
      return { ...item, quantity }
    })
    .filter(item => item.quantity > 0)

  return (
    <div className="inventory-overlay">
      <div className="inventory-modal">
        <div className="inventory-header">
          <h2>🎒 Inventory</h2>
          <button className="inventory-close" onClick={onClose}>✕</button>
        </div>

        {activeEffects.length > 0 && (
          <div className="active-effects-section">
            <h3>⚡ Active Effects</h3>
            <div className="active-effects-list">
              {activeEffects.map(effect => (
                <div key={effect.id} className="active-effect">
                  <div className="effect-info">
                    <span className="effect-name">
                      {effect.type === 'xp_boost' && '📈 XP Boost'}
                      {effect.type === 'gold_boost' && '💰 Gold Boost'}
                      {effect.type === 'streak_freeze' && '🛡️ Streak Protected'}
                    </span>
                    <span className="effect-multiplier">
                      {effect.multiplier && `${((effect.multiplier - 1) * 100).toFixed(0)}%`}
                    </span>
                  </div>
                  <div className="effect-time">
                    ⏱️ {getTimeRemaining(effect)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="inventory-items-section">
          <h3>📦 Items</h3>
          {inventoryItems.length === 0 ? (
            <div className="empty-inventory">
              <p>Your inventory is empty</p>
              <p className="empty-hint">Visit the shop to purchase items!</p>
            </div>
          ) : (
            <div className="inventory-grid">
              {inventoryItems.map(item => (
                <div key={item.id} className="inventory-item">
                  <div className="inventory-item-icon">{item.icon}</div>
                  <div className="inventory-item-info">
                    <div className="inventory-item-name">{item.name}</div>
                    <div className="inventory-item-quantity">x{item.quantity}</div>
                    <div className="inventory-item-description">{item.description}</div>
                  </div>
                  <button
                    className="btn-use-item"
                    onClick={() => onUseItem(item)}
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="permanent-upgrades-section">
          <h3>⬆️ Permanent Upgrades</h3>
          {inventory.purchasedUpgrades.length === 0 ? (
            <div className="no-upgrades">
              <p>No permanent upgrades yet</p>
            </div>
          ) : (
            <div className="upgrades-list">
              {inventory.purchasedUpgrades.map(upgradeId => {
                const upgrade = SHOP_ITEMS.find(item => item.id === upgradeId)
                return (
                  <div key={upgradeId} className="upgrade-item">
                    <span className="upgrade-icon">{upgrade.icon}</span>
                    <span className="upgrade-name">{upgrade.name}</span>
                    <span className="upgrade-badge">✓ Active</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Inventory
