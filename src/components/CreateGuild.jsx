import { useState } from 'react'
import { useGuild } from '../contexts/GuildContext'
import { GUILD_BANNERS } from '../data/guildData'

function CreateGuild({ onClose, onSuccess }) {
  const { createGuild } = useGuild()
  const [guildName, setGuildName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedBanner, setSelectedBanner] = useState('dragon')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!guildName.trim()) {
      setError('Guild name is required')
      return
    }

    if (guildName.length < 3) {
      setError('Guild name must be at least 3 characters')
      return
    }

    if (guildName.length > 30) {
      setError('Guild name must be less than 30 characters')
      return
    }

    setCreating(true)
    setError('')

    try {
      await createGuild({
        name: guildName.trim(),
        description: description.trim(),
        banner: selectedBanner
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const freeBanners = GUILD_BANNERS.filter(b => b.cost === 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-guild-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚔️ Create Your Guild</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="create-guild-form">
          <div className="warning-box">
            <strong>⚠️ Important:</strong> Recruit at least one member within 7 days, or your guild will be automatically disbanded!
          </div>

          <div className="form-group">
            <label htmlFor="guildName">Guild Name *</label>
            <input
              id="guildName"
              type="text"
              value={guildName}
              onChange={(e) => setGuildName(e.target.value)}
              placeholder="Enter guild name..."
              maxLength={30}
              className="guild-input"
              disabled={creating}
            />
            <span className="char-count">{guildName.length}/30</span>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell others about your guild..."
              maxLength={200}
              rows={3}
              className="guild-textarea"
              disabled={creating}
            />
            <span className="char-count">{description.length}/200</span>
          </div>

          <div className="form-group">
            <label>Choose Banner</label>
            <div className="banner-selection">
              {freeBanners.map(banner => (
                <button
                  key={banner.id}
                  type="button"
                  className={`banner-option ${selectedBanner === banner.id ? 'selected' : ''}`}
                  onClick={() => setSelectedBanner(banner.id)}
                  disabled={creating}
                >
                  <span className="banner-icon">{banner.icon}</span>
                  <span className="banner-name">{banner.name}</span>
                </button>
              ))}
            </div>
            <p className="banner-note">💰 More banners can be unlocked later with guild treasury</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="guild-info-box">
            <h4>🛡️ Starting Guild Benefits:</h4>
            <ul>
              <li>✅ Up to 5 members (Casual Tier)</li>
              <li>✅ +10% XP bonus for all members</li>
              <li>✅ Weekly guild quests with rewards</li>
              <li>✅ Shared message board</li>
              <li>✅ Guild treasury system</li>
              <li>✅ Compete on leaderboards</li>
            </ul>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={creating || !guildName.trim()}
            >
              {creating ? 'Creating...' : '🏰 Create Guild'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateGuild
