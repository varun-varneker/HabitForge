import { useState } from 'react'
import { SHOP_ITEMS, SHOP_CATEGORIES, getCategoryInfo, getItemsByCategory, canAfford, canPurchaseUpgrade, formatDuration } from '../data/shopItems'
import { getItemQuantity, hasInventorySpace, getInventoryUsage } from '../utils/inventoryManager'

function Shop({ character, inventory, onPurchase, onClose, onUseItem }) {
  const [selectedCategory, setSelectedCategory] = useState(SHOP_CATEGORIES.CONSUMABLES)
  const [selectedItem, setSelectedItem] = useState(null)

  const categories = Object.values(SHOP_CATEGORIES)
  const inventoryUsage = getInventoryUsage(inventory)

  const handlePurchase = (item) => {
    if (!canAfford(item.price, character.gold)) {
      alert(`Not enough gold! You need ${item.price} gold but only have ${character.gold}.`)
      return
    }

    if (item.permanent && inventory.purchasedUpgrades.includes(item.id)) {
      alert('You already own this upgrade!')
      return
    }

    if (item.requires && !canPurchaseUpgrade(item, inventory.purchasedUpgrades)) {
      const requiredItem = SHOP_ITEMS.find(i => i.id === item.requires)
      alert(`You must purchase ${requiredItem.name} first!`)
      return
    }

    if (!item.permanent && !hasInventorySpace(inventory)) {
      alert(`Inventory full! (${inventoryUsage.used}/${inventoryUsage.max})`)
      return
    }

    onPurchase(item)
    setSelectedItem(null)
  }

  const handleUse = (item) => {
    const quantity = getItemQuantity(inventory, item.id)
    if (quantity <= 0) {
      alert('You don\'t have this item!')
      return
    }
    onUseItem(item)
  }

  return (
    <div className="shop-overlay">
      <div className="shop-modal">
        <div className="shop-header">
          <h2>🏪 Hero's Shop</h2>
          <button className="shop-close" onClick={onClose}>✕</button>
        </div>

        <div className="shop-stats">
          <div className="shop-gold">
            💰 Gold: <span className="gold-amount">{character.gold}</span>
          </div>
          <div className="shop-inventory">
            🎒 Inventory: <span className={inventoryUsage.percentage >= 90 ? 'inventory-full' : ''}>
              {inventoryUsage.used}/{inventoryUsage.max}
            </span>
          </div>
        </div>

        <div className="shop-content">
          <div className="shop-categories">
            {categories.map(category => {
              const info = getCategoryInfo(category)
              return (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span className="category-icon">{info.icon}</span>
                  <span className="category-name">{info.name}</span>
                </button>
              )
            })}
          </div>

          <div className="shop-items-container">
            <div className="category-header">
              <h3>{getCategoryInfo(selectedCategory).name}</h3>
              <p className="category-description">{getCategoryInfo(selectedCategory).description}</p>
            </div>

            <div className="shop-items-grid">
              {getItemsByCategory(selectedCategory).map(item => {
                const owned = getItemQuantity(inventory, item.id)
                const isPermanentOwned = item.permanent && inventory.purchasedUpgrades.includes(item.id)
                const canBuy = canAfford(item.price, character.gold)
                const meetsRequirements = canPurchaseUpgrade(item, inventory.purchasedUpgrades)

                return (
                  <div 
                    key={item.id} 
                    className={`shop-item ${selectedItem?.id === item.id ? 'selected' : ''} ${isPermanentOwned ? 'owned' : ''}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="item-icon">{item.icon}</div>
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-description">{item.description}</div>
                      
                      {item.effect.duration && (
                        <div className="item-duration">
                          ⏱️ {formatDuration(item.effect.duration)}
                        </div>
                      )}
                      
                      <div className="item-price">
                        💰 {item.price} gold
                      </div>

                      {owned > 0 && !item.permanent && (
                        <div className="item-owned">
                          Owned: {owned}/{item.maxStack}
                        </div>
                      )}

                      {isPermanentOwned && (
                        <div className="item-permanent-owned">
                          ✓ Purchased
                        </div>
                      )}

                      {item.requires && !meetsRequirements && (
                        <div className="item-requirement">
                          Requires: {SHOP_ITEMS.find(i => i.id === item.requires)?.name}
                        </div>
                      )}
                    </div>

                    <div className="item-actions">
                      {!isPermanentOwned && (
                        <button
                          className={`btn-buy ${!canBuy || !meetsRequirements ? 'disabled' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePurchase(item)
                          }}
                          disabled={!canBuy || !meetsRequirements}
                        >
                          {canBuy && meetsRequirements ? 'Buy' : !canBuy ? 'Too Expensive' : 'Locked'}
                        </button>
                      )}
                      
                      {owned > 0 && !item.permanent && (
                        <button
                          className="btn-use"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUse(item)
                          }}
                        >
                          Use
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {selectedItem && (
          <div className="shop-item-details">
            <h4>{selectedItem.icon} {selectedItem.name}</h4>
            <p>{selectedItem.description}</p>
            <div className="item-details-stats">
              <span>💰 Price: {selectedItem.price}</span>
              {selectedItem.permanent && <span className="permanent-badge">⚡ Permanent</span>}
              {selectedItem.effect.duration && <span>⏱️ Duration: {formatDuration(selectedItem.effect.duration)}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop
