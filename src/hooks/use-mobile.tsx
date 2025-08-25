import * as React from "react";

const MOBILE_BREAKPOINT = 768;

// This hook now returns `null` on the first render to prevent a mismatch between
// the server/initial render and the client-side render.
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Set the value on mount
    setIsMobile(mql.matches);

    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Listen for changes
    mql.addEventListener("change", handleMediaChange);

    // Cleanup
    return () => {
      mql.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return isMobile;
}