# Streak System Documentation

## Overview
The streak system is a comprehensive engagement feature designed to motivate users to log in daily and complete quests. It includes progressive rewards, protective mechanics, and psychological hooks to maximize retention.

## Core Features

### 1. Daily Streak Tracking
- **Current Streak**: Number of consecutive days with at least one completed quest
- **Longest Streak**: Personal best streak record
- **Total Login Days**: Cumulative count of all active days
- **Last Active Date**: Timestamp of last activity for streak validation

### 2. Milestone System (10 Tiers)
| Milestone | Days | Gold Reward | XP Reward | Multiplier |
|-----------|------|-------------|-----------|------------|
| 1 | 3 | 50 | 100 | 1.1x |
| 2 | 7 | 100 | 200 | 1.2x |
| 3 | 14 | 250 | 500 | 1.3x |
| 4 | 30 | 500 | 1000 | 1.5x |
| 5 | 50 | 1000 | 2000 | 1.7x |
| 6 | 75 | 2000 | 4000 | 2.0x |
| 7 | 100 | 3000 | 6000 | 2.3x |
| 8 | 150 | 5000 | 10000 | 2.5x |
| 9 | 200 | 7500 | 15000 | 2.7x |
| 10 | 365 | 10000 | 25000 | 3.0x |

### 3. Reward Multiplier System
- **Stacking Bonuses**: Streak multiplier stacks with Mastery and Guild bonuses
- **Formula**: `finalReward = baseReward × masteryMultiplier × guildMultiplier × streakMultiplier`
- **Maximum Multiplier**: 3.0x at 365-day streak
- **Applies To**: XP rewards and Gold rewards from quest completions

### 4. Streak Protection Mechanics

#### Freeze Feature
- **Cost**: 100 Gold
- **Duration**: 24 hours of protection
- **Usage**: Prevents streak loss if you can't complete a quest
- **Availability**: Can be used at any time when streak > 0
- **UI**: Ice crystal button in Character panel

#### Recovery System
- **Window**: 24 hours after streak breaks
- **Cost**: `brokenStreak × 10 gold`
- **Example**: Lost a 30-day streak? Recover for 300 gold
- **UI**: Automatic notification appears when eligible
- **Action**: Click "Recover" button or dismiss

### 5. Weekly Bonuses
- **Frequency**: Every 7 days of streak
- **Reward**: 200 Gold + 500 XP
- **Auto-Award**: Applied automatically on milestone detection
- **Stacks**: With regular milestone rewards when applicable

### 6. Streak Validation Logic
```javascript
// Daily requirement: Complete at least one quest
const today = new Date().toDateString()
const hasCompletedToday = habits.some(habit => {
  if (!habit.lastCompleted) return false
  return new Date(habit.lastCompleted).toDateString() === today
})

// Streak continues if:
// - Completed quest today, OR
// - Freeze is active and covers today
```

## User Interface

### Character Panel Display
Located in the Character component, the streak panel shows:
- 🔥 **Flame Icon**: Animated flame with glow effect
- **Current Streak**: Days count with color coding
- **Multiplier Bonus**: Percentage boost display
- **Progress Bar**: Visual progress to next milestone
- **Next Milestone**: Days and rewards preview
- **Stats**: Best streak and total login days
- **Freeze Button**: Protect streak option (if affordable)
- **Freeze Status**: Shows when protection is active

### Color Coding
Streaks change color based on length:
- **0-2 days**: `#888` (Gray - Just starting)
- **3-6 days**: `#ff6b00` (Orange - Building momentum)
- **7-29 days**: `#ff4500` (Red-orange - Strong)
- **30-99 days**: `#ff0000` (Red - Very strong)
- **100+ days**: `#ffd700` (Gold - Elite)

### Notifications

#### Milestone Achievement
- **Appearance**: Center screen overlay
- **Duration**: 6 seconds
- **Content**: 
  - Flame icon animation
  - "🔥 STREAK MILESTONE! 🔥" title
  - Days reached message
  - Gold and XP reward display
- **Animation**: Scale-in with glow pulse

#### Streak Broken (Recovery Offer)
- **Appearance**: Center screen overlay
- **Duration**: Until dismissed
- **Content**:
  - Broken chain icon
  - "💔 Streak Broken!" title
  - Lost streak count
  - Recovery cost and countdown
  - "Recover" and "Let it go" buttons
- **Actions**: 
  - Recover: Pay cost to restore streak
  - Dismiss: Accept streak loss

#### Weekly Bonus
- **Appearance**: Brief notification
- **Content**: "🎉 Weekly Bonus! +200💰 +500⭐"
- **Duration**: 4 seconds

## Implementation Files

### Core Data (`src/data/streakSystem.js`)
```javascript
// Key exports:
- STREAK_MILESTONES: Array of 10 milestone tiers
- STREAK_FREEZE_COST: 100 gold constant
- getStreakMultiplier(currentStreak): Returns 1.0 to 3.0
- getNextMilestone(currentStreak): Next goal info
- getCurrentMilestone(currentStreak): Current tier data
- calculateStreak(streakData, habits): Daily validation
- applyStreakFreeze(streakData): Activate protection
- getRecoveryOffer(streakData): Check recovery eligibility
- getWeeklyBonus(currentStreak): Check weekly reward
- isStreakAtRisk(lastActiveDate): Warn at 20+ hours
- getStreakColor(currentStreak): UI color coding
- getStreakMotivation(currentStreak): Encouragement messages
```

### State Management (`src/App.jsx`)
```javascript
// Streak state structure:
const [streakData, setStreakData] = useState({
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  streakFreezes: 0,
  totalLoginDays: 0,
  freezeActive: false,
  freezeUntil: null
})

// Persistence:
localStorage: `streakData_${userId}`
```

### UI Components
- **Character.jsx**: Main streak display panel
- **App.jsx**: Notification overlays and handlers
- **App.css**: Streak-specific styles with animations

## User Psychology

### Engagement Hooks
1. **Daily Goal**: Simple requirement (1 quest) removes barriers
2. **Visual Progress**: Progress bar shows tangible advancement
3. **Milestones**: Regular achievements maintain motivation
4. **Loss Aversion**: Freeze and recovery reduce frustration
5. **Status Display**: Color-coded streaks create social proof
6. **Compound Rewards**: Multipliers increase value over time

### Motivational Messages
- **Starting**: "Every journey begins with a single step!"
- **Building (3+ days)**: "You're on fire! Keep it going!"
- **Strong (7+ days)**: "Impressive dedication! Don't break the chain!"
- **Very Strong (30+ days)**: "Legendary commitment! You're a true hero!"
- **Elite (100+ days)**: "UNSTOPPABLE! You are a master of habits!"

### Risk Warnings
When 20+ hours since last activity:
- "⚠️ Your streak is at risk! Complete a quest today!"
- Appears in Character panel with pulsing animation

## Integration Points

### Timeline System
Streak events automatically logged:
```javascript
addTimelineEvent(userId, {
  type: 'achievement',
  description: `${days}-day streak milestone reached!`,
  icon: '🔥',
  details: `Earned ${goldReward} gold and ${xpReward} XP`
})
```

### Quest Completion
Every quest completion triggers streak validation:
```javascript
// In completeHabit function:
1. Check if today is a new streak day
2. Update lastActiveDate
3. Increment currentStreak if applicable
4. Check for milestone achievements
5. Award milestone rewards
6. Apply streak multiplier to quest rewards
7. Check weekly bonus eligibility
8. Update localStorage
```

### Achievement System
Milestones count as achievements and appear in Progress View under "Milestones" category.

## Best Practices

### For Users
- **Complete at least 1 quest daily** to maintain streak
- **Use freeze strategically** for planned absences (vacations, busy days)
- **Check recovery offers** within 24 hours if streak breaks
- **Monitor progress** in Character panel
- **Aim for milestones** for maximum reward value

### For Developers
- **Always validate dates** using `toDateString()` for day comparison
- **Handle timezone issues** with ISO string storage
- **Persist on every change** to prevent data loss
- **Validate localStorage** on load with fallbacks
- **Test edge cases**: midnight transitions, freeze expiry, recovery window

## Future Enhancements

### Potential Additions
1. **Streak Leaderboard**: Guild or global top streaks
2. **Streak Badges**: Special visual badges for milestones
3. **Multi-Freeze Packs**: Bulk purchase discounts
4. **Streak Sharing**: Social media integration
5. **Seasonal Events**: Bonus multipliers during events
6. **Streak Insurance**: Premium feature for auto-protection
7. **Custom Notifications**: User-configurable reminders
8. **Streak Analytics**: Graphs and statistics dashboard

### Performance Considerations
- Current implementation uses localStorage (synchronous)
- For scale: Consider moving to Firebase Firestore
- Implement caching for frequently accessed data
- Lazy load streak history beyond current streak

## Testing Checklist

- [ ] Day 1: Start new streak
- [ ] Day 2: Verify streak increments
- [ ] Day 3: Check first milestone (50 gold, 100 XP)
- [ ] Freeze: Purchase and verify 24-hour protection
- [ ] Break: Miss a day and check recovery offer
- [ ] Recovery: Pay cost and verify streak restoration
- [ ] Week 1: Complete 7 days and verify weekly bonus
- [ ] Multiplier: Verify rewards scale with streak bonus
- [ ] Timeline: Check events logged correctly
- [ ] Persistence: Reload page and verify state restored
- [ ] Edge Case: Test midnight transitions
- [ ] Edge Case: Test freeze expiration exactly at 24 hours
- [ ] Edge Case: Test recovery window expiration at 24 hours
- [ ] Edge Case: Test multiple quests in one day (should count as one active day)
- [ ] UI: Verify all animations render smoothly
- [ ] UI: Test notification dismissal

## API Reference

### `calculateStreak(streakData, habits)`
Validates current streak status based on daily quest completions and freeze protection.

**Parameters:**
- `streakData`: Current streak state object
- `habits`: Array of all user habits/quests

**Returns:** Updated `streakData` object with:
- `currentStreak`: Validated streak count
- `lastActiveDate`: Updated timestamp
- `freezeActive`: Freeze status
- Incremented `longestStreak` if new record

**Side Effects:** None (pure function)

### `getStreakMultiplier(currentStreak)`
Returns the reward multiplier for the current streak.

**Parameters:**
- `currentStreak`: Number of consecutive days

**Returns:** Number between 1.0 and 3.0

**Examples:**
```javascript
getStreakMultiplier(0)   // 1.0 (no bonus)
getStreakMultiplier(5)   // 1.1 (first milestone)
getStreakMultiplier(30)  // 1.5 (strong streak)
getStreakMultiplier(365) // 3.0 (maximum)
```

### `applyStreakFreeze(streakData)`
Activates 24-hour streak protection.

**Parameters:**
- `streakData`: Current streak state

**Returns:** Updated `streakData` with:
- `freezeActive`: true
- `freezeUntil`: ISO timestamp 24 hours from now
- `streakFreezes`: Incremented count

**Note:** Caller must deduct 100 gold from user separately.

### `getRecoveryOffer(streakData)`
Checks if user is eligible to recover broken streak.

**Parameters:**
- `streakData`: Current streak state

**Returns:** 
- Object with `{ cost, streakToRecover, deadline }` if eligible
- `null` if recovery window expired (>24 hours)

**Eligibility:**
- Streak was broken (currentStreak = 0)
- Less than 24 hours since break
- Had a streak worth recovering (longestStreak > 0)

## Troubleshooting

### Streak not incrementing
**Symptoms**: Completed quest but streak stays at 0
**Causes**:
- Quest marked complete but `lastCompleted` not updated
- Date comparison issue (timezone mismatch)
- useEffect not triggering
**Solutions**:
- Verify `habit.lastCompleted` is set to current date
- Check console for `calculateStreak` calls
- Ensure `habits` array in dependencies

### Freeze not working
**Symptoms**: Streak broke despite active freeze
**Causes**:
- Freeze expired before midnight
- `freezeUntil` timestamp incorrect
**Solutions**:
- Verify freeze timestamp is 24 hours from activation
- Check freeze status in Character panel
- Review `calculateStreak` freeze validation logic

### Recovery offer not appearing
**Symptoms**: Streak broken but no notification
**Causes**:
- More than 24 hours since break
- `lastActiveDate` was null
**Solutions**:
- Check `lastActiveDate` value in localStorage
- Verify recovery window calculation
- Ensure `getRecoveryOffer` returns valid object

### Multiplier not applying
**Symptoms**: Quest rewards not increased by streak
**Causes**:
- `streakMultiplier` not calculated
- Calculation order wrong
**Solutions**:
- Verify `getStreakMultiplier` called in `completeHabit`
- Check reward formula includes all multipliers
- Console.log final reward values

---

**Last Updated**: 2024
**Version**: 1.0
**Maintainer**: HHW Development Team
