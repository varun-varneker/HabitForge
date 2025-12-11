import { useState } from 'react'
import { calculateMasteryLevel } from '../data/masteryLevels'
import { PENALTY_CONFIG } from '../data/penaltySystem'

function HabitList({ habits, onComplete, onDelete, onSkip }) {
  const [confirmingSkip, setConfirmingSkip] = useState(null)
  const categoryIcons = {
    strength: '💪',
    intelligence: '🧠',
    agility: '⚡',
    charisma: '✨'
  }

  const categoryNames = {
    strength: 'Strength',
    intelligence: 'Intelligence',
    agility: 'Agility',
    charisma: 'Charisma'
  }

  const recurringIcons = {
    permanent: '♾️',
    daily: '📅',
    weekly: '📆',
    monthly: '🗓️'
  }

  const recurringLabels = {
    permanent: 'Permanent',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly'
  }

  const handleSkipClick = (habitId) => {
    setConfirmingSkip(habitId)
  }

  const confirmSkip = (habitId) => {
    onSkip(habitId)
    setConfirmingSkip(null)
  }

  const cancelSkip = () => {
    setConfirmingSkip(null)
  }

  if (habits.length === 0) {
    return (
      <div className="empty-state">
        <p>📜 No quests yet! Add your first habit to begin your journey.</p>
      </div>
    )
  }

  return (
    <div className="habit-list">
      {habits.map(habit => {
        const masteryData = calculateMasteryLevel(habit.totalCompletions || 0)
        const isCompleted = habit.completed
        
        return (
          <div key={habit.id} className={`habit-card ${habit.difficulty} ${isCompleted ? 'completed' : ''}`}>
            <div className="habit-info">
              <h3>{habit.name}</h3>
              <div className="habit-meta">
                {habit.category && (
                  <span className={`category-badge ${habit.category}`}>
                    {categoryIcons[habit.category]} {categoryNames[habit.category]}
                  </span>
                )}
                {habit.recurring && (
                  <span className="recurring-badge">
                    {recurringIcons[habit.recurring]} {recurringLabels[habit.recurring]}
                  </span>
                )}
                <span className="difficulty-badge">{habit.difficulty}</span>
                <span className="mastery-badge" style={{ backgroundColor: masteryData.color }}>
                  {masteryData.icon} {masteryData.level}
                </span>
                <span className="streak">🔥 {habit.streak} streak</span>
              </div>
              <div className="habit-stats">
                <span className="completions">Total: {habit.totalCompletions || 0}</span>
                {masteryData.multiplier > 1 && (
                  <span className="mastery-bonus">+{Math.round((masteryData.multiplier - 1) * 100)}% bonus rewards</span>
                )}
              </div>
            </div>
            
            <div className="habit-actions">
              <button 
                className="btn-complete"
                onClick={() => onComplete(habit.id)}
                disabled={isCompleted}
                title={isCompleted ? "Quest already completed - resets automatically" : "Complete habit"}
              >
                {isCompleted ? '✓ Completed' : '✓ Complete'}
              </button>
              
              {confirmingSkip === habit.id ? (
                <div className="skip-confirmation">
                  <div className="skip-warning">
                    <span className="warning-icon">⚠️</span>
                    <div className="warning-text">
                      <strong>Are you sure?</strong>
                      <span className="warning-details">
                        This will cause -{PENALTY_CONFIG.SKIP_QUEST} HP drain
                      </span>
                    </div>
                  </div>
                  <div className="skip-confirmation-actions">
                    <button 
                      className="btn-confirm-skip"
                      onClick={() => confirmSkip(habit.id)}
                    >
                      Yes, Skip
                    </button>
                    <button 
                      className="btn-cancel-skip"
                      onClick={cancelSkip}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="btn-skip"
                  onClick={() => handleSkipClick(habit.id)}
                  disabled={isCompleted}
                  title="Skip (loses health & resets streak)"
                >
                  ⏭️
                </button>
              )}
              
              <button 
                className="btn-delete"
                onClick={() => onDelete(habit.id)}
                title="Delete habit"
              >
                🗑️
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default HabitList
