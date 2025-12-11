import { useState, useEffect } from 'react'
import { useFriends } from '../contexts/FriendsContext'
import { useAuth } from '../contexts/AuthContext'

function FriendsList({ onSelectFriend, onClose }) {
  const { friends, friendRequests, sentRequests, loading, acceptFriendRequest, declineFriendRequest, removeFriend, searchUsers, sendFriendRequest } = useFriends()
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('friends')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    const results = await searchUsers(searchTerm)
    setSearchResults(results)
    setSearching(false)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'search') {
        handleSearch()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, activeTab])

  const handleSendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId)
      alert('Friend request sent!')
      setSearchTerm('')
      setSearchResults([])
    } catch (error) {
      alert(error.message)
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId)
    } catch (error) {
      alert('Failed to accept request')
    }
  }

  const handleDeclineRequest = async (requestId) => {
    try {
      await declineFriendRequest(requestId)
    } catch (error) {
      alert('Failed to decline request')
    }
  }

  const handleRemoveFriend = async (friendshipId, friendName) => {
    if (!confirm(`Remove ${friendName} from friends?`)) return
    
    try {
      await removeFriend(friendshipId)
    } catch (error) {
      alert('Failed to remove friend')
    }
  }

  if (loading) {
    return <div className="friends-list-loading">Loading friends...</div>
  }

  return (
    <div className="friends-list-container">
      <div className="friends-header">
        <h2>👥 Friends</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      
      <div className="friends-tabs">
        <button 
          className={`friends-tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Friends ({friends.length})
        </button>
        <button 
          className={`friends-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests ({friendRequests.length})
        </button>
        <button 
          className={`friends-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Add Friends
        </button>
      </div>

      <div className="friends-content">
        {activeTab === 'friends' && (
          <div className="friends-tab-content">
            {friends.length === 0 ? (
              <div className="empty-state">
                <p>👥 No friends yet</p>
                <p className="empty-hint">Search for users to add friends!</p>
              </div>
            ) : (
              friends.map(friend => (
                <div key={friend.id} className="friend-item">
                  <div className="friend-avatar">
                    {friend.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="friend-info">
                    <div className="friend-name">{friend.username || 'Unknown'}</div>
                    <div className="friend-level">Level {friend.level || 1}</div>
                  </div>
                  <div className="friend-actions">
                    <button 
                      className="btn-chat"
                      onClick={() => onSelectFriend(friend)}
                    >
                      💬 Chat
                    </button>
                    <button 
                      className="btn-remove"
                      onClick={() => handleRemoveFriend(friend.id, friend.username)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="friends-tab-content">
            <div className="requests-section">
              <h3>📬 Incoming Requests</h3>
              {friendRequests.length === 0 ? (
                <p className="empty-hint">No pending requests</p>
              ) : (
                friendRequests.map(request => (
                  <div key={request.id} className="request-item">
                    <div className="friend-avatar">
                      {request.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="friend-info">
                      <div className="friend-name">{request.username || 'Unknown'}</div>
                      <div className="friend-level">Level {request.level || 1}</div>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="btn-accept"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        ✓ Accept
                      </button>
                      <button 
                        className="btn-decline"
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        ✕ Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="requests-section">
              <h3>📤 Sent Requests</h3>
              {sentRequests.length === 0 ? (
                <p className="empty-hint">No sent requests</p>
              ) : (
                sentRequests.map(request => (
                  <div key={request.id} className="request-item pending">
                    <div className="friend-avatar">
                      {request.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="friend-info">
                      <div className="friend-name">{request.username || 'Unknown'}</div>
                      <div className="friend-level">Pending...</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="friends-tab-content">
            <div className="search-section">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by username..."
                className="search-input"
              />
              {searching && <div className="search-loading">Searching...</div>}
              
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(user => {
                    const isFriend = friends.some(f => f.friendId === user.userId)
                    const requestSent = sentRequests.some(r => r.receiverId === user.userId)
                    const requestReceived = friendRequests.some(r => r.senderId === user.userId)

                    return (
                      <div key={user.userId} className="search-result-item">
                        <div className="friend-avatar">
                          {user.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="friend-info">
                          <div className="friend-name">{user.username || 'Unknown'}</div>
                          <div className="friend-level">Level {user.level || 1}</div>
                        </div>
                        <div className="search-actions">
                          {isFriend && <span className="status-badge friend">Friends</span>}
                          {requestSent && <span className="status-badge pending">Request Sent</span>}
                          {requestReceived && <span className="status-badge received">Request Received</span>}
                          {!isFriend && !requestSent && !requestReceived && (
                            <button 
                              className="btn-add-friend"
                              onClick={() => handleSendRequest(user.userId)}
                            >
                              ➕ Add Friend
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {searchTerm.trim().length >= 2 && searchResults.length === 0 && !searching && (
                <div className="empty-state">
                  <p>No users found</p>
                </div>
              )}

              {searchTerm.trim().length < 2 && (
                <div className="empty-hint">
                  Type at least 2 characters to search for users
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FriendsList
