# Class Switching System

## Overview
The class-switching system is entirely **stat-driven** and works on a **strict dominance rule**. Classes automatically switch based on which core stat exceeds the others by at least 10 points.

## Core Mechanics

### Stat Dominance Rule
At any point, whichever core stat exceeds the other two by **at least 10 points** automatically determines the user's active class:

- **Strength +10 dominance** → Warrior class
- **Intelligence +10 dominance** → Wizard class  
- **Agility +10 dominance** → Rogue class

### Switching Behavior
- **Automatic & Instant**: Class switches happen immediately when dominance threshold is met
- **No Negotiation**: The system forces the switch without player confirmation
- **Balanced Builds**: If no stat has +10 dominance, the system prevents switching and keeps current class
- **Dynamic Checks**: System checks stat deltas after every:
  - Quest completion
  - XP gain
  - Stat allocation
  - Level up

### Visual Updates
When a class switch occurs, the following update in real-time:
- Character sprite (level-appropriate image)
- Class badge and icon
- Class-specific color scheme
- Stat growth modifiers
- All UI elements tied to class

## The Ascendant Class

### Unlock Requirements
Permanently unlock Ascendant by achieving ALL of the following:
1. Reach **Level 7** in Warrior class
2. Reach **Level 7** in Wizard class
3. Reach **Level 7** in Rogue class
4. Max all stats (100+ in Strength, Intelligence, Agility, Charisma)

### Ascendant Behavior
- **Not Immune to Dominance Rule**: Even as Ascendant, stat dominance can still trigger switches
- **Default Form**: If no stat has dominance, stays in Ascendant form
- **Override Access**: Gives access to all classes, but eligibility is still stat-based
- **Permanent Unlock**: Once unlocked, never lost

## Class Progress Tracking

### What's Tracked
```javascript
{
  warrior: { maxLevel: 7, timePlayed: 0 },
  wizard: { maxLevel: 7, timePlayed: 0 },
  rogue: { maxLevel: 7, timePlayed: 0 },
  ascendant: { unlocked: true, timePlayed: 0 }
}
```

### Persistence
- Stored in localStorage: `classProgress_${userId}`
- Never resets
- Max level achieved is tracked per class
- Switching classes doesn't lose progress

## Timeline Logging

All class transitions are logged in the progression system:

### Class Switch Event
```javascript
{
  type: 'class_switch',
  level: currentLevel,
  description: 'Class switched to Warrior!',
  icon: '⚔️',
  details: 'Strength exceeded other stats by 10+'
}
```

### Ascendant Unlock Event
```javascript
{
  type: 'ascendant_unlock',
  level: currentLevel,
  description: 'Ascended to Transcendence!',
  icon: '✨',
  details: 'Achieved mastery in all classes. All stats perfected.'
}
```

## Notifications

### Class Switch Notification
- Displays old class → new class
- Shows reason for switch (stat dominance)
- Auto-dismisses after 6 seconds
- Animated with glow effects

### Ascendant Unlock Notification
- Special "ASCENDANT UNLOCKED" message
- Extended display time (8 seconds)
- Enhanced golden glow animation
- Celebratory presentation

## Character Images

### Dynamic Image Selection
Images are selected based on:
1. Current class (warrior/wizard/rogue/ascendant)
2. Current level (1-7)

Format: `{Class}_level{1-7}.png`
- Warrior: 7 progression sprites
- Wizard: 7 progression sprites  
- Rogue: 7 progression sprites
- Ascendant: Single transcendent sprite for all levels

### Image Path
`src/assets/Character levels/{Class}/{Class}_level{level}.png`

Special: `src/assets/Character levels/Ascendant.png`

## Example Scenarios

### Scenario 1: Warrior → Wizard
```
Initial: Strength 35, Intelligence 25, Agility 20
After quest: Strength 35, Intelligence 46, Agility 22
Result: Intelligence now 11 points above Strength → AUTO-SWITCH to Wizard
```

### Scenario 2: Balanced Build (No Switch)
```
Current: Strength 50, Intelligence 48, Agility 52
After quest: Strength 51, Intelligence 50, Agility 52
Result: Agility only 1 point ahead → NO SWITCH, stays current class
```

### Scenario 3: Ascendant Unlock
```
Classes: Warrior (Level 7), Wizard (Level 7), Rogue (Level 7)
Stats: Strength 105, Intelligence 102, Agility 101, Charisma 100
Result: All requirements met → UNLOCK ASCENDANT, auto-switch to Ascendant class
```

## Technical Implementation

### Key Functions

#### `calculateClassByStatDominance(stats, currentClass, isAscendant)`
Determines if stat dominance triggers a class switch.

Returns:
- `'warrior'` if Strength dominates
- `'wizard'` if Intelligence dominates
- `'rogue'` if Agility dominates
- `null` if no dominance (keep current)

#### `checkAscendantUnlock(character, classProgress)`
Checks if all requirements for Ascendant are met.

Returns: `boolean`

### State Management
```javascript
const [classProgress, setClassProgress] = useState({
  warrior: { maxLevel: 0, timePlayed: 0 },
  wizard: { maxLevel: 0, timePlayed: 0 },
  rogue: { maxLevel: 0, timePlayed: 0 },
  ascendant: { unlocked: false, timePlayed: 0 }
})
```

### localStorage Keys
- `character_${userId}` - Character data with current class
- `classProgress_${userId}` - Progress tracking for all classes
- `timeline_${userId}` - Event log including class switches

## Balance Considerations

### Preventing Rapid Switching
- 10-point threshold creates meaningful decision points
- Balanced builds are stable and don't ping-pong between classes
- Players can deliberately build toward specific class

### Reward Progression
- Each class has unique visual progression (7 levels)
- Mastering all three classes unlocks ultimate Ascendant form
- No progress is ever lost when switching

### Strategic Depth
- Players can focus stats to control their class
- OR embrace balanced approach and stick with starter class
- Ascendant serves as ultimate long-term goal
