'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/** Collapses the main navigation behind a menu button on small screens. */
export const NavToggle = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  return (
    <>
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
        Menu
      </button>
      <nav
        id="main-nav"
        aria-label="Main"
        className={`main-nav${open ? ' is-open' : ''}`}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) setOpen(false)
        }}
      >
        {children}
      </nav>
    </>
  )
}
