import { useState, useRef, useEffect } from 'react'
import { useGuild } from '../contexts/GuildContext'
import { useAuth } from '../contexts/AuthContext'

function GuildChat() {
  const { guildMessages, sendMessage } = useGuild()
  const { currentUser } = useAuth()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [guildMessages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!message.trim() || sending) return

    setSending(true)
    try {
      await sendMessage(message.trim())
      setMessage('')
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
    <div className="guild-chat">
      <div className="chat-messages">
        {guildMessages.length === 0 ? (
          <div className="no-messages">
            <p>💬 No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {guildMessages.slice().reverse().map((msg) => {
              const isOwnMessage = msg.userId === currentUser?.uid

              return (
                <div 
                  key={msg.id} 
                  className={`chat-message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                >
                  {!isOwnMessage && <div className="message-avatar">{msg.username.charAt(0).toUpperCase()}</div>}
                  <div className="message-bubble">
                    <div className="message-header">
                      <span className="message-author">{isOwnMessage ? 'You' : msg.username}</span>
                      <span className="message-time">{formatTimestamp(msg.timestamp)}</span>
                    </div>
                    <div className="message-content">{msg.content}</div>
                  </div>
                  {isOwnMessage && <div className="message-avatar own-avatar">{msg.username.charAt(0).toUpperCase()}</div>}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          maxLength={500}
          className="chat-input"
          disabled={sending}
        />
        <button 
          type="submit" 
          className="send-btn"
          disabled={!message.trim() || sending}
        >
          {sending ? '...' : '📤'}
        </button>
      </form>
    </div>
  )
}

export default GuildChat
