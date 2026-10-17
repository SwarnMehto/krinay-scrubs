export type MetaPixelEventParams = Record<
  string,
  string | number | boolean | string[] | undefined
>;

type MetaPixelTrack = (
  command: "track",
  eventName: string,
  parameters?: MetaPixelEventParams,
) => void;

declare global {
  interface Window {
    fbq?: MetaPixelTrack;
  }
}

/**
 * Safely send a standard Meta Pixel event from client-side code.
 *
 * The base pixel is initialized in app/layout.tsx. This helper never
 * initializes it or duplicates the PageView event.
 *
 * Returns true only when fbq was available and the call was made.
 */
export function trackEvent(
  name: string,
  data?: MetaPixelEventParams,
): boolean {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return false;
  }

  try {
    window.fbq("track", name, data);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Meta Pixel] Event failed:", name, error);
    }
    return false;
  }
}
