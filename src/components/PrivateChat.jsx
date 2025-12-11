import { useState, useEffect, useRef } from 'react'
import { useFriends } from '../contexts/FriendsContext'
import { useAuth } from '../contexts/AuthContext'

function PrivateChat({ friend, onClose }) {
  const { sendPrivateMessage, subscribeToMessages, markMessagesAsRead } = useFriends()
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Subscribe to messages
  useEffect(() => {
    if (!friend?.id) return

    const unsubscribe = subscribeToMessages(friend.id, (msgs) => {
      setMessages(msgs)
      
      // Mark unread messages as read
      const unreadMessages = msgs.filter(
        m => m.receiverId === currentUser.uid && !m.read
      ).map(m => m.id)
      
      if (unreadMessages.length > 0) {
        markMessagesAsRead(friend.id, unreadMessages)
      }
    })

    return unsubscribe
  }, [friend?.id, currentUser])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      await sendPrivateMessage(friend.id, friend.friendId, newMessage)
      setNewMessage('')
    } catch (error) {
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content private-chat-modal" onClick={(e) => e.stopPropagation()}>
        {/* Chat Header */}
        <div className="modal-header private-chat-header">
          <div className="chat-friend-info">
            <div className="friend-avatar-large">
              {friend.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h2>{friend.username || 'Unknown'}</h2>
              <div className="friend-status">Level {friend.level || 1} • {friend.characterClass || 'Warrior'}</div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Messages Area */}
        <div className="private-messages-container" ref={messagesContainerRef}>
          {messages.length === 0 ? (
            <div className="empty-chat-state">
              <p>💬 No messages yet</p>
              <p className="empty-hint">Start a conversation with {friend.username}!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === currentUser.uid
              return (
                <div 
                  key={message.id} 
                  className={`private-message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                >
                  {!isOwnMessage && (
                    <div className="message-avatar">
                      {friend.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  
                  <div className="message-content">
                    <div className="message-bubble">
                      {message.text}
                    </div>
                    <div className="message-time">
                      {formatTimestamp(message.createdAt)}
                      {isOwnMessage && message.read && <span className="read-indicator"> • Read</span>}
                    </div>
                  </div>

                  {isOwnMessage && (
                    <div className="message-avatar own-avatar">
                      You
                    </div>
                  )}
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="private-message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${friend.username}...`}
            className="message-input"
            disabled={sending}
          />
          <button 
            type="submit" 
            className="send-message-btn"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? '...' : '📤 Send'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PrivateChat
