# Enhanced HP Drain & Penalty System

## Overview
The penalty system creates accountability and urgency by penalizing users who skip or fail to complete their quests. It includes progressive HP drain, death penalties, recovery mechanics, and visual feedback to maintain engagement while preventing frustration.

## Core Features

### 1. HP Drain System

#### Skip Quest Penalty
**Trigger**: User clicks "Skip" button on any quest
- **HP Loss**: 10 HP
- **Additional Effects**:
  - Quest streak resets to 0
  - Skip count increments
  - Timeline event logged
  - **Popup Notification** shows:
    - ⚠️ QUEST SKIPPED
    - Quest name
    - HP lost
    - Remaining HP
    - Duration: 4 seconds

#### Missed Daily Quest
**Trigger**: Daily quest not completed by midnight
- **HP Loss**: 15 HP per missed quest
- **Automatic Check**: System checks at midnight
- **Popup Notification** shows cumulative damage from all missed quests

#### Missed Weekly Quest
**Trigger**: Weekly quest not completed within 7 days
- **HP Loss**: 25 HP
- **Check Frequency**: Daily at midnight

#### Missed Monthly Quest
**Trigger**: Monthly quest not completed within 30 days
- **HP Loss**: 50 HP
- **Check Frequency**: Daily at midnight

### 2. Death System

#### Death Trigger
When character HP reaches **0**, death occurs automatically.

#### Death Penalties
Immediate consequences:
- **Gold Loss**: 50% of current gold
- **XP Loss**: -10 XP (cannot drop below current level minimum)
- **Streak Reset**: Current streak drops to 0
- **Recovery Mode**: 24-hour penalty period activated

#### Death Notification
**Type**: Center-screen overlay popup
**Duration**: 10 seconds
**Content**:
- 💀 YOU HAVE FALLEN (pulsing title)
- Gold lost amount
- XP lost amount
- Streak lost count
- Recovery mode details (24 hours, 50% reduced rewards)
- Red/black gradient with death glow animation

#### After Death
- Character revives with **1 HP**
- Death count increments
- Timeline event logged
- Recovery mode begins

### 3. Recovery Mode

#### Activation
Automatically triggers upon death, lasts **24 hours**.

#### Effects During Recovery
- **Reward Reduction**: All quest rewards reduced by 50%
  - XP rewards: `baseXP × multipliers × 0.5`
  - Gold rewards: `baseGold × multipliers × 0.5`
- **Visual Indicator**: Recovery banner shown in Character panel
- **Status Display**: Shows remaining time (e.g., "18h 42m remaining")

#### Recovery Banner
**Location**: Top of Character panel, below level badge
**Design**:
- Pink/purple gradient background
- 🩹 Bandage icon
- "RECOVERY MODE" title (uppercase, bold)
- Details: "50% Reduced Rewards | Xh Xm remaining"
- Pulsing animation

#### Recovery Complete
**Trigger**: 24 hours after death
**Effects**:
- Recovery mode disabled
- Full rewards restored
- **Popup Notification**:
  - ✅ RECOVERY COMPLETE
  - "You have recovered from defeat!"
  - Green gradient
  - Duration: 5 seconds
- Timeline event logged

### 4. Wounded Visual States

#### Health-Based Visual Feedback
Character portrait changes based on HP percentage:

##### Healthy (51-100% HP)
- Normal appearance
- No overlay
- Full color saturation

##### Wounded (21-50% HP)
- Reduced brightness (80%)
- Desaturated colors (70%)
- 🩹 WOUNDED badge overlay
- Dark transparent overlay

##### Critical (1-20% HP)
- Heavy grayscale (60%)
- Darkened (70% brightness)
- ⚠️ CRITICAL badge overlay
- Red-tinted overlay
- **Flash animation**: Red flash every 1.5 seconds
- **Pulse animation**: Opacity pulses

##### Dead (0% HP)
- Full grayscale (100%)
- Very dark (30% brightness)
- 💀 DEFEATED badge overlay
- Black overlay (80% opacity)
- **Shake animation**: Constant shake effect
- **Glow animation**: White/red pulsing glow

#### Wounded Overlay
- Semi-transparent dark background
- Badge centered on character portrait
- Badge design:
  - Black background (90% opacity)
  - Colored border (red for wounded/critical, white for dead)
  - Bold text
  - Glow effect matching severity

### 5. Health Restoration

#### Quest Completion Healing
**Amount**: +2 HP per quest completed
**Cap**: Cannot exceed max HP (100 + (level - 1) × 10)
**Applies**: To all quest difficulties

**Purpose**: 
- Encourages regular quest completion
- Rewards active users
- Creates gradual HP recovery loop

### 6. Notification System

All penalty events trigger popup notifications:

#### HP Drain Notification (Skip)
```
Type: hp_drain
Icon: 💔
Title: ⚠️ QUEST SKIPPED
Message: [Quest Name] - Lost [X] HP
Details: [Current HP]/[Max HP] HP remaining
Duration: 4 seconds
Color: Orange/red gradient
```

#### Death Notification
```
Type: death
Icon: 💀
Title: 💀 YOU HAVE FALLEN
Message: Lost [X] gold, [Y] XP, and your [Z]-day streak!
Details: Recovery mode active for 24 hours. Rewards reduced by 50%.
Duration: 10 seconds
Color: Black/red gradient
Animation: Pulsing glow
```

#### Recovery Complete Notification
```
Type: recovery_complete
Icon: ✅
Title: ✅ RECOVERY COMPLETE
Message: You have recovered from defeat!
Details: Quest rewards are back to normal.
Duration: 5 seconds
Color: Green gradient
```

### 7. Timeline Integration

All penalty events are logged in the user's timeline:

#### Quest Skipped Event
```javascript
{
  type: 'quest_skipped',
  level: currentLevel,
  description: 'Skipped: [Quest Name]',
  icon: '❌',
  details: 'Lost [X] HP'
}
```

#### Death Event
```javascript
{
  type: 'death',
  level: currentLevel,
  description: 'Defeated by neglect',
  icon: '💀',
  details: 'Lost [X] gold, [Y] XP, streak reset'
}
```

#### Recovery Complete Event
```javascript
{
  type: 'recovery_complete',
  level: currentLevel,
  description: 'Recovered from defeat',
  icon: '✅',
  details: 'Full strength restored'
}
```

## Technical Implementation

### Data Structure

#### Character State Extension
```javascript
{
  health: number,
  maxHealth: number,
  inRecovery: boolean,
  recoveryEndTime: number | null, // timestamp
  deathCount: number
}
```

#### Penalty Config
```javascript
{
  SKIP_QUEST: 10,
  MISSED_DAILY: 15,
  MISSED_WEEKLY: 25,
  MISSED_MONTHLY: 50,
  DEATH_GOLD_LOSS: 0.5,
  DEATH_XP_LOSS: 10,
  DEATH_RECOVERY_HOURS: 24,
  DEATH_REWARD_REDUCTION: 0.5,
  QUEST_HEALTH_GAIN: 10
}
```

### Key Functions

#### `applyQuestMissPenalty(character, questType)`
Calculates and applies HP drain based on quest type.

**Parameters**:
- `character`: Current character state
- `questType`: 'daily', 'weekly', 'monthly', or defaults to skip penalty

**Returns**:
```javascript
{
  ...character,
  health: number,
  isDead: boolean,
  hpLost: number
}
```

#### `applyDeathPenalty(character, streakData)`
Processes all death consequences.

**Returns**:
```javascript
{
  character: {
    health: 1,
    gold: reduced,
    xp: reduced,
    inRecovery: true,
    recoveryEndTime: timestamp,
    deathCount: incremented
  },
  streak: {
    currentStreak: 0,
    streakBroken: true
  },
  penalties: {
    goldLost: number,
    xpLost: number,
    streakLost: number
  }
}
```

#### `checkRecoveryMode(character)`
Validates recovery status.

**Returns**:
```javascript
{
  inRecovery: boolean,
  timeRemaining: milliseconds,
  hoursRemaining: number,
  recovered: boolean // if just ended
}
```

#### `calculateRewardModifier(character)`
Returns reward multiplier based on recovery status.

**Returns**: `1.0` (normal) or `0.5` (recovery mode)

#### `getWoundedState(character)`
Determines visual state based on HP.

**Returns**:
```javascript
{
  wounded: boolean,
  severity: 'healthy' | 'wounded' | 'critical' | 'dead',
  message: string
}
```

### Automatic Checking

#### Midnight Quest Check
```javascript
useEffect(() => {
  // Runs at midnight daily
  // Checks all recurring quests
  // Applies cumulative HP drain
  // Shows notification if any missed
}, [currentUser, habits, character])
```

**Logic**:
1. Get today's date
2. Check each daily quest's `lastCompleted` date
3. If not completed yesterday → apply penalty
4. Accumulate total HP loss
5. Show single notification for all missed quests
6. Check for death

#### Recovery Mode Check
```javascript
useEffect(() => {
  // Runs every minute
  // Checks if recovery period ended
  // Auto-disables recovery mode
}, [character.inRecovery, character.recoveryEndTime])
```

## User Experience

### Engagement Loop

1. **Quest Completion** → +1 HP → Gradual healing
2. **Skip Quest** → -10 HP + Notification → Immediate consequence
3. **Miss Daily Quest** → -15 HP + Notification → Morning accountability
4. **Low HP (<50%)** → Wounded visuals → Urgency increases
5. **Critical HP (<20%)** → Flashing red → Panic mode
6. **Death (0 HP)** → Severe penalties + Recovery mode → Learn lesson
7. **24-Hour Recovery** → Reduced rewards → Continued consequence
8. **Recovery Complete** → Full restoration → Fresh start

### Psychological Hooks

- **Loss Aversion**: Seeing HP drain creates urgency
- **Visual Feedback**: Wounded character reinforces danger
- **Progressive Severity**: Escalating penalties prevent habituation
- **Recovery Path**: Always offers redemption, prevents rage-quit
- **Immediate Feedback**: Notifications confirm actions
- **Transparency**: Clear communication of all penalties

## Balance Considerations

### Why These Numbers?

- **Skip: -10 HP**: Mild penalty, allows occasional skip without major consequence
- **Missed Daily: -15 HP**: Stronger than skip, punishes forgetfulness
- **Missed Weekly: -25 HP**: Significant, 4 misses = death
- **Missed Monthly: -50 HP**: Severe, 2 misses = death
- **Death Gold Loss: 50%**: Painful but not total loss
- **Death XP Loss: -10**: Symbolic, doesn't delevel
- **Recovery: 24 hours**: Long enough to sting, short enough to tolerate
- **Recovery Penalty: 50%**: Halves progress, motivates avoiding death
- **Health Gain: +1 HP**: Very slow recovery, requires 100 quests for full heal

### Preventing Frustration

- **Death doesn't delevel**: Progress not destroyed
- **Always revive to 1 HP**: Can immediately start recovering
- **Health gain on completion**: Active users heal gradually (+1 HP per quest)
- **Recovery ends automatically**: No permanent penalty
- **Notifications explain everything**: No confusion
- **Visual states provide warning**: Can avoid death with awareness

## Future Enhancements

### Potential Additions
1. **HP Potions**: Purchase instant healing with gold
2. **Death Protection**: One-time save mechanic (premium feature)
3. **Gradual HP Decay**: Small passive drain over time
4. **Critical Quest Failure**: Extra penalties for important quests
5. **Achievement for Deaths**: "Risen from the Ashes" (die 10 times)
6. **Death Streaks**: Penalties increase with consecutive deaths
7. **Guild Resurrection**: Guild members can revive you early
8. **Stat Penalties**: Temporary stat reduction during recovery
9. **Leaderboard of Deaths**: Public shame/humor feature
10. **Death Memorial**: Timeline marker for each death

## Testing Checklist

- [ ] Skip daily quest → 10 HP drain + notification
- [ ] Skip weekly quest → 10 HP drain + notification
- [ ] Skip monthly quest → 10 HP drain + notification
- [ ] Miss daily quest at midnight → 15 HP drain + notification
- [ ] Character reaches 0 HP → Death triggers
- [ ] Death penalty → 50% gold loss, 10 XP loss, streak reset
- [ ] Death notification shows correct values
- [ ] Character revives at 1 HP
- [ ] Recovery mode activates for 24 hours
- [ ] Recovery banner appears in Character panel
- [ ] Quest rewards reduced by 50% during recovery
- [ ] Recovery mode ends after 24 hours
- [ ] Recovery complete notification appears
- [ ] Timeline logs all penalty events
- [ ] Wounded visual states appear correctly (51%, 21%, 1%, 0%)
- [ ] Character image filters apply correctly
- [ ] Wounded badges appear with correct messages
- [ ] Quest completion heals +1 HP
- [ ] HP cannot exceed max HP
- [ ] Notifications auto-dismiss at correct times
- [ ] Death animation plays
- [ ] Shake/pulse/flash animations work
- [ ] Mobile responsive design

## Troubleshooting

### HP not draining on skip
- Check `applyQuestMissPenalty` is imported
- Verify `updatedCharacter.hpLost` exists
- Check notification state update

### Death not triggering
- Verify `handleDeath` function exists
- Check `updatedCharacter.isDead` boolean
- Ensure setTimeout delay allows notification to show first

### Recovery mode not ending
- Check `checkRecoveryMode` logic
- Verify `recoveryEndTime` is set correctly
- Ensure useEffect is running

### Rewards not reduced during recovery
- Verify `calculateRewardModifier` is called
- Check multiplication order in reward calculation
- Confirm `character.inRecovery` is true

### Wounded visuals not showing
- Check `getWoundedState` import
- Verify CSS classes exist
- Ensure conditional rendering works
- Check character health percentage calculation

---

**Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Fully Implemented
