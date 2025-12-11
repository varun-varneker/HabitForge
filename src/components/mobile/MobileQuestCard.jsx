import { useState, useRef } from 'react'
import './MobileQuestCard.css'

function MobileQuestCard({ habit, onComplete, onSkip, onDelete, currentTime }) {
  const [showActions, setShowActions] = useState(false)
  const [confirmingSkip, setConfirmingSkip] = useState(false)
  const [longPressing, setLongPressing] = useState(false)
  const longPressTimer = useRef(null)
  const longPressTriggered = useRef(false)

  const getDifficultyColor = (difficulty) => {
    return {
      easy: '#26de81',
      medium: '#ffd93d',
      hard: '#ff6b6b'
    }[difficulty] || '#a8dadc'
  }

  const getCategoryIcon = (category) => {
    return {
      daily: '📅',
      weekly: '📆',
      monthly: '🗓️'
    }[category] || '⚔️'
  }

  const isMissed = () => {
    if (habit.completed) return false
    
    const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null
    const now = currentTime || new Date()
    
    if (habit.category === 'daily') {
      if (!lastCompleted) return true
      const daysSince = Math.floor((now - lastCompleted) / (1000 * 60 * 60 * 24))
      return daysSince > 0
    } else if (habit.category === 'weekly') {
      if (!lastCompleted) return true
      const weeksSince = Math.floor((now - lastCompleted) / (1000 * 60 * 60 * 24 * 7))
      return weeksSince > 0
    } else if (habit.category === 'monthly') {
      if (!lastCompleted) return true
      const monthsSince = Math.floor((now - lastCompleted) / (1000 * 60 * 60 * 24 * 30))
      return monthsSince > 0
    }
    return false
  }

  const handleTouchStart = (e) => {
    longPressTriggered.current = false
    setLongPressing(true)
    
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true
      setLongPressing(false)
      
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
      
      // Show delete confirmation
      if (window.confirm(`Delete quest "${habit.name}"?`)) {
        onDelete(habit.id)
      }
    }, 800) // 800ms long press
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    setLongPressing(false)
    
    // If long press was triggered, don't toggle actions
    if (longPressTriggered.current) {
      longPressTriggered.current = false
      return
    }
  }

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    setLongPressing(false)
    longPressTriggered.current = false
  }

  return (
    <div className={`mobile-quest-card ${habit.completed ? 'completed' : ''} ${longPressing ? 'long-pressing' : ''}`}>
      {/* Main Content - Tap to expand, Long press to delete */}
      <div 
        className="mobile-quest-main"
        onClick={() => !longPressTriggered.current && setShowActions(!showActions)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div className="mobile-quest-left">
          <div 
            className="mobile-difficulty-indicator"
            style={{ backgroundColor: getDifficultyColor(habit.difficulty) }}
          />
          <div className="mobile-quest-info">
            <h4 className="mobile-quest-name">{habit.name}</h4>
            <div className="mobile-quest-meta">
              <span className="mobile-category">
                {getCategoryIcon(habit.category)} {habit.category}
              </span>
              <span className="mobile-streak">🔥 {habit.streak || 0}</span>
              <span className="mobile-completions">✓ {habit.totalCompletions || 0}</span>
            </div>
            {(habit.xpReward || habit.goldReward) && (
              <div className="mobile-quest-rewards">
                {habit.xpReward && (
                  <span className="mobile-reward-xp">⭐ +{habit.xpReward}</span>
                )}
                {habit.goldReward && (
                  <span className="mobile-reward-gold">💰 +{habit.goldReward}</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="mobile-quest-right">
          {habit.completed ? (
            <div className="mobile-completed">✓</div>
          ) : (
            <button 
              className="mobile-complete-btn"
              onClick={(e) => {
                e.stopPropagation()
                onComplete(habit.id)
              }}
            >
              DO IT
            </button>
          )}
        </div>

        {isMissed() && !habit.completed && (
          <div className="mobile-missed-indicator">Missed</div>
        )}
      </div>

      {/* Expanded Actions */}
      {showActions && (
        <div className="mobile-quest-actions">
          {confirmingSkip ? (
            <div className="mobile-skip-confirm">
              <p>⚠️ Skip and lose 10 HP?</p>
              <div className="mobile-skip-btns">
                <button 
                  className="mobile-skip-yes"
                  onClick={() => {
                    onSkip(habit.id)
                    setConfirmingSkip(false)
                    setShowActions(false)
                  }}
                >
                  Yes, Skip
                </button>
                <button 
                  className="mobile-skip-no"
                  onClick={() => setConfirmingSkip(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {!habit.completed && (
                <button 
                  className="mobile-action mobile-skip"
                  onClick={() => setConfirmingSkip(true)}
                >
                  ⏭️ Skip (-10 HP)
                </button>
              )}
              <button 
                className="mobile-action mobile-delete"
                onClick={() => {
                  if (window.confirm(`Delete "${habit.name}"?`)) {
                    onDelete(habit.id)
                  }
                }}
              >
                🗑️ Delete Quest
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default MobileQuestCard
