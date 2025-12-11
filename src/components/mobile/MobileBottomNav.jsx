import './MobileBottomNav.css'

function MobileBottomNav({ 
  activeTab, 
  onTabChange, 
  friendRequestsCount = 0,
  inventoryItemsCount = 0 
}) {
  const tabs = [
    { id: 'quests', icon: '🏠', label: 'Home' },
    { id: 'friends', icon: '👥', label: 'Social', badge: friendRequestsCount },
    { id: 'character', icon: '⚔️', label: 'Character' },
    { id: 'shop', icon: '🏪', label: 'Shop' },
    { id: 'menu', icon: '⚙️', label: 'Settings' }
  ]

  return (
    <nav className="mobile-bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`mobile-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <div className="mobile-nav-icon">
            {tab.icon}
            {tab.badge > 0 && (
              <span className="mobile-nav-badge">{tab.badge}</span>
            )}
          </div>
          <span className="mobile-nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default MobileBottomNav
