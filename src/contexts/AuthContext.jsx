import { createContext, useContext, useState, useEffect } from 'react'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Username generator function
  function generateUsername() {
    const adjectives = [
      'Brave', 'Swift', 'Mighty', 'Noble', 'Fierce', 'Bold', 'Wise', 'Silent',
      'Shadow', 'Storm', 'Iron', 'Silver', 'Golden', 'Dragon', 'Phoenix', 'Crimson',
      'Ancient', 'Mystic', 'Rogue', 'Valiant', 'Epic', 'Legendary', 'Sacred', 'Dark'
    ]
    const nouns = [
      'Warrior', 'Knight', 'Slayer', 'Hunter', 'Blade', 'Fist', 'Shield', 'Arrow',
      'Wolf', 'Tiger', 'Eagle', 'Bear', 'Falcon', 'Serpent', 'Ranger', 'Mage',
      'Sage', 'Champion', 'Hero', 'Guardian', 'Paladin', 'Wanderer', 'Seeker'
    ]
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const number = Math.floor(Math.random() * 9999) + 1
    
    return `${adjective}${noun}${number}`
  }

  async function generateUniqueUsername() {
    let username = generateUsername()
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      const isAvailable = await checkUsernameAvailable(username)
      if (isAvailable) {
        return username
      }
      username = generateUsername()
      attempts++
    }
    
    // Fallback: add timestamp if all attempts fail
    return `Hero${Date.now()}`
  }

  async function checkUsernameAvailable(username) {
    try {
      console.log('=== USERNAME CHECK START ===')
      console.log('Input username:', username)
      
      const usersRef = collection(db, 'users')
      
      // Get ALL users and check in JavaScript (works even without indexes)
      console.log('Fetching all users...')
      const allUsersSnapshot = await getDocs(usersRef)
      console.log('Total users in database:', allUsersSnapshot.size)
      
      const lowercaseUsername = username.toLowerCase()
      let found = false
      let matchedUsername = null
      
      allUsersSnapshot.forEach(doc => {
        const userData = doc.data()
        const existingUsername = userData.username || ''
        const existingUsernameLower = existingUsername.toLowerCase()
        
        if (existingUsernameLower === lowercaseUsername) {
          found = true
          matchedUsername = existingUsername
          console.log(`❌ MATCH FOUND: "${username}" matches existing user "${existingUsername}"`)
        }
      })
      
      if (!found) {
        console.log(`✅ Username "${username}" is AVAILABLE`)
      }
      
      console.log('=== USERNAME CHECK END ===')
      
      return !found
      
    } catch (error) {
      console.error('=== USERNAME CHECK ERROR ===')
      console.error('Error details:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      
      // If there's a permission error, the Firestore rules aren't deployed correctly
      if (error.code === 'permission-denied') {
        console.error('❌ PERMISSION DENIED - Check Firestore rules in Firebase Console')
        console.error('The read rule for users collection should be: allow read: if true;')
        alert('Cannot verify username availability. Firestore rules may need updating. Allowing signup...')
        return true // Allow signup on permission error
      }
      
      // For other errors, allow signup (better UX)
      console.error('Allowing signup due to error')
      return true
    }
  }

  async function signup(email, password, username, characterClass) {
    // Username is already generated and unique at this point
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const userId = userCredential.user.uid
        
        // Set initial stats based on character class
        let initialStats = { strength: 10, intelligence: 10, agility: 10, charisma: 5 }
        
        if (characterClass === 'warrior') {
          initialStats.strength = 15 // +5 bonus for warriors
        } else if (characterClass === 'mage') {
          initialStats.intelligence = 15 // +5 bonus for mages
        } else if (characterClass === 'rogue') {
          initialStats.agility = 15 // +5 bonus for rogues
        }
        
        // Create initial user document in Firestore
        await setDoc(doc(db, 'users', userId), {
          username: username || 'Hero',
          usernameLowercase: (username || 'Hero').toLowerCase(), // Store lowercase for case-insensitive searches
          email: email,
          characterClass: characterClass || 'warrior',
          level: 1,
          xp: 0,
          totalXp: 0,
          health: 100,
          maxHealth: 100,
          gold: 0,
          stats: initialStats,
          habits: [],
          achievements: [],
          classProgress: {
            warrior: { maxLevel: 0, timePlayed: 0 },
            wizard: { maxLevel: 0, timePlayed: 0 },
            rogue: { maxLevel: 0, timePlayed: 0 },
            ascendant: { unlocked: false, timePlayed: 0 }
          },
          streakData: {
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
            streakFreezes: 0,
            totalLoginDays: 0,
            freezeActive: false,
            freezeUntil: null
          },
          inventory: {
            items: [],
            maxSlots: 20,
            activeEffects: [],
            upgrades: []
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        // Store character class in localStorage
        if (characterClass) {
          localStorage.setItem(`characterClass_${userId}`, characterClass)
        }
        
        // Update display name after signup
        return updateProfile(userCredential.user, {
          displayName: displayName || 'Hero'
        })
      })
  }

  function login(email, password) {
    console.log('AuthContext - Attempting to login:', email)
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('AuthContext - Login successful, user:', userCredential.user.uid, userCredential.user.email)
        return userCredential
      })
  }

  function logout() {
    // Clear current user immediately to prevent state issues
    setCurrentUser(null)
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User: ${user.uid} (${user.email})` : 'No user')
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    signup,
    login,
    logout,
    checkUsernameAvailable,
    generateUniqueUsername
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
