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
  serverTimestamp,
  or,
  and
} from 'firebase/firestore'

const FriendsContext = createContext()

export function useFriends() {
  return useContext(FriendsContext)
}

export function FriendsProvider({ children }) {
  const { currentUser } = useAuth()
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [privateMessages, setPrivateMessages] = useState({})
  const [loading, setLoading] = useState(true)

  // Listen to friendships (accepted friends)
  useEffect(() => {
    if (!currentUser) {
      setFriends([])
      setLoading(false)
      return
    }

    setLoading(true)
    const friendsRef = collection(db, 'friends')
    
    // Query for accepted friendships where current user is either user1 or user2
    const q = query(
      friendsRef,
      where('status', '==', 'accepted')
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log('Friends snapshot size:', snapshot.size)
      const friendsList = []
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        console.log('Friendship data:', data)
        
        // Only include friendships involving current user
        if (data.user1Id === currentUser.uid || data.user2Id === currentUser.uid) {
          const friendId = data.user1Id === currentUser.uid ? data.user2Id : data.user1Id
          
          console.log('Fetching profile for friend:', friendId)
          
          // Fetch friend's profile data
          const userDocRef = doc(db, 'users', friendId)
          try {
            const userSnap = await getDoc(userDocRef)
            
            if (userSnap.exists()) {
              console.log('Friend profile found:', userSnap.data())
              friendsList.push({
                id: docSnap.id,
                friendId,
                friendshipData: data,
                ...userSnap.data()
              })
            } else {
              console.log('Friend profile not found for:', friendId)
              // Add friend even without profile data
              friendsList.push({
                id: docSnap.id,
                friendId,
                friendshipData: data,
                username: 'Unknown User',
                level: 1
              })
            }
          } catch (error) {
            console.error('Error fetching friend profile:', friendId, error)
            // Add friend even if profile fetch fails
            friendsList.push({
              id: docSnap.id,
              friendId,
              friendshipData: data,
              username: 'Unknown User',
              level: 1
            })
          }
        }
      }
      
      console.log('Total friends found:', friendsList.length)
      setFriends(friendsList)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching friends:', error)
      setLoading(false)
    })

    return unsubscribe
  }, [currentUser])

  // Listen to incoming friend requests
  useEffect(() => {
    if (!currentUser) {
      setFriendRequests([])
      return
    }

    const friendsRef = collection(db, 'friends')
    const q = query(
      friendsRef,
      where('user2Id', '==', currentUser.uid),
      where('status', '==', 'pending')
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requests = []
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        
        // Fetch sender's profile
        const userDocRef = doc(db, 'users', data.user1Id)
        const userSnap = await getDoc(userDocRef)
        
        if (userSnap.exists()) {
          requests.push({
            id: docSnap.id,
            senderId: data.user1Id,
            ...userSnap.data(),
            timestamp: data.createdAt
          })
        }
      }
      
      setFriendRequests(requests)
    })

    return unsubscribe
  }, [currentUser])

  // Listen to sent friend requests
  useEffect(() => {
    if (!currentUser) {
      setSentRequests([])
      return
    }

    const friendsRef = collection(db, 'friends')
    const q = query(
      friendsRef,
      where('user1Id', '==', currentUser.uid),
      where('status', '==', 'pending')
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requests = []
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        
        // Fetch receiver's profile
        const userDocRef = doc(db, 'users', data.user2Id)
        const userSnap = await getDoc(userDocRef)
        
        if (userSnap.exists()) {
          requests.push({
            id: docSnap.id,
            receiverId: data.user2Id,
            ...userSnap.data(),
            timestamp: data.createdAt
          })
        }
      }
      
      setSentRequests(requests)
    })

    return unsubscribe
  }, [currentUser])

  // Send friend request
  const sendFriendRequest = async (receiverId) => {
    if (!currentUser) throw new Error('You must be logged in')
    if (receiverId === currentUser.uid) throw new Error('Cannot send friend request to yourself')

    try {
      // Check if friendship or request already exists
      const friendsRef = collection(db, 'friends')
      const q1 = query(
        friendsRef,
        where('user1Id', '==', currentUser.uid),
        where('user2Id', '==', receiverId)
      )
      const q2 = query(
        friendsRef,
        where('user1Id', '==', receiverId),
        where('user2Id', '==', currentUser.uid)
      )

      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)])

      if (!snapshot1.empty || !snapshot2.empty) {
        throw new Error('Friend request already exists or you are already friends')
      }

      // Create friend request
      const newRequestRef = doc(collection(db, 'friends'))
      await setDoc(newRequestRef, {
        user1Id: currentUser.uid,
        user2Id: receiverId,
        status: 'pending',
        createdAt: serverTimestamp()
      })

      return newRequestRef.id
    } catch (error) {
      console.error('Error sending friend request:', error)
      throw error
    }
  }

  // Accept friend request
  const acceptFriendRequest = async (requestId) => {
    try {
      const requestRef = doc(db, 'friends', requestId)
      await updateDoc(requestRef, {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error accepting friend request:', error)
      throw error
    }
  }

  // Decline friend request
  const declineFriendRequest = async (requestId) => {
    try {
      const requestRef = doc(db, 'friends', requestId)
      await deleteDoc(requestRef)
    } catch (error) {
      console.error('Error declining friend request:', error)
      throw error
    }
  }

  // Remove friend
  const removeFriend = async (friendshipId) => {
    try {
      const friendshipRef = doc(db, 'friends', friendshipId)
      await deleteDoc(friendshipRef)
    } catch (error) {
      console.error('Error removing friend:', error)
      throw error
    }
  }

  // Search users by username
  const searchUsers = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return []

    try {
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      
      const users = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        // Exclude current user and search by username
        if (doc.id !== currentUser?.uid && 
            data.username?.toLowerCase().includes(searchTerm.toLowerCase())) {
          users.push({
            userId: doc.id,
            ...data
          })
        }
      })
      
      return users.slice(0, 10) // Limit to 10 results
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  // Send private message
  const sendPrivateMessage = async (friendshipId, friendId, text) => {
    if (!currentUser) throw new Error('You must be logged in')
    if (!text.trim()) return

    try {
      const messageRef = doc(collection(db, 'friends', friendshipId, 'messages'))
      await setDoc(messageRef, {
        senderId: currentUser.uid,
        receiverId: friendId,
        text: text.trim(),
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // Listen to private messages for a specific friendship
  const subscribeToMessages = (friendshipId, callback) => {
    if (!friendshipId) return () => {}

    const messagesRef = collection(db, 'friends', friendshipId, 'messages')
    const q = query(messagesRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(messages)
    })

    return unsubscribe
  }

  // Mark messages as read
  const markMessagesAsRead = async (friendshipId, messageIds) => {
    try {
      const updatePromises = messageIds.map(messageId => {
        const messageRef = doc(db, 'friends', friendshipId, 'messages', messageId)
        return updateDoc(messageRef, { read: true })
      })
      
      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  // Get total unread messages count
  const getUnreadMessagesCount = async () => {
    if (!currentUser) return 0

    try {
      let totalUnread = 0
      
      for (const friend of friends) {
        const messagesRef = collection(db, 'friends', friend.id, 'messages')
        const q = query(
          messagesRef,
          where('receiverId', '==', currentUser.uid),
          where('read', '==', false)
        )
        const snapshot = await getDocs(q)
        totalUnread += snapshot.size
      }
      
      return totalUnread
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  const value = {
    friends,
    friendRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    searchUsers,
    sendPrivateMessage,
    subscribeToMessages,
    markMessagesAsRead,
    getUnreadMessagesCount
  }

  return (
    <FriendsContext.Provider value={value}>
      {children}
    </FriendsContext.Provider>
  )
}
