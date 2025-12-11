import { useState, useEffect } from 'react'
import { useGuild } from '../contexts/GuildContext'
import { useAuth } from '../contexts/AuthContext'
import { calculateGuildLevel, GUILD_TIERS, GUILD_BANNERS } from '../data/guildData'
import GuildChat from './GuildChat'

// Import all character level images
import warrior1 from '../assets/Character levels/Warrior/Warrior_level1.png'
import warrior2 from '../assets/Character levels/Warrior/Warrior_level2.png'
import warrior3 from '../assets/Character levels/Warrior/Warrior_level3.png'
import warrior4 from '../assets/Character levels/Warrior/Warrior_level4.png'
import warrior5 from '../assets/Character levels/Warrior/Warrior_level5.png'
import warrior6 from '../assets/Character levels/Warrior/Warrior_level6.png'
import warrior7 from '../assets/Character levels/Warrior/Warrior_level7.png'

import mage1 from '../assets/Character levels/Mage/Mage_level1.png'
import mage2 from '../assets/Character levels/Mage/Mage_level2.png'
import mage3 from '../assets/Character levels/Mage/Mage_level3.png'
import mage4 from '../assets/Character levels/Mage/Mage_level4.png'
import mage5 from '../assets/Character levels/Mage/Mage_level5.png'
import mage6 from '../assets/Character levels/Mage/Mage_level6.png'
import mage7 from '../assets/Character levels/Mage/Mage_level7.png'

import rogue1 from '../assets/Character levels/Rogue/Rogue_level1.png'
import rogue2 from '../assets/Character levels/Rogue/Rogue_level2.png'
import rogue3 from '../assets/Character levels/Rogue/Rogue_level3.png'
import rogue4 from '../assets/Character levels/Rogue/Rogue_level4.png'
import rogue5 from '../assets/Character levels/Rogue/Rogue_level5.png'
import rogue6 from '../assets/Character levels/Rogue/Rogue_level6.png'
import rogue7 from '../assets/Character levels/Rogue/Rogue_level7.png'

import ascendant from '../assets/Character levels/Ascendant.png'

function GuildDashboard({ onClose }) {
  const { currentGuild, leaveGuild, donateToTreasury, getMemberProfile } = useGuild()
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [donateAmount, setDonateAmount] = useState('')
  const [leaving, setLeaving] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [memberProfile, setMemberProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  // Map of all character images by class and level
  const characterImages = {
    warrior: {
      1: warrior1, 2: warrior2, 3: warrior3, 4: warrior4,
      5: warrior5, 6: warrior6, 7: warrior7
    },
    wizard: {
      1: mage1, 2: mage2, 3: mage3, 4: mage4,
      5: mage5, 6: mage6, 7: mage7
    },
    rogue: {
      1: rogue1, 2: rogue2, 3: rogue3, 4: rogue4,
      5: rogue5, 6: rogue6, 7: rogue7
    },
    ascendant: {
      1: ascendant, 2: ascendant, 3: ascendant, 4: ascendant,
      5: ascendant, 6: ascendant, 7: ascendant
    }
  }

  // Get the appropriate image based on class and level
  const getCharacterImage = (characterClass, level) => {
    const classKey = characterClass || 'warrior'
    
    // Ascendant uses the same image for all levels
    if (classKey === 'ascendant') {
      return ascendant
    }
    
    const clampedLevel = Math.min(Math.max(level || 1, 1), 7) // Clamp level between 1-7
    return characterImages[classKey]?.[clampedLevel] || characterImages.warrior[1]
  }

  if (!currentGuild) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content">
          <p>Guild not found</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    )
  }

  const guildLevelInfo = calculateGuildLevel(currentGuild.xp || 0)
  const tierInfo = GUILD_TIERS[currentGuild.tier]
  const bannerInfo = GUILD_BANNERS.find(b => b.id === currentGuild.banner)
  const maxMembers = tierInfo?.maxMembers || 5

  const handleLeaveGuild = async () => {
    if (!confirm('Are you sure you want to leave this guild?')) return
    
    setLeaving(true)
    try {
      await leaveGuild()
      onClose()
    } catch (error) {
      alert(error.message)
    } finally {
      setLeaving(false)
    }
  }

  const handleDonate = async () => {
    const amount = parseInt(donateAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    await donateToTreasury(amount)
    setDonateAmount('')
    alert(`Donated ${amount} gold to guild treasury!`)
  }

  const sortedMembers = [...(currentGuild.members || [])].sort((a, b) => {
    const roleOrder = { leader: 0, officer: 1, member: 2 }
    return roleOrder[a.role] - roleOrder[b.role]
  })

  const weeklyQuest = currentGuild.weeklyQuests || {}
  const questTarget = 100 // Default weekly target
  const questProgress = ((weeklyQuest.progress || 0) / questTarget) * 100

  // Fetch member profile when selected
  useEffect(() => {
    if (selectedMember && getMemberProfile) {
      setLoadingProfile(true)
      getMemberProfile(selectedMember.userId)
        .then(profile => {
          setMemberProfile(profile)
          setLoadingProfile(false)
        })
        .catch(err => {
          console.error('Failed to load profile:', err)
          setLoadingProfile(false)
        })
    } else {
      setMemberProfile(null)
      setLoadingProfile(false)
    }
  }, [selectedMember, getMemberProfile])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content guild-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="guild-header-info">
            <div className="guild-banner-large">{bannerInfo?.icon || '🛡️'}</div>
            <div>
              <h2>{currentGuild.name}</h2>
              <div className="guild-tier-badge" style={{ backgroundColor: tierInfo?.color }}>
                {tierInfo?.icon} {tierInfo?.name} Guild
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {currentGuild.description && (
          <p className="guild-description-text">{currentGuild.description}</p>
        )}

        <div className="guild-level-display">
          <div className="guild-level-info">
            <span className="guild-level-label">Guild Level {guildLevelInfo.level}</span>
            <span className="guild-xp-text">{currentGuild.xp || 0} XP</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill guild-xp-bar"
              style={{ width: `${guildLevelInfo.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="guild-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            👥 Members ({currentGuild.memberCount || 0}/{maxMembers})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
          <button 
            className={`tab-btn ${activeTab === 'quests' ? 'active' : ''}`}
            onClick={() => setActiveTab('quests')}
          >
            🎯 Quests
          </button>
        </div>

        <div className="guild-tab-content">
          {activeTab === 'overview' && (
            <div className="guild-overview">
              <div className="guild-stats-grid">
                <div className="guild-stat-card">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-info">
                    <div className="stat-label">XP Bonus</div>
                    <div className="stat-value">+{(tierInfo?.xpBonus * 100).toFixed(0)}%</div>
                  </div>
                </div>

                <div className="guild-stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <div className="stat-label">Treasury</div>
                    <div className="stat-value">{currentGuild.treasury || 0}</div>
                  </div>
                </div>

                <div className="guild-stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <div className="stat-label">Total Stats</div>
                    <div className="stat-value">{currentGuild.totalStats || 0}</div>
                  </div>
                </div>

                <div className="guild-stat-card">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-info">
                    <div className="stat-label">Quest Streak</div>
                    <div className="stat-value">{weeklyQuest.streak || 0} weeks</div>
                  </div>
                </div>
              </div>

              <div className="donate-section">
                <h3>💰 Donate to Treasury</h3>
                <p>Help your guild unlock new banners and perks!</p>
                <div className="donate-input-group">
                  <input
                    type="number"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    placeholder="Enter gold amount..."
                    min="1"
                    className="donate-input"
                  />
                  <button onClick={handleDonate} className="donate-btn">
                    Donate
                  </button>
                </div>
              </div>

              <button className="leave-guild-btn" onClick={handleLeaveGuild} disabled={leaving}>
                {leaving ? 'Leaving...' : '⚠️ Leave Guild'}
              </button>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="guild-members">
              {sortedMembers.map((member, index) => {
                const isCurrentUser = member.userId === currentUser?.uid
                return (
                  <div 
                    key={index} 
                    className={`member-card ${isCurrentUser ? 'current-user' : 'clickable'}`}
                    onClick={() => !isCurrentUser && setSelectedMember(member)}
                  >
                    <div className="member-avatar-circle">
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="member-info">
                      <div className="member-name">
                        {member.role === 'leader' && '👑 '}
                        {member.role === 'officer' && '⭐ '}
                        {member.username}
                        {isCurrentUser && <span className="you-badge">You</span>}
                      </div>
                      <div className="member-role">{member.role}</div>
                    </div>
                    <div className="member-contribution">
                      <span className="contribution-label">Contribution:</span>
                      <span className="contribution-value">{member.contribution || 0} quests</span>
                    </div>
                    {!isCurrentUser && <div className="view-profile-hint">👁️ View</div>}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'chat' && (
            <GuildChat />
          )}

          {activeTab === 'quests' && (
            <div className="guild-quests">
              <div className="weekly-quest-card">
                <h3>📅 Weekly Guild Quest</h3>
                <div className="quest-objective">
                  <p className="quest-title">🎯 Complete 100 Total Quests</p>
                  <p className="quest-description">Work together to complete quests and earn rewards!</p>
                </div>
                
                <div className="quest-progress-section">
                  <div className="quest-progress-label">
                    <span>Progress</span>
                    <span>{weeklyQuest.progress || 0}/{questTarget}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill quest-progress-bar"
                      style={{ width: `${Math.min(100, questProgress)}%` }}
                    ></div>
                  </div>
                </div>

                {weeklyQuest.completedThisWeek ? (
                  <div className="quest-completed">
                    ✅ Quest Completed! Resets Monday
                  </div>
                ) : (
                  <div className="quest-rewards">
                    <h4>🎁 Rewards:</h4>
                    <ul>
                      <li>💰 500 Gold for all members</li>
                      <li>⚡ 1000 Guild XP</li>
                      <li>🏆 Streak counter +1</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedMember && (
        <div className="modal-overlay" onClick={() => setSelectedMember(null)}>
          <div className="modal-content member-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 Member Profile</h2>
              <button className="close-btn" onClick={() => setSelectedMember(null)}>✕</button>
            </div>

            {loadingProfile ? (
              <div className="loading-state">Loading profile...</div>
            ) : memberProfile ? (
              <div className="member-profile-content">
                {/* Character Portrait */}
                <div className="profile-character-portrait">
                  <img 
                    src={getCharacterImage(memberProfile.characterClass, memberProfile.level)} 
                    alt={memberProfile.characterClass}
                    className="profile-character-image"
                  />
                </div>

                {/* Character Info */}
                <h3 className="profile-username">
                  {selectedMember?.role === 'leader' && '👑 '}
                  {selectedMember?.role === 'officer' && '⭐ '}
                  {selectedMember?.username || 'Unknown'}
                </h3>

                <div className="profile-role-badge" style={{
                  backgroundColor: selectedMember?.role === 'leader' ? '#ffd700' : 
                                   selectedMember?.role === 'officer' ? '#ff6b6b' : '#a0a0a0'
                }}>
                  {(selectedMember?.role || 'member').toUpperCase()}
                </div>

                <div className="profile-class-badge">
                  {memberProfile.characterClass ? `${memberProfile.characterClass.charAt(0).toUpperCase()}${memberProfile.characterClass.slice(1)}` : 'Warrior'}
                </div>

                {/* Hero Rank */}
                {memberProfile.stats && (
                  <div className="profile-hero-rank">
                    <div className="profile-rank-badge" style={{ 
                      backgroundColor: calculateHeroRank(memberProfile.stats).color 
                    }}>
                      <span className="rank-icon">{calculateHeroRank(memberProfile.stats).icon}</span>
                      <span>{calculateHeroRank(memberProfile.stats).rank}</span>
                    </div>
                  </div>
                )}

                {/* Main Stats Grid */}
                <div className="profile-stats-grid">
                  <div className="profile-stat-card">
                    <div className="stat-icon">💪</div>
                    <div className="stat-label">Strength</div>
                    <div className="stat-value-large">{memberProfile.stats?.strength || 10}</div>
                  </div>

                  <div className="profile-stat-card">
                    <div className="stat-icon">🧠</div>
                    <div className="stat-label">Intelligence</div>
                    <div className="stat-value-large">{memberProfile.stats?.intelligence || 10}</div>
                  </div>

                  <div className="profile-stat-card">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-label">Agility</div>
                    <div className="stat-value-large">{memberProfile.stats?.agility || 10}</div>
                  </div>

                  <div className="profile-stat-card">
                    <div className="stat-icon">✨</div>
                    <div className="stat-label">Charisma</div>
                    <div className="stat-value-large">{memberProfile.stats?.charisma || 10}</div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="profile-stats-grid">
                  <div className="profile-stat-card">
                    <div className="stat-icon">⚔️</div>
                    <div className="stat-label">Level</div>
                    <div className="stat-value-large">{memberProfile.level || 1}</div>
                  </div>

                  <div className="profile-stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-label">Total Quests</div>
                    <div className="stat-value-large">{memberProfile.totalQuestsCompleted || 0}</div>
                  </div>

                  <div className="profile-stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-label">Gold</div>
                    <div className="stat-value-large">{memberProfile.gold || 0}</div>
                  </div>

                  <div className="profile-stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-label">Total Stats</div>
                    <div className="stat-value-large">{memberProfile.totalStats || 0}</div>
                  </div>
                </div>

                {/* Guild Contribution */}
                <div className="profile-contribution-section">
                  <h4>🏰 Guild Contribution</h4>
                  <div className="contribution-display">
                    <div className="contribution-icon">🎯</div>
                    <div>
                      <div className="contribution-number">{selectedMember?.contribution || 0}</div>
                      <div className="contribution-text">Quests Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="error-state">Failed to load profile</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default GuildDashboard
