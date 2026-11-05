"use client"

import "lenis/dist/lenis.css"

import { ReactLenis } from "lenis/react"
import { useReducedMotion } from "motion/react"

const LENIS_OPTIONS = {
  lerp: 0.1,
  anchors: true,
  allowNestedScroll: true,
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) return children

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      {children}
    </ReactLenis>
  )
}
