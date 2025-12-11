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

  async function checkUsernameAvailable(username) {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('username', '==', username))
      const querySnapshot = await getDocs(q)
      return querySnapshot.empty // Returns true if username is available
    } catch (error) {
      console.error('Error checking username:', error)
      return false
    }
  }

  async function signup(email, password, displayName, characterClass) {
    // First check if username is available
    const isAvailable = await checkUsernameAvailable(displayName)
    if (!isAvailable) {
      throw new Error('USERNAME_TAKEN')
    }

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
          username: displayName || 'Hero',
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
    checkUsernameAvailable
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
