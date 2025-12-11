import { useState } from 'react'
import './MobileRadialMenu.css'

function MobileRadialMenu({ 
  activeTab, 
  onTabChange, 
  onLogout,
  onOpenGuild,
  onOpenShop,
  onOpenInventory,
  friendRequestsCount = 0 
}) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleMenuClick = (action) => {
    action()
    setIsOpen(false)
  }

  const menuItems = [
    { 
      id: 'friends', 
      icon: '👥', 
      label: 'Social',
      badge: friendRequestsCount,
      action: () => onTabChange('friends')
    },
    { 
      id: 'inventory', 
      icon: '🎒', 
      label: 'Bag',
      action: onOpenInventory
    },
    { 
      id: 'shop', 
      icon: '🏪', 
      label: 'Shop',
      action: onOpenShop
    },
    { 
      id: 'guild', 
      icon: '🏰', 
      label: 'Guild',
      action: onOpenGuild
    },
    { 
      id: 'logout', 
      icon: '🚪', 
      label: 'Logout',
      action: onLogout,
      danger: true
    }
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="radial-menu-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Items */}
      <div className={`radial-menu ${isOpen ? 'open' : ''}`}>
      {menuItems.map((item, index) => {
        // Start from top and distribute evenly around full circle
        const angle = (360 / menuItems.length) * index - 90
        const radius = 140
        const x = Math.cos((angle * Math.PI) / 180) * radius - 28
        const y = Math.sin((angle * Math.PI) / 180) * radius - 90
        
        return (
            <button
              key={item.id}
              className={`radial-menu-item ${item.danger ? 'danger' : ''} ${activeTab === item.id ? 'active' : ''}`}
              style={{
                transform: isOpen 
                  ? `translate(${x}px, ${y}px) scale(1)` 
                  : 'translate(0, 0) scale(0)',
                transitionDelay: isOpen ? `${index * 0.1}s` : '0s'
              }}
              onClick={() => handleMenuClick(item.action)}
            >
              <span className="radial-menu-icon">{item.icon}</span>
              {item.badge > 0 && (
                <span className="radial-menu-badge">{item.badge}</span>
              )}
              <span className="radial-menu-label">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Main FAB Button */}
      <button 
        className={`radial-menu-fab ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label="Menu"
      >
        <span className="radial-menu-fab-icon">
          {isOpen ? '✕' : '🏠'}
        </span>
      </button>
    </>
  )
}

export default MobileRadialMenu
