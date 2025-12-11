import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import CharacterQuiz from './CharacterQuiz'
import { calculateCharacterClass } from '../data/characterQuiz'
import '../styles/Auth.css'

function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState([])

  const { signup, login } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()

    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    try {
      setError('')
      setLoading(true)
      
      if (isLogin) {
        console.log('Attempting login with email:', email)
        const result = await login(email, password)
        console.log('Login successful:', result)
      } else {
        // Show quiz before creating account
        setShowQuiz(true)
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email')
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password')
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password')
      } else {
        setError('Failed to ' + (isLogin ? 'login' : 'create account'))
      }
      setLoading(false)
    }
  }

  async function handleQuizComplete(answers) {
    setQuizAnswers(answers)
    const characterClass = calculateCharacterClass(answers)
    
    try {
      setLoading(true)
      await signup(email, password, displayName || 'Hero', characterClass)
    } catch (err) {
      console.error(err)
      setShowQuiz(false)
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use')
      } else if (err.message === 'USERNAME_TAKEN') {
        setError('Username already taken. Please choose a different name.')
      } else {
        setError('Failed to create account')
      }
      setLoading(false)
    }
  }

  function handleQuizCancel() {
    setShowQuiz(false)
    setLoading(false)
  }

  function toggleMode() {
    setIsLogin(!isLogin)
    setError('')
    setEmail('')
    setPassword('')
    setDisplayName('')
    setShowQuiz(false)
  }

  // Show quiz modal if user is signing up
  if (showQuiz) {
    return (
      <CharacterQuiz 
        onComplete={handleQuizComplete}
        onCancel={handleQuizCancel}
        heroName={displayName || 'Hero'}
      />
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>⚔️ HabitForge</h1>
          <h2>{isLogin ? 'Welcome Back, Hero!' : 'Begin Your Quest'}</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="displayName">Hero Name</label>
              <input
                id="displayName"
                type="text"
                placeholder="Enter your hero name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="auth-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              className="auth-input"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="auth-button"
          >
            {loading ? '...' : (isLogin ? '🗡️ Login' : '✨ Create Account')}
          </button>
        </form>

        <div className="auth-toggle">
          <button onClick={toggleMode} className="toggle-button">
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Auth
