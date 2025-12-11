import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Auth from './components/Auth.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { GuildProvider } from './contexts/GuildContext.jsx'
import { FriendsProvider } from './contexts/FriendsContext.jsx'

function Root() {
  const { currentUser } = useAuth()
  return currentUser ? <App key={currentUser.uid} /> : <Auth />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <GuildProvider>
        <FriendsProvider>
          <Root />
        </FriendsProvider>
      </GuildProvider>
    </AuthProvider>
  </StrictMode>,
)
