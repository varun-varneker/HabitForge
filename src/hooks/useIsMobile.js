import { useState, useEffect } from 'react'

/**
 * Hook to detect if the current viewport is mobile size
 * @param {number} breakpoint - Max width to consider as mobile (default: 968px)
 * @returns {boolean} - True if viewport is mobile size
 */
export function useIsMobile(breakpoint = 968) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= breakpoint)
    }

    checkMobile()

    // Listen for resize
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  return isMobile
}

/**
 * Hook to detect if the device has touch capabilities
 * @returns {boolean} - True if device supports touch
 */
export function useIsTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}
