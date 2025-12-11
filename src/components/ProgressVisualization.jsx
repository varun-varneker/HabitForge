import { useState, useEffect } from 'react'
import { achievements } from '../data/achievements'
import { getTimeline } from '../utils/timelineTracker'
import { useAuth } from '../contexts/AuthContext'

function ProgressVisualization({ character, onClose }) {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('stats')
  const [statHistory, setStatHistory] = useState([])
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    // Load stat history from localStorage
    const userId = currentUser?.uid
    if (!userId) return

    const saved = localStorage.getItem(`statHistory_${userId}`)
    if (saved) {
      setStatHistory(JSON.parse(saved))
    }

    // Load timeline events
    const timelineData = getTimeline(userId)
    setTimeline(timelineData)
  }, [currentUser])

  // Calculate stat chart data
  const getStatChartData = () => {
    if (statHistory.length === 0) {
      return {
        strength: [character.stats.strength],
        intelligence: [character.stats.intelligence],
        agility: [character.stats.agility],
        charisma: [character.stats.charisma]
      }
    }

    return {
      strength: statHistory.map(h => h.strength),
      intelligence: statHistory.map(h => h.intelligence),
      agility: statHistory.map(h => h.agility),
      charisma: statHistory.map(h => h.charisma)
    }
  }

  const chartData = getStatChartData()
  const maxStat = Math.max(
    ...Object.values(chartData).flat(),
    50 // Minimum scale
  )

  const renderStatChart = (statName, data, color) => {
    const points = data.map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100
      const y = 100 - (value / maxStat) * 100
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="stat-chart" key={statName}>
        <div className="stat-chart-header">
          <span className="stat-chart-name">{statName}</span>
          <span className="stat-chart-value">{data[data.length - 1]}</span>
        </div>
        <svg className="stat-chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          {data.map((value, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * 100
            const y = 100 - (value / maxStat) * 100
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={color}
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>
      </div>
    )
  }

  const getEventTypeColor = (type) => {
    const colors = {
      start: '#26de81',
      level_up: '#ffd93d',
      achievement: '#fc5c65',
      stat_milestone: '#6c5ce7',
      milestone: '#fd79a8',
      quest_created: '#74b9ff',
      current: '#45aaf2'
    }
    return colors[type] || '#95a5a6'
  }

  const renderTimeline = () => {
    const events = [
      ...timeline,
      { 
        id: 'current',
        type: 'current', 
        level: character.level, 
        description: 'Current position', 
        date: 'Now', 
        icon: '⭐',
        current: true 
      }
    ]

    // Sort by timestamp (newest first for display)
    const sortedEvents = [...events].sort((a, b) => {
      if (a.id === 'current') return -1
      if (b.id === 'current') return 1
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
    })

    return (
      <div className="timeline-container">
        <div className="timeline-line"></div>
        <div className="timeline-events">
          {sortedEvents.map((event, index) => (
            <div 
              key={event.id || index} 
              className={`timeline-event ${event.current ? 'current' : ''}`}
              style={{ '--event-color': getEventTypeColor(event.type) }}
            >
              <div className="timeline-marker">
                <div className="timeline-icon">{event.icon}</div>
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <div className="timeline-level">Level {event.level}</div>
                  <div className="timeline-date">{event.date}</div>
                </div>
                <div className="timeline-description">{event.description}</div>
                {event.details && (
                  <div className="timeline-details">{event.details}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        {timeline.length === 0 && (
          <div className="timeline-empty">
            <p>🌟 Your hero's journey is just beginning!</p>
            <p>Complete quests, level up, and unlock achievements to build your timeline.</p>
          </div>
        )}
      </div>
    )
  }

  const renderMilestones = () => {
    // Filter achievements for milestones category (includes hero ranks)
    const milestoneAchievements = achievements.filter(a => a.category === 'milestones' || a.category === 'stats')
    
    return (
      <div className="milestones-grid">
        {milestoneAchievements.map((achievement) => {
          const isAchieved = achievement.checkUnlocked(character, [])
          
          return (
            <div key={achievement.id} className={`milestone-card ${isAchieved ? 'achieved' : 'locked'}`}>
              <div className="milestone-icon">{achievement.icon}</div>
              <div className="milestone-name">{achievement.name}</div>
              <div className="milestone-description">{achievement.description}</div>
              {isAchieved && <div className="milestone-check">✓</div>}
              {isAchieved && achievement.reward && (
                <div className="milestone-reward">
                  {achievement.reward.gold > 0 && <span>💰 {achievement.reward.gold}</span>}
                  {achievement.reward.xp > 0 && <span>✨ {achievement.reward.xp} XP</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content progress-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Your Hero's Journey</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="progress-tabs">
          <button 
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📈 Stat Growth
          </button>
          <button 
            className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            🗓️ Timeline
          </button>
          <button 
            className={`tab-button ${activeTab === 'milestones' ? 'active' : ''}`}
            onClick={() => setActiveTab('milestones')}
          >
            🏆 Milestones
          </button>
        </div>

        <div className="progress-content">
          {activeTab === 'stats' && (
            <div className="stats-charts">
              <p className="chart-hint">Track your stat growth over time</p>
              {renderStatChart('💪 Strength', chartData.strength, '#ff6b6b')}
              {renderStatChart('🧠 Intelligence', chartData.intelligence, '#6c5ce7')}
              {renderStatChart('⚡ Agility', chartData.agility, '#26de81')}
              {renderStatChart('✨ Charisma', chartData.charisma, '#fc5c65')}
            </div>
          )}

          {activeTab === 'timeline' && renderTimeline()}
          {activeTab === 'milestones' && renderMilestones()}
        </div>
      </div>
    </div>
  )
}

export default ProgressVisualization
