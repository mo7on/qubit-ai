'use client';

import { ModeToggle } from "./ModeToggle";

/**
 * ClientModeToggle Component
 * 
 * A client-side wrapper for the ModeToggle component.
 * This wrapper ensures the component is only rendered on the client side,
 * preventing hydration mismatches in Next.js server components.
 * 
 * @component
 */
export function ClientModeToggle() {
  return <ModeToggle />;
}