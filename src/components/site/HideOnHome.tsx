'use client'

import { usePathname } from 'next/navigation'

/** Renders its children on every page except the home page. */
export const HideOnHome = ({ children }: { children: React.ReactNode }) => (usePathname() === '/' ? null : children)
