import { useState } from 'react'

function AddHabitForm({ onAddHabit }) {
  const [habitName, setHabitName] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [category, setCategory] = useState('strength')
  const [recurring, setRecurring] = useState('daily')
  const [showCategoryPopup, setShowCategoryPopup] = useState(false)
  const [showRecurringPopup, setShowRecurringPopup] = useState(false)
  const [showDifficultyPopup, setShowDifficultyPopup] = useState(false)

  const categories = [
    { value: 'strength', icon: '💪', label: 'Strength', subtitle: 'Physical' },
    { value: 'intelligence', icon: '🧠', label: 'Intelligence', subtitle: 'Mental' },
    { value: 'agility', icon: '⚡', label: 'Agility', subtitle: 'Skill' },
    { value: 'charisma', icon: '✨', label: 'Charisma', subtitle: 'Social' }
  ]

  const recurringTypes = [
    { value: 'daily', icon: '📅', label: 'Daily', subtitle: '24 hours' },
    { value: 'weekly', icon: '📆', label: 'Weekly', subtitle: '7 days' },
    { value: 'monthly', icon: '🗓️', label: 'Monthly', subtitle: '30 days' }
  ]

  const difficulties = [
    { value: 'easy', icon: '⭐', label: 'Easy', subtitle: '10 XP, 5 Gold' },
    { value: 'medium', icon: '⭐⭐', label: 'Medium', subtitle: '25 XP, 10 Gold' },
    { value: 'hard', icon: '⭐⭐⭐', label: 'Hard', subtitle: '50 XP, 20 Gold' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (habitName.trim()) {
      onAddHabit(habitName.trim(), difficulty, category, recurring)
      setHabitName('')
      setDifficulty('medium')
      setCategory('strength')
      setRecurring('daily')
    }
  }

  const handleCategorySelect = (value) => {
    setCategory(value)
    setShowCategoryPopup(false)
  }

  const handleRecurringSelect = (value) => {
    setRecurring(value)
    setShowRecurringPopup(false)
  }

  const handleDifficultySelect = (value) => {
    setDifficulty(value)
    setShowDifficultyPopup(false)
  }

  const getSelectedCategory = () => categories.find(c => c.value === category)
  const getSelectedRecurring = () => recurringTypes.find(r => r.value === recurring)
  const getSelectedDifficulty = () => difficulties.find(d => d.value === difficulty)

  return (
    <form className="add-habit-form" onSubmit={handleSubmit}>
      <div className="habit-form-row">
        <div className="habit-input-container">
          <textarea
            placeholder="Enter your quest... (e.g., 'Exercise for 30 minutes', 'Read 20 pages', 'Call a friend')"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            className="habit-input-large"
            rows="1"
          />
        </div>

        <div className="habit-options-icons">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowCategoryPopup(true)}
            title={`Category: ${getSelectedCategory()?.label}`}
          >
            {getSelectedCategory()?.icon}
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowRecurringPopup(true)}
            title={`Timeline: ${getSelectedRecurring()?.label}`}
          >
            🕒
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowDifficultyPopup(true)}
            title={`Difficulty: ${getSelectedDifficulty()?.label}`}
          >
            🔥
          </button>
        </div>
      </div>

      <button type="submit" className="btn-add">
        ➕ Add Quest
      </button>

      {/* Category Popup */}
      {showCategoryPopup && (
        <div className="popup-overlay" onClick={() => setShowCategoryPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Category</h3>
            <div className="popup-grid">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  className={`popup-option ${category === cat.value ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(cat.value)}
                >
                  <span className="popup-icon">{cat.icon}</span>
                  <span className="popup-label">{cat.label}</span>
                  <span className="popup-subtitle">{cat.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recurring Popup */}
      {showRecurringPopup && (
        <div className="popup-overlay" onClick={() => setShowRecurringPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Timeline</h3>
            <div className="popup-grid">
              {recurringTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  className={`popup-option ${recurring === type.value ? 'selected' : ''}`}
                  onClick={() => handleRecurringSelect(type.value)}
                >
                  <span className="popup-icon">{type.icon}</span>
                  <span className="popup-label">{type.label}</span>
                  <span className="popup-subtitle">{type.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Difficulty Popup */}
      {showDifficultyPopup && (
        <div className="popup-overlay" onClick={() => setShowDifficultyPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Difficulty</h3>
            <div className="popup-grid">
              {difficulties.map(diff => (
                <button
                  key={diff.value}
                  type="button"
                  className={`popup-option ${difficulty === diff.value ? 'selected' : ''}`}
                  onClick={() => handleDifficultySelect(diff.value)}
                >
                  <span className="popup-icon">{diff.icon}</span>
                  <span className="popup-label">{diff.label}</span>
                  <span className="popup-subtitle">{diff.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </form>
  )
}

export default AddHabitForm
