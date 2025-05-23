
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return true by default on server-side
  return isMobile === undefined ? true : isMobile
}

// Add a helper to get different values based on screen size
export function responsiveValue<T>(options: { mobile: T; desktop: T }): T {
  const isMobile = useIsMobile()
  return isMobile ? options.mobile : options.desktop
}
