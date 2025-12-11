import { characterClasses } from '../data/characterQuiz'

function CharacterStats({ character, onClose }) {
  const classData = characterClasses[character.class] || characterClasses.warrior

  const totalStats = character.stats.strength + character.stats.intelligence + character.stats.agility + (character.stats.charisma || 0)
  const totalQuestsCompleted = Math.floor((totalStats - 40) / 2.5) // Estimate based on stat gains

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="stats-header">
          <h2>{character.name}</h2>
          <div className="stats-class" style={{ color: classData.color }}>
            {classData.icon} {classData.name}
          </div>
          <div className="stats-level">Level {character.level}</div>
        </div>

        <div className="stats-grid">
          <div className="stat-card strength">
            <div className="stat-icon">💪</div>
            <div className="stat-info">
              <h3>Strength</h3>
              <div className="stat-value">{character.stats.strength}</div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill strength-bar"
                  style={{ width: `${Math.min((character.stats.strength / 100) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="stat-card intelligence">
            <div className="stat-icon">🧠</div>
            <div className="stat-info">
              <h3>Intelligence</h3>
              <div className="stat-value">{character.stats.intelligence}</div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill intelligence-bar"
                  style={{ width: `${Math.min((character.stats.intelligence / 100) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="stat-card agility">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <h3>Agility</h3>
              <div className="stat-value">{character.stats.agility}</div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill agility-bar"
                  style={{ width: `${Math.min((character.stats.agility / 100) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="stat-card charisma">
            <div className="stat-icon">✨</div>
            <div className="stat-info">
              <h3>Charisma</h3>
              <div className="stat-value">{character.stats.charisma || 10}</div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill charisma-bar"
                  style={{ width: `${Math.min(((character.stats.charisma || 10) / 100) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-summary">
          <div className="summary-item">
            <span className="summary-label">Total Stats</span>
            <span className="summary-value">{totalStats}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Quests Completed</span>
            <span className="summary-value">{totalQuestsCompleted}+</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Current Health</span>
            <span className="summary-value">{character.health}/{character.maxHealth}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Gold</span>
            <span className="summary-value">💰 {character.gold}</span>
          </div>
        </div>

        <div className="stats-info">
          <p>
            <strong>How Stats Work:</strong> Completing quests increases your class's primary stat and Charisma. 
            {character.class === 'warrior' && ' Warriors gain Strength from completing habits.'}
            {character.class === 'wizard' && ' Wizards gain Intelligence from completing habits.'}
            {character.class === 'rogue' && ' Rogues gain Agility from completing habits.'}
            {' All classes gain Charisma (half rate).'}
          </p>
          <p className="stats-hint">
            Easy: +1 primary stat, +1 Charisma | Medium: +2 primary, +1 Charisma | Hard: +3 primary, +2 Charisma
          </p>
        </div>
      </div>
    </div>
  )
}

export default CharacterStats
