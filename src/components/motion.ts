// Shared motion and layout constants for the landing page.

// Signature ease-out curve used by every scroll/entrance animation.
export const STANDARD_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Standard whileInView trigger: animate once, at 15% visibility.
export const VIEWPORT_ONCE = { once: true, amount: 0.15 } as const;

// Tailwind's `md` breakpoint. Kept in rem so matchMedia checks stay in sync
// with `md:` utilities even when the browser's root font size is not 16px.
export const DESKTOP_BREAKPOINT = "48rem";
