import { useState, useEffect } from 'react'
import { useGuild } from '../contexts/GuildContext'
import { GUILD_TIERS, GUILD_BANNERS } from '../data/guildData'

function GuildBrowser({ onClose, onCreateGuild }) {
  const { allGuilds, loadAllGuilds, joinGuild } = useGuild()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    loadGuilds()
  }, [])

  const loadGuilds = async () => {
    setLoading(true)
    await loadAllGuilds()
    setLoading(false)
  }

  const handleJoinGuild = async (guildId) => {
    if (joining) return
    
    setJoining(true)
    try {
      await joinGuild(guildId)
      onClose()
    } catch (error) {
      alert(error.message)
    } finally {
      setJoining(false)
    }
  }

  const filteredGuilds = allGuilds.filter(guild => {
    const matchesSearch = guild.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guild.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = tierFilter === 'all' || guild.tier === tierFilter
    
    return matchesSearch && matchesTier
  })

  const getBannerIcon = (bannerId) => {
    const banner = GUILD_BANNERS.find(b => b.id === bannerId)
    return banner?.icon || '🛡️'
  }

  const getMaxMembers = (tier) => {
    return GUILD_TIERS[tier]?.maxMembers || 5
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content guild-browser" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏰 Browse Guilds</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="guild-browser-controls">
          <input
            type="text"
            placeholder="Search guilds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="guild-search-input"
          />

          <div className="tier-filters">
            <button 
              className={`tier-filter-btn ${tierFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTierFilter('all')}
            >
              All Tiers
            </button>
            {Object.entries(GUILD_TIERS).map(([key, tier]) => (
              <button
                key={key}
                className={`tier-filter-btn ${tierFilter === key ? 'active' : ''}`}
                onClick={() => setTierFilter(key)}
              >
                {tier.icon} {tier.name}
              </button>
            ))}
          </div>
        </div>

        <button className="create-guild-btn" onClick={onCreateGuild}>
          ⚔️ Create Your Own Guild
        </button>

        {loading ? (
          <div className="loading-state">Loading guilds...</div>
        ) : (
          <div className="guilds-list">
            {filteredGuilds.length === 0 ? (
              <div className="no-guilds">
                <p>No guilds found. Be the first to create one!</p>
              </div>
            ) : (
              filteredGuilds.map(guild => {
                const tierInfo = GUILD_TIERS[guild.tier]
                const maxMembers = getMaxMembers(guild.tier)
                const isFull = guild.memberCount >= maxMembers

                return (
                  <div key={guild.id} className="guild-card">
                    <div className="guild-card-header">
                      <div className="guild-banner-icon">{getBannerIcon(guild.banner)}</div>
                      <div className="guild-card-info">
                        <h3>{guild.name}</h3>
                        <div className="guild-tier-badge" style={{ backgroundColor: tierInfo.color }}>
                          {tierInfo.icon} {tierInfo.name}
                        </div>
                      </div>
                      <div className="guild-level-badge">
                        Lvl {guild.level || 1}
                      </div>
                    </div>

                    {guild.description && (
                      <p className="guild-description">{guild.description}</p>
                    )}

                    <div className="guild-card-stats">
                      <div className="guild-stat">
                        <span className="stat-label">👥 Members</span>
                        <span className="stat-value">{guild.memberCount || 0}/{maxMembers}</span>
                      </div>
                      <div className="guild-stat">
                        <span className="stat-label">📊 Total Stats</span>
                        <span className="stat-value">{guild.totalStats || 0}</span>
                      </div>
                      <div className="guild-stat">
                        <span className="stat-label">⚡ XP Bonus</span>
                        <span className="stat-value">+{(tierInfo.xpBonus * 100).toFixed(0)}%</span>
                      </div>
                      <div className="guild-stat">
                        <span className="stat-label">🏆 Quest Streak</span>
                        <span className="stat-value">{guild.weeklyQuests?.streak || 0}</span>
                      </div>
                    </div>

                    <button
                      className="join-guild-btn"
                      onClick={() => handleJoinGuild(guild.id)}
                      disabled={isFull || joining}
                    >
                      {isFull ? '🔒 Guild Full' : joining ? 'Joining...' : '⚔️ Join Guild'}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GuildBrowser
