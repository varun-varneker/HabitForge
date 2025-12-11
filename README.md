# ⚔️ HabitForge

**Level up your life by forging better habits into legendary achievements.**

HabitForge is a gamified habit-tracking web app that transforms your daily routines into an epic RPG adventure. Complete quests (habits), gain experience points, level up your character, and compete with friends in guilds—all while building the life you want.

## ✨ What Makes HabitForge Different?

Unlike traditional habit trackers, HabitForge makes self-improvement feel like playing your favorite RPG:

- **Your habits become quests** - Every task you complete earns XP and gold
- **You have a character** - Choose between Warrior, Mage, or Rogue classes with unique abilities
- **Progress feels rewarding** - Level up, unlock achievements, and watch your character grow stronger
- **Accountability matters** - Skip a quest and lose health; fail too many and enter Recovery Mode
- **Social features** - Join guilds, compete on leaderboards, and motivate each other
- **Cross-device sync** - Your progress follows you everywhere with real-time cloud sync

## 🎮 Core Features

### 🧙 Character System
- **Personality Quiz**: Take a 10-question quiz during signup to discover your ideal class
- **Three Classes**:
  - **Warrior** ⚔️: High health, perfect for tackling tough daily habits
  - **Mage** 🧙: Bonus starting XP, ideal for knowledge-focused goals
  - **Rogue** 🗡️: Balanced stats with extra gold, great for varied routines
- **Class Switching**: Earn the ability to switch classes by completing specific achievement milestones
- **Hero Ranks**: Progress from Novice to Legendary Hero based on total XP

### 📝 Quest (Habit) Management
- **Three Quest Types**:
  - Daily: Reset every 24 hours
  - Weekly: Reset every 7 days
  - Monthly: Reset every 30 days
- **Difficulty Levels**: Choose Easy, Medium, or Hard for different XP/gold rewards
- **Smart Tracking**: Automatic streak counting and "missed quest" detection
- **Mobile-Friendly**: Long-press to delete, swipe actions, and responsive design
- **Customizable**: Add custom XP and gold rewards for any quest

### 💪 Progression System
- **XP & Leveling**: Complete quests to gain XP and level up
- **Health System**: Skip quests to lose HP; lose all HP and enter Recovery Mode
- **Streak Rewards**: Build streaks for bonus XP multipliers (7-day, 30-day, 100-day milestones)
- **Gold Economy**: Earn gold from quests and spend it in the shop
- **Mastery Levels**: Track long-term dedication with separate mastery progression

### 🏆 Achievements & Milestones
- **100+ Achievements**: Unlock badges for various accomplishments
- **Streak Milestones**: Special rewards for 7, 30, 50, and 100-day streaks
- **Class Mastery**: Complete class-specific challenges to unlock new abilities
- **Progress Visualization**: Timeline view showing your journey over time

### 🛒 Shop & Inventory
- **Health Potions**: Restore HP when you need a second chance
- **XP Elixirs**: Boost your experience gains temporarily
- **Streak Freezes**: Protect your streak when life gets busy
- **Permanent Upgrades**: Unlock character enhancements with gold

### 👥 Social Features
- **Guilds**: Create or join guilds with up to 20 members
- **Guild Tiers**: Bronze, Silver, Gold, Platinum guilds with increasing perks
- **Weekly Guild Quests**: Collaborate on shared challenges
- **Friends System**: Add friends, send messages, and compare progress
- **Private Chat**: Stay motivated with direct messaging

### 🔄 Cloud Sync
- **Real-time Synchronization**: Powered by Firebase Firestore
- **Offline Support**: Continue tracking even without internet
- **Multi-device**: Seamlessly switch between phone, tablet, and desktop
- **Conflict-free**: Smart sync prevents data loss across devices

## 🚀 Getting Started

### Quick Start

1. **Clone the repository**:
```bash
git clone <your-repo-url>
cd HHW
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up Firebase** (see [FIREBASE_SETUP.md](FIREBASE_SETUP.md)):
   - Create a free Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Email/Password authentication
   - Create a Firestore database
   - Copy your config to `src/firebase.js`

4. **Start the app**:
```bash
npm run dev
```

5. **Create your character**:
   - Sign up with email and password
   - Choose your hero name
   - Take the personality quiz
   - Start forging habits!

## 📖 How to Use

### Creating Your First Quest

1. Click the **+** button (mobile) or **Add Quest** (desktop)
2. Enter a quest name (e.g., "Morning Exercise")
3. Choose frequency: Daily, Weekly, or Monthly
4. Select difficulty: Easy, Medium, or Hard
5. Optionally set custom XP/gold rewards
6. Click **Add Quest**

### Completing Quests

- **Desktop**: Click the checkmark ✓ button
- **Mobile**: Tap the **DO IT** button

You'll earn:
- **Easy**: 10 XP, 5 Gold
- **Medium**: 25 XP, 10 Gold  
- **Hard**: 50 XP, 20 Gold

Plus streak bonuses and achievements!

### Managing Your Health

- Completing quests **restores 10 HP**
- Skipping quests **costs 10 HP**
- Reaching **0 HP** triggers **Recovery Mode** (3 days with no penalties)
- Buy **Health Potions** from the shop for emergencies

### Joining a Guild

1. Open the **Guild Browser** from the menu
2. Search for guilds by name or tier
3. Click **Join Guild** on one you like
4. Or create your own guild and invite friends!

## 🎯 Game Mechanics Explained

### The Penalty System

Missing a quest (not completing it before it resets) has consequences:
- **Daily quest missed**: -10 HP
- **Weekly quest missed**: -15 HP  
- **Monthly quest missed**: -20 HP

This creates healthy accountability without being punishing.

### Recovery Mode

If your HP reaches zero, you enter a 3-day Recovery Mode where:
- ✅ You can still complete quests and earn rewards
- ✅ No HP penalties for missed/skipped quests
- ✅ HP slowly regenerates each day
- ⏰ After 3 days, normal rules resume

### Streak Bonuses

Build streaks to unlock multipliers:
- **7-day streak**: +10% XP bonus
- **30-day streak**: +25% XP bonus + achievement
- **100-day streak**: +50% XP bonus + rare achievement

### Class Switching

Unlock the ability to change classes by:
1. Reaching Level 20 in any class
2. Completing 100 total quests
3. Earning 50 achievements

Then switch between Warrior, Mage, and Rogue anytime!

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: CSS3 with CSS Grid/Flexbox
- **Backend**: Firebase (Firestore + Authentication)
- **Real-time Sync**: Firestore offline persistence
- **State Management**: React Context API + Hooks
- **Mobile**: Touch events, responsive design, PWA-ready

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth.jsx                    # Login/signup with quiz
│   ├── Character.jsx               # Character stats display
│   ├── CharacterQuiz.jsx           # Class selection quiz
│   ├── CharacterStats.jsx          # Detailed stats modal
│   ├── HabitList.jsx               # Quest list (desktop)
│   ├── AddHabitForm.jsx            # Quest creation form
│   ├── Shop.jsx                    # Item shop
│   ├── Inventory.jsx               # Player inventory
│   ├── ProgressVisualization.jsx   # Timeline & stats
│   ├── GuildBrowser.jsx            # Guild discovery
│   ├── GuildDashboard.jsx          # Guild management
│   ├── FriendsList.jsx             # Social features
│   └── mobile/
│       ├── MobileCharacter.jsx     # Mobile character card
│       ├── MobileQuestCard.jsx     # Quest with long-press delete
│       ├── MobileRadialMenu.jsx    # Bottom navigation
│       └── MobileBottomNav.jsx     # Tab navigation
├── contexts/
│   ├── AuthContext.jsx             # Firebase auth state
│   ├── GuildContext.jsx            # Guild operations
│   └── FriendsContext.jsx          # Social features
├── data/
│   ├── characterQuiz.js            # Quiz questions
│   ├── heroRanks.js                # Rank definitions
│   ├── achievements.js             # Achievement list
│   ├── shopItems.js                # Shop inventory
│   ├── streakSystem.js             # Streak rewards
│   ├── penaltySystem.js            # Missed quest penalties
│   └── guildData.js                # Guild tiers
├── utils/
│   ├── inventoryManager.js         # Item usage logic
│   └── timelineTracker.js          # Progress tracking
├── hooks/
│   └── useIsMobile.js              # Responsive breakpoint
├── firebase.js                      # Firebase config
├── App.jsx                          # Main app logic
└── main.jsx                         # Entry point
```

## 🎨 Customization Guide

### Changing Rewards

Edit `src/App.jsx` lines ~1150-1170:
```javascript
const getDifficultyReward = (difficulty) => {
  return {
    easy: { xp: 10, gold: 5 },
    medium: { xp: 25, gold: 10 },
    hard: { xp: 50, gold: 20 }
  }[difficulty]
}
```

### Adding Shop Items

Edit `src/data/shopItems.js`:
```javascript
{
  id: 'my-item',
  name: 'Custom Power-Up',
  icon: '✨',
  price: 100,
  type: 'consumable',
  effect: { /* your effect */ }
}
```

### Creating New Achievements

Edit `src/data/achievements.js`:
```javascript
{
  id: 'my-achievement',
  name: 'Achievement Name',
  description: 'Do something cool',
  icon: '🏆',
  requirement: { /* condition */ }
}
```

## 🔧 Advanced Features

### Firestore Offline Persistence

The app uses Firestore's offline cache for:
- ✅ Work without internet
- ✅ Automatic sync when reconnected  
- ✅ Multi-tab support
- ✅ Conflict-free updates

### Mobile Optimizations

- Touch-friendly 44px minimum tap targets
- Long-press gestures for quick actions
- Swipe navigation
- Responsive modals (full-screen on mobile)
- Hardware acceleration for smooth animations

### Performance

- Debounced cloud saves (500ms for non-critical updates)
- Immediate saves for user actions (purchases, quest completion)
- Smart listener skips own writes to prevent sync loops
- Efficient re-renders with React.memo and useCallback

## 🐛 Troubleshooting

### "Cannot connect to Firebase"
- Check your `src/firebase.js` config matches Firebase Console
- Ensure Firestore is enabled in Firebase Console
- Verify Authentication > Email/Password is enabled

### "Quests not syncing"
- Check browser console for errors
- Ensure you're logged in
- Try refreshing the page
- Check internet connection

### "Health not updating"
- This is likely due to cached data
- Complete a quest to trigger a save
- Check Firestore console to verify data

## 📱 Mobile Installation

HabitForge works great as a mobile web app:

1. Open in mobile browser
2. Tap browser menu (⋮ or share icon)
3. Select "Add to Home Screen"
4. Enjoy the native-app experience!

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional character classes
- More achievement types
- Guild raid bosses
- Habit templates library
- Data export/analytics
- Dark/light theme toggle

## 📄 License

This project is open source and available for personal and educational use.

## 🙏 Acknowledgments

Built with:
- React + Vite
- Firebase
- Blood, sweat, and determination ⚔️

---

**Start forging better habits today. Your legendary journey awaits! 🎮✨**
