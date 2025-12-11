import './MobileCharacter.css'

// Import all character level images
import warrior1 from '../../assets/Character levels/Warrior/Warrior_level1.png'
import warrior2 from '../../assets/Character levels/Warrior/Warrior_level2.png'
import warrior3 from '../../assets/Character levels/Warrior/Warrior_level3.png'
import warrior4 from '../../assets/Character levels/Warrior/Warrior_level4.png'
import warrior5 from '../../assets/Character levels/Warrior/Warrior_level5.png'
import warrior6 from '../../assets/Character levels/Warrior/Warrior_level6.png'
import warrior7 from '../../assets/Character levels/Warrior/Warrior_level7.png'

import mage1 from '../../assets/Character levels/Mage/Mage_level1.png'
import mage2 from '../../assets/Character levels/Mage/Mage_level2.png'
import mage3 from '../../assets/Character levels/Mage/Mage_level3.png'
import mage4 from '../../assets/Character levels/Mage/Mage_level4.png'
import mage5 from '../../assets/Character levels/Mage/Mage_level5.png'
import mage6 from '../../assets/Character levels/Mage/Mage_level6.png'
import mage7 from '../../assets/Character levels/Mage/Mage_level7.png'

import rogue1 from '../../assets/Character levels/Rogue/Rogue_level1.png'
import rogue2 from '../../assets/Character levels/Rogue/Rogue_level2.png'
import rogue3 from '../../assets/Character levels/Rogue/Rogue_level3.png'
import rogue4 from '../../assets/Character levels/Rogue/Rogue_level4.png'
import rogue5 from '../../assets/Character levels/Rogue/Rogue_level5.png'
import rogue6 from '../../assets/Character levels/Rogue/Rogue_level6.png'
import rogue7 from '../../assets/Character levels/Rogue/Rogue_level7.png'

import ascendant from '../../assets/Character levels/Ascendant.png'

function MobileCharacter({ 
  character, 
  streakData, 
  onViewStats, 
  onViewProgress,
  heroRank,
  isRecoveryMode,
  recoveryTimeRemaining 
}) {
  const healthPercent = (character.health / character.maxHealth) * 100
  const xpPercent = (character.xp / character.xpToNextLevel) * 100

  const getHealthColor = () => {
    if (healthPercent > 50) return '#26de81'
    if (healthPercent > 25) return '#ffd93d'
    return '#ff6b6b'
  }

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

  const getCharacterImage = () => {
    const classKey = character.class || 'warrior'
    
    // Ascendant uses the same image for all levels
    if (classKey === 'ascendant') {
      return ascendant
    }
    
    const level = Math.min(Math.max(character.level, 1), 7) // Clamp level between 1-7
    return characterImages[classKey]?.[level] || characterImages.warrior[1]
  }

  const formatRecoveryTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const getClassIcon = (className) => {
    const icons = {
      warrior: '⚔️',
      mage: '🔮',
      wizard: '🧙',
      rogue: '🗡️',
      ascendant: '👑'
    }
    return icons[className?.toLowerCase()] || '⚔️'
  }

  // Calculate streak progress to next milestone
  const getStreakProgress = () => {
    const milestones = [7, 14, 21, 30]
    const currentStreak = streakData?.currentStreak || 0
    
    let nextMilestone = milestones.find(m => m > currentStreak) || 30
    let prevMilestone = milestones.reverse().find(m => m <= currentStreak) || 0
    
    if (currentStreak >= 30) {
      nextMilestone = 30
      prevMilestone = 0
    }
    
    const progress = prevMilestone === nextMilestone 
      ? 100 
      : ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100
    
    return {
      progress: Math.min(progress, 100),
      current: currentStreak,
      next: nextMilestone
    }
  }

  const streakProgress = getStreakProgress()

  return (
    <>
      {/* Streak Hero Bar */}
      <div className="mobile-streak-hero-bar">
        <div className="mobile-streak-content">
          <div className="mobile-streak-header">
            <span className="mobile-fire-icon">🔥</span>
            <span className="mobile-streak-text">
              {streakData?.currentStreak || 0} Day Streak
            </span>
            <span className="mobile-streak-bonus-tag">
              +{(Math.min(streakData?.currentStreak || 0, 30) * 2).toFixed(0)}%
            </span>
          </div>
          
          {/* Streak Progress Bar */}
          <div className="mobile-streak-progress-container">
            <div className="mobile-streak-progress-bar">
              <div 
                className="mobile-streak-progress-fill" 
                style={{ width: `${streakProgress.progress}%` }}
              />
            </div>
            <span className="mobile-streak-milestone-text">
              Next Milestone: {streakProgress.next} days
            </span>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="mobile-profile-card">
        {/* Level Badge - Top Right Corner */}
        <div className="mobile-level-badge">Lvl {character.level}</div>
        
        <div className="mobile-profile-top">
          {/* Profile Image */}
          <div className="mobile-profile-image-container">
            <img 
              src={getCharacterImage()} 
              alt={character.name} 
              className="mobile-profile-image"
            />
          </div>

          {/* Profile Info */}
          <div className="mobile-profile-info">
            {/* Username + Class Icon */}
            <div className="mobile-username-row">
              <span className="mobile-username">{character.name}</span>
              <span className="mobile-class-icon">{getClassIcon(character.class)}</span>
            </div>

            {/* Class Name */}
            <div className="mobile-class-name">
              {heroRank?.icon} {heroRank?.name || character.class}
            </div>

            {/* Health Bar */}
            <div className="mobile-stat-bar-container">
              <div className="mobile-stat-bar">
                <span className="mobile-stat-label" style={{ color: getHealthColor() }}>
                  ❤️ {character.health}/{character.maxHealth}
                </span>
                <div className="mobile-progress-bar">
                  <div 
                    className="mobile-progress-fill health" 
                    style={{ width: `${healthPercent}%` }} 
                  />
                </div>
              </div>

              {/* XP Bar */}
              <div className="mobile-stat-bar">
                <span className="mobile-stat-label">
                  ⭐ {character.xp}/{character.xpToNextLevel}
                </span>
                <div className="mobile-progress-bar">
                  <div 
                    className="mobile-progress-fill xp" 
                    style={{ width: `${xpPercent}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gold Display */}
        <div className="mobile-gold-display">
          <span className="mobile-gold-icon">💰</span>
          <span className="mobile-gold-amount">{character.gold.toLocaleString()}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mobile-action-buttons">
        <button className="mobile-action-btn" onClick={onViewStats}>
          📊 Stats
        </button>
        <button className="mobile-action-btn" onClick={onViewProgress}>
          📈 Progress
        </button>
      </div>

      {/* Recovery Mode Banner */}
      {isRecoveryMode && (
        <div className="mobile-recovery-banner">
          <div className="mobile-recovery-title">⚠️ RECOVERY MODE</div>
          <div className="mobile-recovery-details">
            50% Reduced Rewards • {formatRecoveryTime(recoveryTimeRemaining)} Remaining
          </div>
        </div>
      )}
    </>
  )
}

export default MobileCharacter
