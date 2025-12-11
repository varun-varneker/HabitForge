import { useState } from 'react'
import { characterClasses } from '../data/characterQuiz'
import CharacterStats from './CharacterStats'
import ProgressVisualization from './ProgressVisualization'
import { getStreakColor, getStreakMultiplier, getNextMilestone, STREAK_FREEZE_COST } from '../data/streakSystem'
import { getWoundedState, checkRecoveryMode, formatTimeRemaining } from '../data/penaltySystem'

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

function Character({ character, streakData, onFreezeStreak, onRecoverStreak }) {
  const [showStats, setShowStats] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const healthPercent = (character.health / character.maxHealth) * 100
  const xpPercent = (character.xp / character.xpToNextLevel) * 100
  const classData = characterClasses[character.class] || characterClasses.warrior

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
  const getCharacterImage = () => {
    const classKey = character.class || 'warrior'
    
    // Ascendant uses the same image for all levels
    if (classKey === 'ascendant') {
      return ascendant
    }
    
    const level = Math.min(Math.max(character.level, 1), 7) // Clamp level between 1-7
    return characterImages[classKey]?.[level] || characterImages.warrior[1]
  }

  const characterImage = getCharacterImage()

  // Get level name based on 7-level hero system
  const heroLevelNames = ['Novice', 'Apprentice', 'Adventurer', 'Champion', 'Hero', 'Legend', 'Mythic Hero']
  const levelName = heroLevelNames[character.level - 1] || 'Novice'

  // Streak display logic
  const streakMultiplier = getStreakMultiplier(streakData?.currentStreak || 0)
  const nextMilestone = getNextMilestone(streakData?.currentStreak || 0)
  const streakColor = getStreakColor(streakData?.currentStreak || 0)
  const canAffordFreeze = character.gold >= STREAK_FREEZE_COST
  
  // Check wounded state and recovery mode
  const woundedState = getWoundedState(character)
  const recoveryStatus = checkRecoveryMode(character)

  return (
    <>
      <div className="character-panel">
        <div className="character-header">
          <h2>{character.name}</h2>
          <div className="level-badge" title={levelName}>
            Level {character.level} - {levelName}
          </div>
        </div>

        {/* Recovery Mode Banner */}
        {recoveryStatus.inRecovery && (
          <div className="recovery-banner">
            <div className="recovery-icon">🩹</div>
            <div className="recovery-info">
              <div className="recovery-title">RECOVERY MODE</div>
              <div className="recovery-details">
                50% Reduced Rewards | {formatTimeRemaining(recoveryStatus.timeRemaining)} remaining
              </div>
            </div>
          </div>
        )}

        <div className="character-portrait" onClick={() => setShowStats(true)}>
          <img 
            src={characterImage} 
            alt={classData.name} 
            className={`character-image ${woundedState.wounded ? 'wounded-' + woundedState.severity : ''}`}
          />
          {/* Wounded State Overlay */}
          {woundedState.wounded && (
            <div className={`wounded-overlay ${woundedState.severity}`}>
              <div className="wounded-badge">{woundedState.message}</div>
            </div>
          )}
          <div className="image-hint">Click to view stats</div>
        </div>

        <div className="class-badge" style={{ backgroundColor: classData.color }}>
          <span>{classData.icon} {classData.name}</span>
        </div>

        <div className="stats">
          <div className="stat-row">
            <div className="stat-label">
              <span>❤️ Health</span>
              <span className="stat-value">{character.health}/{character.maxHealth}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill health-bar"
                style={{ width: `${healthPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="stat-row">
            <div className="stat-label">
              <span>⭐ XP</span>
              <span className="stat-value">{character.xp}/{character.xpToNextLevel}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill xp-bar"
                style={{ width: `${xpPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="gold-display">
            <span>💰 Gold: {character.gold}</span>
          </div>
        </div>

        {/* Streak Display */}
        {streakData && (
          <div className="streak-panel" style={{ borderColor: streakColor }}>
            <div className="streak-header">
              <span className="streak-icon">🔥</span>
              <div className="streak-info">
                <div className="streak-current" style={{ color: streakColor }}>
                  {streakData.currentStreak} Day Streak
                </div>
                <div className="streak-multiplier">
                  +{((streakMultiplier - 1) * 100).toFixed(0)}% Bonus Rewards
                </div>
              </div>
            </div>

            {nextMilestone && (
              <div className="streak-milestone-progress">
                <div className="milestone-label">
                  Next Milestone: {nextMilestone.days} days
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill streak-bar"
                    style={{ 
                      width: `${(streakData.currentStreak / nextMilestone.days) * 100}%`,
                      backgroundColor: streakColor
                    }}
                  ></div>
                </div>
                <div className="milestone-reward">
                  Reward: {nextMilestone.goldReward}💰 + {nextMilestone.xpReward}⭐
                </div>
              </div>
            )}

            <div className="streak-stats">
              <div className="streak-stat">
                <span>🏆 Best: {streakData.longestStreak} days</span>
              </div>
              <div className="streak-stat">
                <span>📅 Total: {streakData.totalLoginDays} days</span>
              </div>
            </div>

            {streakData.freezeActive && (
              <div className="freeze-active">
                ❄️ Streak Protected (24 hrs)
              </div>
            )}

            {!streakData.freezeActive && streakData.currentStreak > 0 && (
              <button 
                className="freeze-button"
                onClick={onFreezeStreak}
                disabled={!canAffordFreeze}
                title={canAffordFreeze ? 'Protect your streak for 24 hours' : `Need ${STREAK_FREEZE_COST} gold`}
              >
                ❄️ Freeze Streak ({STREAK_FREEZE_COST}💰)
              </button>
            )}
          </div>
        )}

        <button className="view-progress-button" onClick={() => setShowProgress(true)}>
          📊 View Progress
        </button>
      </div>

      {showStats && (
        <CharacterStats 
          character={character} 
          onClose={() => setShowStats(false)} 
        />
      )}

      {showProgress && (
        <ProgressVisualization 
          character={character} 
          onClose={() => setShowProgress(false)} 
        />
      )}
    </>
  )
}

export default Character
