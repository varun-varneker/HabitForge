import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import CharacterQuiz from './CharacterQuiz'
import { calculateCharacterClass } from '../data/characterQuiz'
import '../styles/Auth.css'

function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState([])

  const { signup, login, checkUsernameAvailable } = useAuth()

  async function handleUsernameBlur() {
    if (!username.trim()) {
      setUsernameError('')
      return
    }

    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters')
      return
    }

    if (username.length > 20) {
      setUsernameError('Username must be 20 characters or less')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores')
      return
    }

    setCheckingUsername(true)
    setUsernameError('')

    try {
      const isAvailable = await checkUsernameAvailable(username)
      if (!isAvailable) {
        setUsernameError('This username is already taken. Please choose another.')
      }
    } catch (error) {
      console.error('Error checking username:', error)
      setUsernameError('Unable to verify username. Please try again.')
    } finally {
      setCheckingUsername(false)
    }
  }

  function handleUsernameChange(e) {
    const value = e.target.value
    setUsername(value)
    setUsernameError('')
  }

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
        // Validate username before showing quiz
        if (!username.trim()) {
          setError('Please enter a username')
          setLoading(false)
          return
        }

        if (username.length < 3) {
          setError('Username must be at least 3 characters')
          setLoading(false)
          return
        }

        if (username.length > 20) {
          setError('Username must be 20 characters or less')
          setLoading(false)
          return
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          setError('Username can only contain letters, numbers, and underscores')
          setLoading(false)
          return
        }

        // Final check if username is available
        const isAvailable = await checkUsernameAvailable(username)
        if (!isAvailable) {
          setError(`Username "${username}" is already taken. Please choose a different username.`)
          setUsernameError('This username is already taken')
          setLoading(false)
          return
        }

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
      await signup(email, password, username, characterClass)
    } catch (err) {
      console.error(err)
      setShowQuiz(false)
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use')
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
    setUsername('')
    setUsernameError('')
    setShowQuiz(false)
  }

  // Show quiz modal if user is signing up
  if (showQuiz) {
    return (
      <CharacterQuiz 
        onComplete={handleQuizComplete}
        onCancel={handleQuizCancel}
        heroName={username}
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
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Choose a unique username"
                value={username}
                onChange={handleUsernameChange}
                onBlur={handleUsernameBlur}
                className={`auth-input ${usernameError ? 'input-error' : ''}`}
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                title="Username can only contain letters, numbers, and underscores"
              />
              {checkingUsername && (
                <span className="username-checking">Checking availability...</span>
              )}
              {usernameError && (
                <span className="username-error">⚠️ {usernameError}</span>
              )}
              {username && !usernameError && !checkingUsername && username.length >= 3 && (
                <span className="username-success">✓ Username is available</span>
              )}
              <p className="input-hint">3-20 characters, letters, numbers, and underscores only</p>
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
