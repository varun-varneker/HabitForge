import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { db } from '../firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp
} from 'firebase/firestore'
import { calculateGuildLevel, getGuildBonusMultiplier } from '../data/guildData'

const GuildContext = createContext()

export function useGuild() {
  return useContext(GuildContext)
}

export function GuildProvider({ children }) {
  const { currentUser } = useAuth()
  const [currentGuild, setCurrentGuild] = useState(null)
  const [userGuildId, setUserGuildId] = useState(null)
  const [allGuilds, setAllGuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [guildMessages, setGuildMessages] = useState([])

  // Check and delete inactive guilds (solo guilds older than 7 days)
  useEffect(() => {
    if (!currentUser) return

    const checkInactiveGuilds = async () => {
      const guildsRef = collection(db, 'guilds')
      const snapshot = await getDocs(guildsRef)
      const now = Date.now()
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000

      snapshot.forEach(async (docSnap) => {
        const guild = docSnap.data()
        
        // Check if guild has only 1 member (the leader) and is older than 7 days
        if (guild.memberCount === 1 && guild.createdAt) {
          const createdAt = guild.createdAt.toMillis ? guild.createdAt.toMillis() : guild.createdAt
          const guildAge = now - createdAt

          if (guildAge > sevenDaysInMs) {
            // Delete the guild
            const guildRef = doc(db, 'guilds', docSnap.id)
            await deleteDoc(guildRef)

            // Update the leader's user document
            const leaderId = guild.leaderId
            if (leaderId) {
              const userDocRef = doc(db, 'users', leaderId)
              await updateDoc(userDocRef, {
                guildId: null
              })
            }

            // If current user was in this guild, clear their state
            if (userGuildId === docSnap.id) {
              setUserGuildId(null)
              setCurrentGuild(null)
            }

            console.log(`Auto-deleted inactive guild: ${guild.name}`)
          }
        }
      })
    }

    // Check on mount
    checkInactiveGuilds()

    // Check daily
    const interval = setInterval(checkInactiveGuilds, 24 * 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [currentUser, userGuildId])

  // Load user's guild membership
  useEffect(() => {
    if (!currentUser) {
      setUserGuildId(null)
      setCurrentGuild(null)
      setLoading(false)
      return
    }

    const userDocRef = doc(db, 'users', currentUser.uid)
    
    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data()
        const guildId = userData.guildId

        if (guildId) {
          setUserGuildId(guildId)
          // Load guild data
          const guildDocRef = doc(db, 'guilds', guildId)
          const guildSnap = await getDoc(guildDocRef)
          
          if (guildSnap.exists()) {
            setCurrentGuild({ id: guildSnap.id, ...guildSnap.data() })
          } else {
            // Guild was deleted, clear user's guild reference
            await updateDoc(userDocRef, { guildId: null })
            setUserGuildId(null)
            setCurrentGuild(null)
          }
        } else {
          setUserGuildId(null)
          setCurrentGuild(null)
        }
      } else {
        // Create user document if it doesn't exist
        await setDoc(userDocRef, {
          guildId: null,
          username: currentUser.displayName || 'Hero',
          joinedAt: serverTimestamp()
        })
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  // Real-time guild data updates
  useEffect(() => {
    if (!userGuildId) return

    const guildDocRef = doc(db, 'guilds', userGuildId)
    const unsubscribe = onSnapshot(guildDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentGuild({ id: docSnap.id, ...docSnap.data() })
      } else {
        // Guild was deleted
        setCurrentGuild(null)
        setUserGuildId(null)
      }
    })

    return () => unsubscribe()
  }, [userGuildId])

  // Real-time guild messages
  useEffect(() => {
    if (!userGuildId) {
      setGuildMessages([])
      return
    }

    const messagesRef = collection(db, 'guilds', userGuildId, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = []
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() })
      })
      setGuildMessages(messages)
    })

    return () => unsubscribe()
  }, [userGuildId])

  // Load all guilds for browsing
  const loadAllGuilds = async () => {
    const guildsRef = collection(db, 'guilds')
    const q = query(guildsRef, orderBy('level', 'desc'))
    const snapshot = await getDocs(q)
    
    const guilds = []
    snapshot.forEach((doc) => {
      guilds.push({ id: doc.id, ...doc.data() })
    })
    setAllGuilds(guilds)
    return guilds
  }

  // Create a new guild
  const createGuild = async (guildData) => {
    if (!currentUser) throw new Error('Must be logged in to create a guild')
    if (userGuildId) throw new Error('Already in a guild')

    const guildRef = doc(collection(db, 'guilds'))
    const now = Date.now()
    const newGuild = {
      name: guildData.name,
      description: guildData.description || '',
      banner: guildData.banner || 'dragon',
      tier: 'casual',
      leaderId: currentUser.uid,
      members: [{
        userId: currentUser.uid,
        username: currentUser.displayName || 'Hero',
        role: 'leader',
        joinedAt: now,
        contribution: 0
      }],
      memberCount: 1,
      xp: 0,
      level: 1,
      totalStats: 0,
      weeklyQuests: {
        current: null,
        progress: 0,
        completedThisWeek: false,
        streak: 0
      },
      treasury: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    await setDoc(guildRef, newGuild)

    // Update user's guild membership
    const userDocRef = doc(db, 'users', currentUser.uid)
    await updateDoc(userDocRef, {
      guildId: guildRef.id
    })

    setUserGuildId(guildRef.id)
    return guildRef.id
  }

  // Join a guild
  const joinGuild = async (guildId) => {
    if (!currentUser) throw new Error('Must be logged in')
    if (userGuildId) throw new Error('Already in a guild')

    const guildRef = doc(db, 'guilds', guildId)
    const guildSnap = await getDoc(guildRef)

    if (!guildSnap.exists()) throw new Error('Guild not found')

    const guild = guildSnap.data()
    const maxMembers = guild.tier === 'casual' ? 5 : guild.tier === 'competitive' ? 7 : 10

    if (guild.memberCount >= maxMembers) {
      throw new Error('Guild is full')
    }

    const newMember = {
      userId: currentUser.uid,
      username: currentUser.displayName || 'Hero',
      role: 'member',
      joinedAt: Date.now(),
      contribution: 0
    }

    await updateDoc(guildRef, {
      members: arrayUnion(newMember),
      memberCount: increment(1)
    })

    const userDocRef = doc(db, 'users', currentUser.uid)
    await updateDoc(userDocRef, {
      guildId: guildId
    })

    setUserGuildId(guildId)
  }

  // Leave guild
  const leaveGuild = async () => {
    if (!currentUser || !userGuildId) return

    const guildRef = doc(db, 'guilds', userGuildId)
    const guildSnap = await getDoc(guildRef)

    if (!guildSnap.exists()) return

    const guild = guildSnap.data()
    const member = guild.members.find(m => m.userId === currentUser.uid)

    if (member.role === 'leader') {
      throw new Error('Leader must transfer leadership before leaving')
    }

    await updateDoc(guildRef, {
      members: arrayRemove(member),
      memberCount: increment(-1)
    })

    const userDocRef = doc(db, 'users', currentUser.uid)
    await updateDoc(userDocRef, {
      guildId: null
    })

    setUserGuildId(null)
    setCurrentGuild(null)
  }

  // Send message to guild chat
  const sendMessage = async (content) => {
    if (!currentUser || !userGuildId) return

    const messagesRef = collection(db, 'guilds', userGuildId, 'messages')
    await setDoc(doc(messagesRef), {
      userId: currentUser.uid,
      username: currentUser.displayName || 'Hero',
      content,
      timestamp: serverTimestamp()
    })
  }

  // Contribute to guild (called when user completes a quest)
  const contributeToGuild = async (questData) => {
    if (!currentUser || !userGuildId) return

    const guildRef = doc(db, 'guilds', userGuildId)
    const guildSnap = await getDoc(guildRef)

    if (!guildSnap.exists()) return

    const guild = guildSnap.data()
    const memberIndex = guild.members.findIndex(m => m.userId === currentUser.uid)

    if (memberIndex === -1) return

    // Update member contribution
    const updatedMembers = [...guild.members]
    updatedMembers[memberIndex] = {
      ...updatedMembers[memberIndex],
      contribution: (updatedMembers[memberIndex].contribution || 0) + 1
    }

    // Update guild weekly quest progress
    let weeklyProgress = guild.weeklyQuests?.progress || 0
    weeklyProgress += 1

    await updateDoc(guildRef, {
      members: updatedMembers,
      'weeklyQuests.progress': weeklyProgress,
      updatedAt: serverTimestamp()
    })
  }

  // Donate to guild treasury
  const donateToTreasury = async (amount) => {
    if (!currentUser || !userGuildId || amount <= 0) return

    const guildRef = doc(db, 'guilds', userGuildId)
    await updateDoc(guildRef, {
      treasury: increment(amount),
      updatedAt: serverTimestamp()
    })
  }

  // Get guild XP bonus
  const getGuildBonus = () => {
    if (!currentGuild) return 1.0

    const guildLevelData = calculateGuildLevel(currentGuild.xp || 0)
    const bonusMultiplier = getGuildBonusMultiplier(guildLevelData.level, currentGuild.tier)
    
    return 1.0 + bonusMultiplier
  }

  // Get member profile data from users collection
  const getMemberProfile = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userDocRef)
      
      if (userSnap.exists()) {
        return userSnap.data()
      }
      return null
    } catch (error) {
      console.error('Error fetching member profile:', error)
      return null
    }
  }

  // Get unread guild messages count
  const getUnreadGuildMessagesCount = () => {
    if (!currentUser || !currentGuild?.id) return 0
    
    const lastReadKey = `lastReadGuildMessage_${currentGuild.id}_${currentUser.uid}`
    const lastReadTime = localStorage.getItem(lastReadKey)
    
    if (!lastReadTime) return guildMessages.length
    
    const unread = guildMessages.filter(msg => {
      const msgTime = msg.createdAt?.toDate ? msg.createdAt.toDate().getTime() : 0
      return msgTime > parseInt(lastReadTime)
    })
    
    return unread.length
  }

  // Mark guild messages as read
  const markGuildMessagesAsRead = () => {
    if (!currentGuild?.id || !currentUser) return
    
    const lastReadKey = `lastReadGuildMessage_${currentGuild.id}_${currentUser.uid}`
    localStorage.setItem(lastReadKey, Date.now().toString())
  }

  const value = {
    currentGuild,
    userGuildId,
    allGuilds,
    loading,
    guildMessages,
    createGuild,
    joinGuild,
    leaveGuild,
    loadAllGuilds,
    sendMessage,
    contributeToGuild,
    donateToTreasury,
    getGuildBonus,
    getMemberProfile,
    getUnreadGuildMessagesCount,
    markGuildMessagesAsRead
  }

  return (
    <GuildContext.Provider value={value}>
      {children}
    </GuildContext.Provider>
  )
}
