// Timeline event tracking system for hero's journey

export const addTimelineEvent = (userId, event) => {
  const timeline = getTimeline(userId)
  const newEvent = {
    ...event,
    id: Date.now(),
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  timeline.push(newEvent)
  localStorage.setItem(`timeline_${userId}`, JSON.stringify(timeline))
  return newEvent
}

export const getTimeline = (userId) => {
  const saved = localStorage.getItem(`timeline_${userId}`)
  if (!saved) {
    // Initialize with starting event
    const startEvent = {
      id: 0,
      type: 'start',
      level: 1,
      description: "Hero's journey begins",
      icon: '🌱',
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    }
    localStorage.setItem(`timeline_${userId}`, JSON.stringify([startEvent]))
    return [startEvent]
  }
  return JSON.parse(saved)
}

export const clearTimeline = (userId) => {
  localStorage.removeItem(`timeline_${userId}`)
}

export const getTimelineStats = (userId) => {
  const timeline = getTimeline(userId)
  return {
    totalEvents: timeline.length,
    levelUps: timeline.filter(e => e.type === 'level_up').length,
    achievements: timeline.filter(e => e.type === 'achievement').length,
    statMilestones: timeline.filter(e => e.type === 'stat_milestone').length,
    questMilestones: timeline.filter(e => e.type === 'milestone').length
  }
}
