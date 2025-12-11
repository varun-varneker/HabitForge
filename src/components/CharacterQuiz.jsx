import { useState } from 'react'
import { characterQuiz, characterClasses, calculateCharacterClass } from '../data/characterQuiz'
import '../styles/Auth.css'

function CharacterQuiz({ onComplete, onCancel, heroName }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [characterClass, setCharacterClass] = useState(null)

  const progress = ((currentQuestion + 1) / characterQuiz.length) * 100

  function handleAnswer(option) {
    const newAnswers = [...answers, option]
    setAnswers(newAnswers)

    if (currentQuestion < characterQuiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Quiz complete - show result
      const classType = calculateCharacterClass(newAnswers)
      setCharacterClass(classType)
      setShowResult(true)
    }
  }

  function handleConfirm() {
    onComplete(answers)
  }

  function handleBack() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setAnswers(answers.slice(0, -1))
    }
  }

  if (showResult && characterClass) {
    const classData = characterClasses[characterClass]
    return (
      <div className="auth-container">
        <div className="quiz-box result-box">
          <div className="result-header">
            <h1>🎉 Character Created!</h1>
            <div className="class-icon">{classData.icon}</div>
            <h2 style={{ color: classData.color }}>{classData.name}</h2>
          </div>

          <div className="class-description">
            <p>{classData.description}</p>
          </div>

          <div className="class-bonuses">
            <h3>Starting Bonuses:</h3>
            <div className="bonus-list">
              {classData.statBonus.health > 0 && (
                <div className="bonus-item">
                  <span>❤️ +{classData.statBonus.health} Max Health</span>
                </div>
              )}
              {classData.statBonus.xp > 0 && (
                <div className="bonus-item">
                  <span>⭐ +{classData.statBonus.xp} Starting XP</span>
                </div>
              )}
              {classData.statBonus.gold > 0 && (
                <div className="bonus-item">
                  <span>💰 +{classData.statBonus.gold} Starting Gold</span>
                </div>
              )}
            </div>
          </div>

          <div className="result-actions">
            <button onClick={handleConfirm} className="auth-button">
              ✨ Begin Quest as {heroName} the {classData.name}
            </button>
            <button onClick={onCancel} className="cancel-button">
              ← Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    )
  }

  const question = characterQuiz[currentQuestion]

  return (
    <div className="auth-container">
      <div className="quiz-box">
        <div className="quiz-header">
          <h1>⚔️ Character Creation</h1>
          <p className="quiz-subtitle">Answer these questions to discover your class</p>
        </div>

        <div className="progress-container">
          <div className="progress-bar-quiz">
            <div 
              className="progress-fill-quiz"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">
            Question {currentQuestion + 1} of {characterQuiz.length}
          </span>
        </div>

        <div className="question-container">
          <h2 className="question-text">{question.question}</h2>
          
          <div className="options-container">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="option-button"
              >
                <span className="option-number">{index + 1}</span>
                <span className="option-text">{option.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-navigation">
          {currentQuestion > 0 && (
            <button onClick={handleBack} className="back-button">
              ← Previous Question
            </button>
          )}
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default CharacterQuiz
