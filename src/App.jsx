import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Character from './components/Character'
import HabitList from './components/HabitList'
import AddHabitForm from './components/AddHabitForm'
import GuildBrowser from './components/GuildBrowser'
import CreateGuild from './components/CreateGuild'
import GuildDashboard from './components/GuildDashboard'
import FriendsList from './components/FriendsList'
import PrivateChat from './components/PrivateChat'
import Shop from './components/Shop'
import Inventory from './components/Inventory'
import ProgressVisualization from './components/ProgressVisualization'
import { useAuth } from './contexts/AuthContext'
import { useGuild } from './contexts/GuildContext'
import { useFriends } from './contexts/FriendsContext'
import { characterClasses, calculateClassByStatDominance, checkAscendantUnlock } from './data/characterQuiz'
import { calculateMasteryLevel } from './data/masteryLevels'
import { checkNewAchievements } from './data/achievements'
import { addTimelineEvent } from './utils/timelineTracker'
// Mobile components
import { useIsMobile } from './hooks/useIsMobile'
import MobileCharacter from './components/mobile/MobileCharacter'
import MobileQuestCard from './components/mobile/MobileQuestCard'
import MobileRadialMenu from './components/mobile/MobileRadialMenu'
import './components/mobile/MobileLayout.css'
import { 
  calculateStreak, 
  getStreakMultiplier, 
  getNextMilestone,
  getCurrentMilestone,
  getWeeklyBonus,
  applyStreakFreeze,
  getRecoveryOffer,
  STREAK_MILESTONES,
  STREAK_FREEZE_COST
} from './data/streakSystem'
import {
  PENALTY_CONFIG,
  applyQuestMissPenalty,
  applyDeathPenalty,
  checkRecoveryMode,
  calculateRewardModifier,
  getWoundedState,
  formatTimeRemaining
} from './data/penaltySystem'
import { getItemById } from './data/shopItems'
import { 
  createInventory, 
  addItemToInventory, 
  removeItemFromInventory,
  addActiveEffect,
  removeExpiredEffects,
  applyInventoryUpgrade,
  calculateTotalMultipliers
} from './utils/inventoryManager'
import { db } from './firebase'
import { doc, setDoc, getDoc, serverTimestamp, collection, query, orderBy, onSnapshot } from 'firebase/firestore'

function App() {
  const { currentUser, logout } = useAuth()
  const { currentGuild, contributeToGuild, getGuildBonus } = useGuild()
  const { friends, friendRequests } = useFriends()
  const isMobile = useIsMobile(968) // Mobile breakpoint at 968px
  const [showGuildBrowser, setShowGuildBrowser] = useState(false)
  const [showCreateGuild, setShowCreateGuild] = useState(false)
  const [showGuildDashboard, setShowGuildDashboard] = useState(false)
  const [showFriendsList, setShowFriendsList] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mobileActiveTab, setMobileActiveTab] = useState('quests') // Mobile tab state
  const [showAddForm, setShowAddForm] = useState(false) // Mobile add form toggle
  const [showStats, setShowStats] = useState(false) // Stats modal toggle
  const [showProgress, setShowProgress] = useState(false) // Progress modal toggle
  const [notifications, setNotifications] = useState([])
  const [unreadPrivateMessages, setUnreadPrivateMessages] = useState(0)
  const [unreadGuildMessages, setUnreadGuildMessages] = useState(0)
  const [dataLoaded, setDataLoaded] = useState(false) // Track if initial data is loaded

  // 7-Level Hero Ranking System XP requirements (capped at level 7)
  const heroLevelXP = [
    { level: 1, name: 'Novice', xpRequired: 0 },
    { level: 2, name: 'Apprentice', xpRequired: 100 },
    { level: 3, name: 'Adventurer', xpRequired: 300 },
    { level: 4, name: 'Champion', xpRequired: 600 },
    { level: 5, name: 'Hero', xpRequired: 1000 },
    { level: 6, name: 'Legend', xpRequired: 1500 },
    { level: 7, name: 'Mythic Hero', xpRequired: 2200 }
  ]

  // Calculate XP required for next level
  const calculateXpForLevel = (level) => {
    if (level >= 7) return 0 // Max level reached
    const nextLevelData = heroLevelXP.find(l => l.level === level + 1)
    const currentLevelData = heroLevelXP.find(l => l.level === level)
    return nextLevelData ? nextLevelData.xpRequired - currentLevelData.xpRequired : 0
  }
  const [character, setCharacter] = useState({
    name: 'Hero',
    class: 'warrior',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    health: 100,
    maxHealth: 100,
    gold: 0,
    stats: { strength: 10, intelligence: 10, agility: 10, charisma: 10 }
  })

  const [habits, setHabits] = useState([])

  const [unlockedAchievements, setUnlockedAchievements] = useState([])

  const [classProgress, setClassProgress] = useState({
    warrior: { maxLevel: 0, timePlayed: 0 },
    wizard: { maxLevel: 0, timePlayed: 0 },
    rogue: { maxLevel: 0, timePlayed: 0 },
    ascendant: { unlocked: false, timePlayed: 0 }
  })

  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    streakFreezes: 0,
    totalLoginDays: 0,
    freezeActive: false,
    freezeUntil: null
  })

  const [classNotification, setClassNotification] = useState(null)
  const [achievementNotification, setAchievementNotification] = useState(null)
  const [streakNotification, setStreakNotification] = useState(null)
  const [questFilter, setQuestFilter] = useState('all')

  // Inventory state
  const [inventory, setInventory] = useState(createInventory())

  // Reload all state when user changes (e.g., switching accounts)
  useEffect(() => {
    const userId = currentUser?.uid
    console.log('=== APP.JSX USER CHANGE ===')
    console.log('Current User ID:', userId)
    console.log('Current User Email:', currentUser?.email)
    console.log('Current User Display Name:', currentUser?.displayName)
    
    if (!userId) return

    // Load user data from Firestore on login
    const loadUserData = async () => {
      try {
        console.log('Fetching Firestore data for user:', userId)
        const userDocRef = doc(db, 'users', userId)
        const userDoc = await getDoc(userDocRef)
        
        console.log('Firestore document exists:', userDoc.exists())
        if (userDoc.exists()) {
          const userData = userDoc.data()
          console.log('Firestore data:', userData)
          console.log('Character level from Firestore:', userData.level)
          console.log('Character XP from Firestore:', userData.xp)
          
          // Always use Firestore data as source of truth
          console.log('Using Firestore as source of truth')
          
          // Load character from Firestore
          const firestoreCharacter = {
            name: userData.username || currentUser?.displayName || 'Hero',
            class: userData.characterClass || 'warrior',
            level: userData.level || 1,
            xp: userData.xp || 0,
            xpToNextLevel: calculateXpForLevel(userData.level || 1),
            health: userData.health || 100,
            maxHealth: userData.maxHealth || 100,
            gold: userData.gold || 0,
            stats: userData.stats || { strength: 10, intelligence: 10, agility: 10, charisma: 10 },
            totalXp: userData.totalXp || 0,
            recoveryModeEndTime: userData.recoveryModeEndTime || null
          }
          
          setCharacter(firestoreCharacter)
          
          // Load habits
          setHabits(userData.habits || [])
          
          // Load achievements
          setUnlockedAchievements(userData.achievements || [])
          
          // Load class progress
          const defaultClassProgress = {
            warrior: { maxLevel: 0, timePlayed: 0 },
            wizard: { maxLevel: 0, timePlayed: 0 },
            rogue: { maxLevel: 0, timePlayed: 0 },
            ascendant: { unlocked: false, timePlayed: 0 }
          }
          setClassProgress(userData.classProgress || defaultClassProgress)
          
          // Load streak data
          const defaultStreakData = {
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
            streakFreezes: 0,
            totalLoginDays: 0,
            freezeActive: false,
            freezeUntil: null
          }
          setStreakData(userData.streakData || defaultStreakData)
          
          // Load inventory
          setInventory(userData.inventory || createInventory())
          
        } else {
          console.log('No Firestore data - new user')
          // New user - data will be created on first action
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setDataLoaded(true)
      }
    }
    
    loadUserData()

  }, [currentUser?.uid])

  // Real-time sync: Listen for Firestore changes (cloud is source of truth)
  useEffect(() => {
    const userId = currentUser?.uid
    if (!userId || !dataLoaded) return

    console.log('🔄 Setting up real-time cloud sync for user:', userId)
    const userDocRef = doc(db, 'users', userId)
    
    let isFirstSnapshot = true
    
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      // Skip first snapshot (we already loaded initial data)
      if (isFirstSnapshot) {
        isFirstSnapshot = false
        console.log('📡 Cloud listener active - will sync all changes automatically')
        return
      }
      
      // Skip updates from our own writes (prevent echo)
      if (docSnapshot.metadata.hasPendingWrites) {
        console.log('⏭️ Skipping own write')
        return
      }
      
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data()
        console.log('☁️ Cloud update received from another device:', {
          level: userData.level,
          xp: userData.xp,
          gold: userData.gold,
          habits: userData.habits?.length
        })
        
        // Apply cloud data directly to state (Firestore is always correct)
        setCharacter({
          name: userData.username || 'Hero',
          class: userData.characterClass || 'warrior',
          level: userData.level || 1,
          xp: userData.xp || 0,
          xpToNextLevel: calculateXpForLevel(userData.level || 1),
          health: userData.health || 100,
          maxHealth: userData.maxHealth || 100,
          gold: userData.gold || 0,
          stats: userData.stats || { strength: 10, intelligence: 10, agility: 10, charisma: 10 },
          totalXp: userData.totalXp || 0,
          recoveryModeEndTime: userData.recoveryModeEndTime || null
        })
        
        if (userData.habits) setHabits(userData.habits)
        if (userData.achievements) setUnlockedAchievements(userData.achievements)
        if (userData.inventory) setInventory(userData.inventory)
        if (userData.streakData) setStreakData(userData.streakData)
        if (userData.classProgress) setClassProgress(userData.classProgress)
      }
    }, (error) => {
      console.error('❌ Cloud sync error:', error)
    })

    return () => {
      console.log('🔌 Disconnecting cloud sync')
      unsubscribe()
    }
  }, [currentUser?.uid, dataLoaded])

  // Centralized cloud save - debounced to prevent lag
  const saveToCloud = useCallback(async (data, immediate = false) => {
    const userId = currentUser?.uid
    if (!userId) return

    const performSave = async () => {
      try {
        const userDocRef = doc(db, 'users', userId)
        await setDoc(userDocRef, {
          ...data,
          updatedAt: Date.now()
        }, { merge: true })
        console.log('💾 Saved to cloud:', Object.keys(data).join(', '))
      } catch (err) {
        console.error('❌ Cloud save failed:', err)
      }
    }

    if (immediate) {
      // Save immediately for critical actions like purchases
      await performSave()
    } else {
      // Clear existing timeout
      if (window.cloudSaveTimeout) clearTimeout(window.cloudSaveTimeout)
      
      // Debounce: save 500ms after last change
      window.cloudSaveTimeout = setTimeout(performSave, 500)
    }
  }, [currentUser?.uid])

  // Auto-reset recurring quests
  useEffect(() => {
    if (!currentUser) return

    const checkRecurringReset = () => {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      
      setHabits(prevHabits => {
        let hasChanges = false
        const updatedHabits = prevHabits.map(habit => {
          if (!habit.recurring || !habit.completed || !habit.lastCompleted) {
            return habit
          }

          const completedDate = new Date(habit.lastCompleted)
          const completedMidnight = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate()).getTime()
          
          let shouldReset = false

          if (habit.recurring === 'daily') {
            shouldReset = today > completedMidnight
          } else if (habit.recurring === 'weekly') {
            const daysDiff = Math.floor((today - completedMidnight) / (1000 * 60 * 60 * 24))
            shouldReset = daysDiff >= 7
          } else if (habit.recurring === 'monthly') {
            const daysDiff = Math.floor((today - completedMidnight) / (1000 * 60 * 60 * 24))
            shouldReset = daysDiff >= 30
          }

          if (shouldReset) {
            hasChanges = true
            return {
              ...habit,
              completed: false,
              lastCompleted: null
            }
          }

          return habit
        })

        if (hasChanges) {
          return updatedHabits
        }
        return prevHabits
      })
    }

    checkRecurringReset()
    const interval = setInterval(checkRecurringReset, 60000)

    return () => clearInterval(interval)
  }, [currentUser])

  // Streak system - check and update daily
  useEffect(() => {
    const userId = currentUser?.uid
    if (!userId) return

    const updatedStreak = calculateStreak(streakData, habits)
    
    // Check if streak changed
    if (updatedStreak.currentStreak !== streakData.currentStreak || 
        updatedStreak.isBroken ||
        updatedStreak.lastActiveDate !== streakData.lastActiveDate) {
      
      setStreakData(updatedStreak)
      
      // Sync to Firestore
      const userDocRef = doc(db, 'users', userId)
      const now = Date.now()
      
      setDoc(userDocRef, {
        streakData: updatedStreak,
        updatedAt: now
      }, { merge: true }).catch(err => console.error('Error syncing streak:', err))
      
      // Check for milestone achievement
      if (updatedStreak.currentStreak > streakData.currentStreak) {
        const milestone = STREAK_MILESTONES.find(m => m.days === updatedStreak.currentStreak)
        
        if (milestone) {
          // Award milestone rewards
          setCharacter(prev => ({
            ...prev,
            gold: prev.gold + milestone.reward.gold,
            xp: prev.xp + milestone.reward.xp
          }))
          
          // Show streak milestone notification
          setStreakNotification({
            type: 'milestone',
            milestone,
            currentStreak: updatedStreak.currentStreak
          })
          setTimeout(() => setStreakNotification(null), 6000)
          
          // Log in timeline
          addTimelineEvent(userId, {
            type: 'streak_milestone',
            level: character.level,
            description: `${milestone.days}-Day Streak: ${milestone.name}!`,
            icon: milestone.icon,
            details: `Earned ${milestone.reward.gold} gold and ${milestone.reward.xp} XP`
          })
        }
        
        // Check for weekly bonus
        const weeklyBonus = getWeeklyBonus(updatedStreak.currentStreak)
        if (weeklyBonus) {
          setCharacter(prev => ({
            ...prev,
            gold: prev.gold + weeklyBonus.gold,
            xp: prev.xp + weeklyBonus.xp
          }))
          
          setStreakNotification({
            type: 'weekly',
            bonus: weeklyBonus,
            currentStreak: updatedStreak.currentStreak
          })
          setTimeout(() => setStreakNotification(null), 5000)
        }
      }
      
      // Streak broken notification
      if (updatedStreak.isBroken && streakData.currentStreak > 0) {
        setStreakNotification({
          type: 'broken',
          lostStreak: streakData.currentStreak,
          recoveryOffer: getRecoveryOffer(streakData)
        })
        setTimeout(() => setStreakNotification(null), 8000)
        
        // Log streak break
        addTimelineEvent(userId, {
          type: 'streak_broken',
          level: character.level,
          description: `Streak ended at ${streakData.currentStreak} days`,
          icon: '💔',
          details: 'Comeback time! Start a new streak today.'
        })
      }
    }
  }, [habits, currentUser])

  // Persist inventory data
  useEffect(() => {
    const userId = currentUser?.uid
    if (userId) {
      
      // Debounce inventory sync
      if (window.inventorySyncTimeout) clearTimeout(window.inventorySyncTimeout)
      
      window.inventorySyncTimeout = setTimeout(() => {
        const userDocRef = doc(db, 'users', userId)
        const now = Date.now()
        
        setDoc(userDocRef, {
          inventory: inventory,
          updatedAt: now
        }, { merge: true }).catch(err => console.error('Error syncing inventory:', err))
      }, 1000)
    }
  }, [inventory, currentUser])

  // Persist class progress
  useEffect(() => {
    const userId = currentUser?.uid
    if (userId) {
      
      // Debounce class progress sync
      if (window.classProgressSyncTimeout) clearTimeout(window.classProgressSyncTimeout)
      
      window.classProgressSyncTimeout = setTimeout(() => {
        const userDocRef = doc(db, 'users', userId)
        const now = Date.now()
        
        setDoc(userDocRef, {
          classProgress: classProgress,
          updatedAt: now
        }, { merge: true }).catch(err => console.error('Error syncing class progress:', err))
      }, 1000)
    }
  }, [classProgress, currentUser])

  // Listen for new private messages and show notifications
  useEffect(() => {
    if (!currentUser || friends.length === 0) return

    const unsubscribers = []

    friends.forEach(friend => {
      const messagesRef = collection(db, 'friends', friend.id, 'messages')
      const q = query(messagesRef, orderBy('createdAt', 'desc'))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const message = change.doc.data()
            
            // Only show notification if message is from friend (not from self) and is new
            if (message.senderId !== currentUser.uid && message.senderId === friend.friendId) {
              const messageTime = message.createdAt?.toDate ? message.createdAt.toDate().getTime() : Date.now()
              const now = Date.now()
              
              // Only show notification for messages sent in last 5 seconds (new messages)
              if (now - messageTime < 5000) {
                showNotification({
                  id: change.doc.id,
                  type: 'private',
                  title: `💬 ${friend.username}`,
                  message: message.text,
                  timestamp: Date.now()
                })
              }
            }
          }
        })
      })

      unsubscribers.push(unsubscribe)
    })

    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }, [currentUser, friends])

  // Listen for new guild messages and show notifications
  useEffect(() => {
    if (!currentUser || !currentGuild?.id) return

    const messagesRef = collection(db, 'guilds', currentGuild.id, 'messages')
    const q = query(messagesRef, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const message = change.doc.data()
          
          // Only show notification if message is from another guild member
          if (message.senderId !== currentUser.uid) {
            const messageTime = message.createdAt?.toDate ? message.createdAt.toDate().getTime() : Date.now()
            const now = Date.now()
            
            // Only show notification for messages sent in last 5 seconds
            if (now - messageTime < 5000) {
              showNotification({
                id: change.doc.id,
                type: 'guild',
                title: `🏰 ${currentGuild.name}`,
                message: `${message.senderName}: ${message.text}`,
                timestamp: Date.now()
              })
            }
          }
        }
      })
    })

    return () => unsubscribe()
  }, [currentUser, currentGuild])

  // Show notification function
  const showNotification = (notification) => {
    setNotifications(prev => [...prev, notification])
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)

    // Play notification sound (optional - simple beep)
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      // Ignore audio errors
    }
  }

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Check for new achievements
  useEffect(() => {
    const newAchievements = checkNewAchievements(character, habits, unlockedAchievements)
    
    if (newAchievements.length > 0) {
      newAchievements.forEach(achievement => {
        // Award achievement rewards
        setCharacter(prev => ({
          ...prev,
          gold: prev.gold + (achievement.reward.gold || 0),
          xp: prev.xp + (achievement.reward.xp || 0)
        }))
        
        // Track in timeline
        if (currentUser?.uid) {
          addTimelineEvent(currentUser.uid, {
            type: 'achievement',
            level: character.level,
            description: `Unlocked: ${achievement.name}`,
            icon: achievement.icon,
            details: achievement.description
          })
        }
        
        // Show notification
        setAchievementNotification(achievement)
        setTimeout(() => setAchievementNotification(null), 5000)
      })
      
      // Mark as unlocked
      setUnlockedAchievements(prev => [
        ...prev,
        ...newAchievements.map(a => a.id)
      ])
    }
  }, [character, habits])

  const addHabit = (habitName, difficulty, category, recurring) => {
    const newHabit = {
      id: Date.now(),
      name: habitName,
      difficulty,
      category: category || 'strength',
      recurring: recurring || 'permanent',
      streak: 0,
      totalCompletions: 0,
      completed: false,
      lastCompleted: null,
      createdAt: new Date().toISOString()
    }
    const updatedHabits = [...habits, newHabit]
    setHabits(updatedHabits)
    
    // Save to cloud immediately
    saveToCloud({ habits: updatedHabits }, true)
    
    // Track quest creation in timeline
    if (currentUser?.uid) {
      addTimelineEvent(currentUser.uid, {
        type: 'quest_created',
        level: character.level,
        description: `New quest: ${habitName}`,
        icon: '📝',
        details: `${difficulty} difficulty, ${category} category`
      })
    }
  }

  // Streak freeze handler
  const handleFreezeStreak = () => {
    if (character.gold < STREAK_FREEZE_COST) {
      setNotification('Not enough gold to freeze streak!')
      return
    }

    if (streakData.freezeActive) {
      setNotification('Streak is already frozen!')
      return
    }

    const updatedStreak = applyStreakFreeze(streakData)
    const updatedCharacter = {
      ...character,
      gold: character.gold - STREAK_FREEZE_COST
    }

    setStreakData(updatedStreak)
    setCharacter(updatedCharacter)

    setNotification('🧊 Streak frozen! You have 24 hours of protection.')
  }

  // Streak recovery handler
  const handleRecoverStreak = () => {
    const recoveryOffer = getRecoveryOffer(streakData)
    
    if (!recoveryOffer) {
      setNotification('Recovery window has expired.')
      return
    }

    if (character.gold < recoveryOffer.cost) {
      setNotification(`Not enough gold! Need ${recoveryOffer.cost} gold.`)
      return
    }

    const updatedStreak = {
      ...streakData,
      currentStreak: recoveryOffer.streakToRecover,
      lastActiveDate: new Date().toISOString()
    }

    const updatedCharacter = {
      ...character,
      gold: character.gold - recoveryOffer.cost
    }

    setStreakData(updatedStreak)
    setCharacter(updatedCharacter)

    setStreakNotification(null)
    setNotification(`🔥 Streak recovered! You're back on a ${recoveryOffer.streakToRecover}-day streak!`)
  }

  // Handle character death
  const handleDeath = () => {
    const deathResult = applyDeathPenalty(character, streakData)
    
    setCharacter(deathResult.character)
    setStreakData(deathResult.streak)

    // Show death notification
    setStreakNotification({
      type: 'death',
      icon: '💀',
      title: '💀 YOU HAVE FALLEN',
      message: `Lost ${deathResult.penalties.goldLost} gold, ${deathResult.penalties.xpLost} XP, and your ${deathResult.penalties.streakLost}-day streak!`,
      details: `Recovery mode active for ${PENALTY_CONFIG.DEATH_RECOVERY_HOURS} hours. Rewards reduced by 50%.`
    })

    setTimeout(() => setStreakNotification(null), 10000)

    // Log death to timeline
    if (currentUser?.uid) {
      addTimelineEvent(currentUser.uid, {
        type: 'death',
        level: character.level,
        description: 'Defeated by neglect',
        icon: '💀',
        details: `Lost ${deathResult.penalties.goldLost} gold, ${deathResult.penalties.xpLost} XP, streak reset`
      })
    }
  }

  // Shop purchase handler
  const handlePurchase = (item) => {
    // Deduct gold
    const newGold = character.gold - item.price
    setCharacter({
      ...character,
      gold: newGold
    })

    // Handle permanent upgrades
    let newInventory
    if (item.permanent) {
      if (item.effect.type === 'inventory_upgrade') {
        newInventory = applyInventoryUpgrade(inventory, item.effect.slotIncrease, item.id)
        setNotification(`✅ Inventory upgraded! +${item.effect.slotIncrease} slots`)
      } else if (item.effect.type === 'quest_slot') {
        newInventory = { ...inventory, purchasedUpgrades: [...inventory.purchasedUpgrades, item.id] }
        setNotification(`✅ Quest slots unlocked! +${item.effect.slots} slots`)
      }
    } else {
      // Add consumable item to inventory
      newInventory = addItemToInventory(inventory, item.id, 1)
      setNotification(`✅ Purchased ${item.name}!`)
    }
    
    setInventory(newInventory)

    // Log purchase
    if (currentUser?.uid) {
      addTimelineEvent(currentUser.uid, {
        type: 'shop_purchase',
        level: character.level,
        description: `Purchased ${item.name}`,
        icon: item.icon,
        details: `Spent ${item.price} gold`
      })
    }
    
    // Save to cloud immediately (no debounce for purchases)
    saveToCloud({
      gold: newGold,
      inventory: newInventory
    }, true)
  }

  // Use item handler
  const handleUseItem = (item) => {
    // Remove item from inventory
    const newInventory = removeItemFromInventory(inventory, item.id, 1)
    
    // Apply item effect
    switch (item.effect.type) {
      case 'heal':
        const healAmount = item.effect.amount === 'full' 
          ? character.maxHealth - character.health
          : Math.min(item.effect.amount, character.maxHealth - character.health)
        
        setCharacter({
          ...character,
          health: item.effect.amount === 'full' 
            ? character.maxHealth 
            : Math.min(character.health + item.effect.amount, character.maxHealth)
        })
        setNotification(`❤️ Restored ${healAmount} HP!`)
        break
        
      case 'xp_boost':
      case 'gold_boost':
        const inventoryWithEffect = addActiveEffect(newInventory, item.effect)
        setInventory(inventoryWithEffect)
        setNotification(`⚡ ${item.name} activated!`)
        
        if (currentUser?.uid) {
        }
        return
        
      case 'streak_freeze':
        const updatedStreak = {
          ...streakData,
          freezeActive: true,
          freezeUntil: Date.now() + item.effect.duration
        }
        setStreakData(updatedStreak)
        setNotification(`🛡️ Streak protected for ${item.name.includes('Premium') ? '7 days' : '24 hours'}!`)
        
        if (currentUser?.uid) {
        }
        break
        
      case 'death_protection':
        newInventory.activeEffects.push({
          type: 'death_protection',
          reviveHP: item.effect.reviveHP,
          id: `death_protection_${Date.now()}`
        })
        setInventory(newInventory)
        setNotification(`⚜️ Immortal Shield active!`)
        break
        
      case 'stat_boost':
        // This would require a stat selection modal - simplified version
        setNotification(`💪 Stat boost item used! (Select stat in future update)`)
        break
        
      case 'task_reset':
        setNotification(`🔄 Task Reset Token ready! Use on a missed quest.`)
        break
        
      default:
        setNotification(`✅ Used ${item.name}`)
    }
    
    setInventory(newInventory)
    
    if (currentUser?.uid) {
      addTimelineEvent(currentUser.uid, {
        type: 'item_used',
        level: character.level,
        description: `Used ${item.name}`,
        icon: item.icon,
        details: item.description
      })
    }
  }

  const completeHabit = (habitId) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    // Calculate mastery level and apply multiplier
    const currentCompletions = habit.totalCompletions || 0
    const masteryData = calculateMasteryLevel(currentCompletions)
    const masteryMultiplier = masteryData.multiplier

    // Get guild bonus
    const guildMultiplier = getGuildBonus()
    
    // Get streak multiplier
    const streakMultiplier = getStreakMultiplier(streakData.currentStreak)
    
    // Get recovery mode penalty
    const recoveryModifier = calculateRewardModifier(character)
    
    // Get shop boost multipliers
    const { xpMultiplier: shopXPMultiplier, goldMultiplier: shopGoldMultiplier } = calculateTotalMultipliers(inventory)

    const baseXpReward = {
      easy: 10,
      medium: 25,
      hard: 50
    }[habit.difficulty]

    const baseGoldReward = {
      easy: 5,
      medium: 10,
      hard: 20
    }[habit.difficulty]

    // Apply all multipliers including recovery penalty and shop boosts
    const xpReward = Math.floor(baseXpReward * masteryMultiplier * guildMultiplier * streakMultiplier * recoveryModifier * shopXPMultiplier)
    const goldReward = Math.floor(baseGoldReward * masteryMultiplier * streakMultiplier * recoveryModifier * shopGoldMultiplier)
    
    // Heal HP on quest completion
    const healthGain = PENALTY_CONFIG.QUEST_HEALTH_GAIN

    // Stat rewards based on difficulty (mastery affects these indirectly via more completions)
    const statIncrease = {
      easy: 1,
      medium: 2,
      hard: 3
    }[habit.difficulty]

    // Stat bonuses based on habit category
    const newStats = { ...character.stats }
    const primaryStatBonus = statIncrease

    // Increase primary stat based on habit category
    if (habit.category === 'strength') {
      newStats.strength += primaryStatBonus
    } else if (habit.category === 'intelligence') {
      newStats.intelligence += primaryStatBonus
    } else if (habit.category === 'agility') {
      newStats.agility += primaryStatBonus
    } else if (habit.category === 'charisma') {
      newStats.charisma += primaryStatBonus
    } else {
      // Fallback to class-based if no category (backward compatibility)
      if (character.class === 'warrior') {
        newStats.strength += primaryStatBonus
      } else if (character.class === 'wizard') {
        newStats.intelligence += primaryStatBonus
      } else if (character.class === 'rogue') {
        newStats.agility += primaryStatBonus
      }
    }

    // Store previous values for comparison
    const previousLevel = character.level
    const previousStats = { ...character.stats }
    const newTotalCompletions = (habit.totalCompletions || 0) + 1

    // Contribute to guild if member
    if (currentGuild) {
      contributeToGuild({
        difficulty: habit.difficulty,
        category: habit.category
      })
    }

    // Update character with health restoration
    const newXp = character.xp + xpReward
    const newGold = character.gold + goldReward
    const newHealth = Math.min(character.health + healthGain, character.maxHealth)
    
    // Calculate TOTAL accumulated XP (not just current level XP)
    const currentLevelData = heroLevelXP.find(l => l.level === character.level)
    const totalXp = currentLevelData.xpRequired + newXp  // Add base XP for current level
    
    let newLevel = character.level
    
    // Calculate level based on total XP (capped at 7)
    for (let i = heroLevelXP.length - 1; i >= 0; i--) {
      if (totalXp >= heroLevelXP[i].xpRequired) {
        newLevel = heroLevelXP[i].level
        break
      }
    }
    
    // Cap at level 7
    if (newLevel > 7) newLevel = 7
    
    // Calculate remaining XP for current level
    const newLevelData = heroLevelXP.find(l => l.level === newLevel)
    const nextLevelData = newLevel < 7 ? heroLevelXP.find(l => l.level === newLevel + 1) : null
    const xpInCurrentLevel = totalXp - newLevelData.xpRequired
    const xpToNext = nextLevelData ? nextLevelData.xpRequired - newLevelData.xpRequired : 0

    // Check for class switching BEFORE updating character
    const previousClass = character.class
    const isAscendant = previousClass === 'ascendant'
    const newClass = calculateClassByStatDominance(newStats, previousClass, isAscendant)
    const shouldSwitchClass = newClass && newClass !== previousClass && previousClass !== 'ascendant'
    const finalClass = shouldSwitchClass ? newClass : previousClass

    // Single character update with all changes (including class if switching)
    setCharacter({
      ...character,
      xp: xpInCurrentLevel,
      level: newLevel,
      xpToNextLevel: xpToNext,
      maxHealth: 100 + (newLevel - 1) * 10,
      health: newHealth,
      gold: newGold,
      stats: newStats,
      class: finalClass
    })

    // Track events in timeline
    if (currentUser?.uid) {
      // Quest completion milestone tracking
      if (newTotalCompletions === 10) {
        addTimelineEvent(currentUser.uid, {
          type: 'milestone',
          level: character.level,
          description: `Completed "${habit.name}" 10 times!`,
          icon: '🎯',
          details: 'Dedication unlocked'
        })
      } else if (newTotalCompletions === 50) {
        addTimelineEvent(currentUser.uid, {
          type: 'milestone',
          level: character.level,
          description: `Completed "${habit.name}" 50 times!`,
          icon: '🏆',
          details: 'Master of consistency'
        })
      } else if (newTotalCompletions === 100) {
        addTimelineEvent(currentUser.uid, {
          type: 'milestone',
          level: character.level,
          description: `Completed "${habit.name}" 100 times!`,
          icon: '👑',
          details: 'Legendary dedication'
        })
      }

      // Level up tracking
      if (newLevel > previousLevel) {
        const levelData = heroLevelXP.find(l => l.level === newLevel)
        addTimelineEvent(currentUser.uid, {
          type: 'level_up',
          level: newLevel,
          description: `Became a ${levelData?.name}!`,
          icon: newLevel === 7 ? '✨' : newLevel >= 5 ? '👑' : newLevel >= 3 ? '⚔️' : '🌟',
          details: `Reached Level ${newLevel}`
        })
      }

      // Stat milestone tracking (25, 50, 75, 100)
      const checkStatMilestone = (statName, oldValue, newValue) => {
        const milestones = [25, 50, 75, 100]
        milestones.forEach(milestone => {
          if (oldValue < milestone && newValue >= milestone) {
            const icons = { strength: '💪', intelligence: '🧠', agility: '⚡', charisma: '✨' }
            addTimelineEvent(currentUser.uid, {
              type: 'stat_milestone',
              level: character.level,
              description: `${statName} reached ${milestone}!`,
              icon: icons[statName.toLowerCase()] || '📈',
              details: `${statName} progression milestone`
            })
          }
        })
      }

      checkStatMilestone('Strength', previousStats.strength, newStats.strength)
      checkStatMilestone('Intelligence', previousStats.intelligence, newStats.intelligence)
      checkStatMilestone('Agility', previousStats.agility, newStats.agility)
      checkStatMilestone('Charisma', previousStats.charisma, newStats.charisma)
      
      // Handle class switching notifications and timeline (already updated character above)
      if (shouldSwitchClass) {
        const newClassData = characterClasses[newClass]
        
        // Update class progress - track max level reached for this class
        setClassProgress(prev => {
          const updated = {
            ...prev,
            [newClass]: {
              ...prev[newClass],
              maxLevel: Math.max(prev[newClass]?.maxLevel || 0, newLevel)
            }
          }
          return updated
        })
        
        // Show class switch notification
        setClassNotification({
          oldClass: characterClasses[previousClass],
          newClass: newClassData,
          reason: `${newClassData.dominantStat.charAt(0).toUpperCase() + newClassData.dominantStat.slice(1)} dominance achieved!`
        })
        setTimeout(() => setClassNotification(null), 6000)
        
        // Log class switch in timeline
        addTimelineEvent(currentUser.uid, {
          type: 'class_switch',
          level: newLevel,
          description: `Class switched to ${newClassData.name}!`,
          icon: newClassData.icon,
          details: `${newClassData.dominantStat.charAt(0).toUpperCase() + newClassData.dominantStat.slice(1)} exceeded other stats by 10+`
        })
      } else if (newLevel > previousLevel && previousClass !== 'ascendant') {
        // Update class progress max level without switching
        setClassProgress(prev => {
          const updated = {
            ...prev,
            [previousClass]: {
              ...prev[previousClass],
              maxLevel: Math.max(prev[previousClass]?.maxLevel || 0, newLevel)
            }
          }
          return updated
        })
      }
      
      // Check for Ascendant unlock
      const canAscend = checkAscendantUnlock({ ...character, stats: newStats, level: newLevel }, classProgress)
      if (canAscend && !classProgress.ascendant.unlocked) {
        setClassProgress(prev => {
          const updated = {
            ...prev,
            ascendant: { ...prev.ascendant, unlocked: true }
          }
          return updated
        })
        
        // Auto-switch to Ascendant
        setCharacter(prev => ({
          ...prev,
          class: 'ascendant'
        }))
        
        // Show Ascendant unlock notification
        setClassNotification({
          oldClass: characterClasses[previousClass],
          newClass: characterClasses.ascendant,
          reason: 'Mastered all three classes and perfected all stats!'
        })
        setTimeout(() => setClassNotification(null), 8000)
        
        // Log Ascendant unlock
        addTimelineEvent(currentUser.uid, {
          type: 'ascendant_unlock',
          level: newLevel,
          description: 'Ascended to Transcendence!',
          icon: '✨',
          details: 'Achieved mastery in Warrior, Wizard, and Rogue. All stats perfected.'
        })
      }
    }

    // Compute updated habits array
    const updatedHabits = habits.map(h => 
      h.id === habitId 
        ? { 
            ...h, 
            streak: h.streak + 1, 
            totalCompletions: newTotalCompletions,
            completed: true,
            lastCompleted: new Date().toISOString() 
          }
        : h
    )
    
    // Update state
    setHabits(updatedHabits)

    // Save ALL changes to cloud immediately
    saveToCloud({
      username: character.name,
      characterClass: finalClass,
      level: newLevel,
      xp: xpInCurrentLevel,
      totalXp,
      xpToNextLevel: xpToNext,
      health: newHealth,
      maxHealth: 100 + (newLevel - 1) * 10,
      stats: newStats,
      totalStats: Object.values(newStats).reduce((a, b) => a + b, 0),
      gold: newGold,
      profileImage: finalClass,
      recoveryModeEndTime: character.recoveryModeEndTime,
      habits: updatedHabits,
      totalQuestsCompleted: updatedHabits.reduce((sum, habit) => sum + (habit.totalCompletions || 0), 0),
      achievements: unlockedAchievements,
      classProgress,
      streakData,
      inventory
    }, true)
  }

  const deleteHabit = (habitId) => {
    const habit = habits.find(h => h.id === habitId)
    const updatedHabits = habits.filter(h => h.id !== habitId)
    setHabits(updatedHabits)
    saveToCloud({ habits: updatedHabits }, true)
    
    // Show deletion notification
    showNotification({
      id: Date.now(),
      type: 'delete',
      title: '🗑️ Quest Deleted',
      message: `"${habit?.name || 'Quest'}" has been removed`
    })
  }

  const skipHabit = (habitId) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    // Apply HP penalty based on quest type
    const updatedCharacter = applyQuestMissPenalty(character, habit.recurring || 'daily')
    
    // Show HP drain notification
    setStreakNotification({
      type: 'hp_drain',
      icon: '💔',
      title: '⚠️ QUEST SKIPPED',
      message: `${habit.name} - Lost ${updatedCharacter.hpLost} HP`,
      details: updatedCharacter.isDead ? 'Your health has reached 0!' : `${updatedCharacter.health}/${updatedCharacter.maxHealth} HP remaining`
    })

    setTimeout(() => setStreakNotification(null), 4000)
    
    // Check if character died
    if (updatedCharacter.isDead) {
      setTimeout(() => handleDeath(), 4500)
    } else {
      setCharacter(updatedCharacter)
    }
    
    // Reset habit streak and increment skip count
    const updatedHabits = habits.map(h => 
      h.id === habitId 
        ? { ...h, streak: 0, skippedCount: (h.skippedCount || 0) + 1 }
        : h
    )
    setHabits(updatedHabits)

    // Save to cloud immediately
    saveToCloud({
      health: updatedCharacter.health,
      habits: updatedHabits
    }, true)

    // Log to timeline
    if (currentUser?.uid) {
      addTimelineEvent(currentUser.uid, {
        type: 'quest_skipped',
        level: character.level,
        description: `Skipped: ${habit.name}`,
        icon: '❌',
        details: `Lost ${updatedCharacter.hpLost} HP`
      })
    }
  }

  async function handleLogout() {
    try {
      const userId = currentUser?.uid
      console.log('Logging out user:', userId)
      await logout()
      console.log('Logout successful')
    } catch (err) {
      console.error('Failed to logout:', err)
    }
  }

  // Filter habits based on selected filter
  const filteredHabits = habits.filter(habit => {
    if (questFilter === 'all') return true
    return habit.recurring === questFilter
  })

  // Calculate hero rank for display
  const heroRank = heroLevelXP.find(rank => rank.level === character.level) || heroLevelXP[0]

  // Check recovery mode from character state
  const isRecoveryMode = character.recoveryModeEndTime && character.recoveryModeEndTime > new Date().getTime()
  const recoveryTimeRemaining = character.recoveryModeEndTime ? character.recoveryModeEndTime - new Date().getTime() : 0

  // Show loading screen until data is loaded
  if (!dataLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#ffd700',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚔️</div>
          <div>Loading your adventure...</div>
        </div>
      </div>
    )
  }

  // Check if any modal is open
  const isAnyModalOpen = showShop || showInventory || showStats || showProgress || 
                         showGuildBrowser || showCreateGuild || showGuildDashboard || 
                         selectedFriend || mobileActiveTab === 'friends'

  // ============================================
  // MOBILE LAYOUT (screens <= 968px)
  // ============================================
  if (isMobile) {
    return (
      <div className="mobile-app">
        {/* Character Summary - hide when modal is open */}
        {!isAnyModalOpen && (
          <MobileCharacter 
            character={character}
            streakData={streakData}
            onViewStats={() => setShowStats(true)}
            onViewProgress={() => setShowProgress(true)}
            heroRank={heroRank}
            isRecoveryMode={isRecoveryMode}
            recoveryTimeRemaining={recoveryTimeRemaining}
          />
        )}

        {/* Main Content Area - hide when modal is open */}
        {!isAnyModalOpen && (
          <div className="mobile-content">
            {mobileActiveTab === 'quests' && (
              <>
                {/* Quests Header */}
                <div className="mobile-habits-header">
                  <h1 className="mobile-habits-title">Quests</h1>
                  <span className="mobile-habits-count">{filteredHabits.length}</span>
                </div>

                {/* Add Quest Form */}
                {showAddForm && (
                  <AddHabitForm 
                    onAddHabit={addHabit}
                    onCancel={() => setShowAddForm(false)}
                  />
                )}

                {/* Quest Filters */}
                <div className="mobile-filters">
                  {['all', 'daily', 'weekly', 'monthly'].map(filter => (
                    <button
                      key={filter}
                      className={`mobile-filter ${questFilter === filter ? 'active' : ''}`}
                      onClick={() => setQuestFilter(filter)}
                    >
                      {filter.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Quest List */}
                <div className="mobile-quest-list">
                  {filteredHabits.length > 0 ? (
                    filteredHabits.map(habit => (
                      <MobileQuestCard
                        key={habit.id}
                        habit={habit}
                        onComplete={completeHabit}
                        onSkip={skipHabit}
                        onDelete={deleteHabit}
                        currentTime={new Date()}
                      />
                    ))
                  ) : (
                    <div className="mobile-empty-state">
                      <div className="mobile-empty-icon">⚔️</div>
                      <div className="mobile-empty-title">No Quests Yet</div>
                      <div className="mobile-empty-message">
                        Tap the + button to create your first quest!
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Action Button */}
                <button 
                  className={`mobile-fab ${showAddForm ? 'rotate' : ''}`}
                  onClick={() => setShowAddForm(!showAddForm)}
                  aria-label="Add Quest"
                >
                  +
                </button>
              </>
            )}
          </div>
        )}

        {/* Radial Menu Navigation - hide when modal is open */}
        {!isAnyModalOpen && (
          <MobileRadialMenu
            activeTab={mobileActiveTab}
            onTabChange={setMobileActiveTab}
            onLogout={handleLogout}
            onOpenGuild={() => setShowGuildBrowser(true)}
            onOpenShop={() => setShowShop(true)}
            onOpenInventory={() => setShowInventory(true)}
            friendRequestsCount={friendRequests.length}
          />
        )}

        {/* Modal for Friends */}
        {mobileActiveTab === 'friends' && (
          <div className="modal-overlay" onClick={() => setMobileActiveTab('quests')}>
            <div className="modal-content friends-modal" onClick={(e) => e.stopPropagation()}>
              <FriendsList 
                onClose={() => setMobileActiveTab('quests')}
                onSelectFriend={(friend) => {
                  setSelectedFriend(friend)
                  setMobileActiveTab('quests')
                }}
              />
            </div>
          </div>
        )}

        {/* Modal for Shop */}
        {showShop && (
          <div className="modal-overlay" onClick={() => setShowShop(false)}>
            <div className="modal-content shop-modal" onClick={(e) => e.stopPropagation()}>
              <Shop 
                character={character}
                inventory={inventory}
                onPurchase={handlePurchase}
                onClose={() => setShowShop(false)}
                onUseItem={handleUseItem}
              />
            </div>
          </div>
        )}

        {/* Modal for Inventory */}
        {showInventory && (
          <div className="modal-overlay" onClick={() => setShowInventory(false)}>
            <div className="modal-content inventory-modal" onClick={(e) => e.stopPropagation()}>
              <Inventory 
                inventory={inventory} 
                onUseItem={handleUseItem} 
                onClose={() => setShowInventory(false)} 
              />
            </div>
          </div>
        )}

        {/* Modals (Same as desktop) */}
        {showGuildBrowser && (
          <GuildBrowser 
            onClose={() => setShowGuildBrowser(false)}
            onCreateGuild={() => {
              setShowGuildBrowser(false)
              setShowCreateGuild(true)
            }}
          />
        )}

        {showCreateGuild && (
          <CreateGuild 
            onClose={() => setShowCreateGuild(false)}
            onSuccess={() => {
              setShowCreateGuild(false)
              setShowGuildDashboard(true)
            }}
          />
        )}

        {showGuildDashboard && currentGuild && (
          <GuildDashboard onClose={() => setShowGuildDashboard(false)} />
        )}

        {selectedFriend && (
          <PrivateChat 
            friend={selectedFriend} 
            onClose={() => setSelectedFriend(null)} 
          />
        )}

        {showStats && (
          <div className="modal-overlay" onClick={() => setShowStats(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Character Stats</h2>
                <button className="close-btn" onClick={(e) => { e.stopPropagation(); setShowStats(false); }}>✕</button>
              </div>
              <Character 
                character={character} 
                heroRank={heroRank}
                streakData={streakData}
                isRecoveryMode={isRecoveryMode}
                recoveryTimeRemaining={recoveryTimeRemaining}
              />
            </div>
          </div>
        )}

        {showProgress && (
          <div className="modal-overlay" onClick={() => setShowProgress(false)}>
            <div className="modal-content progress-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header sticky-header">
                <h2>📈 Progress & Timeline</h2>
                <button 
                  className="close-btn" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    e.preventDefault();
                    setShowProgress(false); 
                  }}
                >✕</button>
              </div>
              <div className="modal-body">
                <ProgressVisualization character={character} onClose={() => setShowProgress(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Notification Toasts */}
        <div className="notifications-container">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-toast ${notification.type}`}
              onClick={() => removeNotification(notification.id)}
            >
              <div className="notification-header">
                <span className="notification-title">{notification.title}</span>
                <button className="notification-close" onClick={(e) => {
                  e.stopPropagation()
                  removeNotification(notification.id)
                }}>✕</button>
              </div>
              <div className="notification-message">{notification.message}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================
  // DESKTOP LAYOUT (screens > 968px)
  // ============================================
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>⚔️ HabitForge</h1>
            <p className="tagline">Level up your life, one habit at a time!</p>
          </div>
          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </header>

      {/* Sidebar Menu */}
      <div className={`menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <nav className={`sidebar-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h2>Menu</h2>
        </div>
        <div className="menu-items">
          <button 
            onClick={() => {
              setShowFriendsList(true)
              setIsMenuOpen(false)
            }} 
            className="menu-item"
          >
            <span className="menu-icon">👥</span>
            <span className="menu-label">Friends</span>
            {friendRequests.length > 0 && (
              <span className="menu-badge">{friendRequests.length}</span>
            )}
          </button>
          <button 
            onClick={() => {
              setShowShop(true)
              setIsMenuOpen(false)
            }} 
            className="menu-item"
          >
            <span className="menu-icon">🏪</span>
            <span className="menu-label">Shop</span>
          </button>
          <button 
            onClick={() => {
              setShowInventory(true)
              setIsMenuOpen(false)
            }} 
            className="menu-item"
          >
            <span className="menu-icon">🎒</span>
            <span className="menu-label">Inventory</span>
            {Object.keys(inventory.items).length > 0 && (
              <span className="menu-badge">{Object.keys(inventory.items).length}</span>
            )}
          </button>
          {currentGuild ? (
            <button 
              onClick={() => {
                setShowGuildDashboard(true)
                setIsMenuOpen(false)
              }} 
              className="menu-item"
            >
              <span className="menu-icon">🏰</span>
              <span className="menu-label">{currentGuild.name}</span>
            </button>
          ) : (
            <button 
              onClick={() => {
                setShowGuildBrowser(true)
                setIsMenuOpen(false)
              }} 
              className="menu-item"
            >
              <span className="menu-icon">🏰</span>
              <span className="menu-label">Join Guild</span>
            </button>
          )}
          <button 
            onClick={() => {
              handleLogout()
              setIsMenuOpen(false)
            }} 
            className="menu-item logout"
          >
            <span className="menu-icon">🚪</span>
            <span className="menu-label">Logout</span>
          </button>
        </div>
      </nav>

      <div className="game-container">
        <Character 
          character={character} 
          streakData={streakData}
          onFreezeStreak={handleFreezeStreak}
          onRecoverStreak={handleRecoverStreak}
        />
        
        <div className="habits-section">
          <h2>Your Quests</h2>
          <AddHabitForm onAddHabit={addHabit} />
          
          <div className="quest-filters">
            <button 
              className={`filter-btn ${questFilter === 'all' ? 'active' : ''}`}
              onClick={() => setQuestFilter('all')}
            >
              All Quests
            </button>
            <button 
              className={`filter-btn ${questFilter === 'daily' ? 'active' : ''}`}
              onClick={() => setQuestFilter('daily')}
            >
              Daily
            </button>
            <button 
              className={`filter-btn ${questFilter === 'weekly' ? 'active' : ''}`}
              onClick={() => setQuestFilter('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`filter-btn ${questFilter === 'monthly' ? 'active' : ''}`}
              onClick={() => setQuestFilter('monthly')}
            >
              Monthly
            </button>
          </div>

          <HabitList 
            habits={filteredHabits}
            onComplete={completeHabit}
            onDelete={deleteHabit}
            onSkip={skipHabit}
          />
        </div>
      </div>

      {achievementNotification && (
        <div className="achievement-notification">
          <div className="achievement-content">
            <div className="achievement-icon">{achievementNotification.icon}</div>
            <div className="achievement-text">
              <div className="achievement-title">Achievement Unlocked!</div>
              <div className="achievement-name">{achievementNotification.name}</div>
              <div className="achievement-description">{achievementNotification.description}</div>
              <div className="achievement-rewards">
                +{achievementNotification.reward.xp} XP | +{achievementNotification.reward.gold} Gold
              </div>
            </div>
          </div>
        </div>
      )}

      {classNotification && (
        <div className="class-switch-notification">
          <div className="class-switch-content">
            <div className="class-switch-header">
              <div className="class-switch-title">
                {classNotification.newClass.name === 'Ascendant' ? '✨ ASCENDANT UNLOCKED! ✨' : '⚡ CLASS SWITCH! ⚡'}
              </div>
            </div>
            <div className="class-switch-body">
              <div className="old-class">
                <span className="class-icon">{classNotification.oldClass.icon}</span>
                <span className="class-name">{classNotification.oldClass.name}</span>
              </div>
              <div className="arrow">→</div>
              <div className="new-class" style={{ color: classNotification.newClass.color }}>
                <span className="class-icon">{classNotification.newClass.icon}</span>
                <span className="class-name">{classNotification.newClass.name}</span>
              </div>
            </div>
            <div className="class-switch-reason">{classNotification.reason}</div>
          </div>
        </div>
      )}

      {streakNotification && (
        <div className={`streak-notification ${streakNotification.type}`}>
          <div className="streak-notification-content">
            <div className="streak-notification-icon">{streakNotification.icon}</div>
            <div className="streak-notification-text">
              <div className="streak-notification-title">{streakNotification.title}</div>
              <div className="streak-notification-message">{streakNotification.message}</div>
              {streakNotification.rewards && (
                <div className="streak-notification-rewards">
                  +{streakNotification.rewards.gold}💰 | +{streakNotification.rewards.xp}⭐
                </div>
              )}
              {streakNotification.type === 'recovery' && (
                <div className="streak-recovery-actions">
                  <button 
                    className="recover-streak-btn"
                    onClick={handleRecoverStreak}
                  >
                    Recover ({streakNotification.cost}💰)
                  </button>
                  <button 
                    className="dismiss-recovery-btn"
                    onClick={() => setStreakNotification(null)}
                  >
                    Let it go
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showGuildBrowser && (
        <GuildBrowser 
          onClose={() => setShowGuildBrowser(false)}
          onCreateGuild={() => {
            setShowGuildBrowser(false)
            setShowCreateGuild(true)
          }}
        />
      )}

      {showCreateGuild && (
        <CreateGuild 
          onClose={() => setShowCreateGuild(false)}
          onSuccess={() => {
            setShowCreateGuild(false)
            setShowGuildDashboard(true)
          }}
        />
      )}

      {showGuildDashboard && currentGuild && (
        <GuildDashboard onClose={() => setShowGuildDashboard(false)} />
      )}

      {showFriendsList && (
        <div className="modal-overlay" onClick={() => setShowFriendsList(false)}>
          <div className="modal-content friends-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👥 Friends</h2>
              <button className="close-btn" onClick={() => setShowFriendsList(false)}>✕</button>
            </div>
            <FriendsList onSelectFriend={(friend) => {
              setSelectedFriend(friend)
              setShowFriendsList(false)
            }} />
          </div>
        </div>
      )}

      {selectedFriend && (
        <PrivateChat 
          friend={selectedFriend} 
          onClose={() => setSelectedFriend(null)} 
        />
      )}

      {showShop && (
        <Shop 
          character={character} 
          inventory={inventory} 
          onPurchase={handlePurchase} 
          onClose={() => setShowShop(false)} 
          onUseItem={handleUseItem} 
        />
      )}

      {showInventory && (
        <Inventory 
          inventory={inventory} 
          onUseItem={handleUseItem} 
          onClose={() => setShowInventory(false)} 
        />
      )}

      {/* Notification Toasts */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification-toast ${notification.type}`}
            onClick={() => removeNotification(notification.id)}
          >
            <div className="notification-header">
              <span className="notification-title">{notification.title}</span>
              <button className="notification-close" onClick={(e) => {
                e.stopPropagation()
                removeNotification(notification.id)
              }}>✕</button>
            </div>
            <div className="notification-message">{notification.message}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
