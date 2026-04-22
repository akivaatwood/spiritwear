"use client"

import { createContext, useContext, useMemo, useState } from "react"

export type MascotOverlay = {
  mascot_name: string
  image_url: string
}

type MascotOverlayState = {
  mascot: MascotOverlay | null
  scale: number
  offsetX: number
  offsetY: number
}

type MascotOverlayContextType = {
  overlay: MascotOverlayState
  isSelected: (mascot: MascotOverlay | null) => boolean
  selectMascot: (mascot: MascotOverlay | null) => void
  toggleMascot: (mascot: MascotOverlay | null) => void
  setScale: (value: number) => void
  moveLeft: () => void
  moveRight: () => void
  moveUp: () => void
  moveDown: () => void
  resetTransform: () => void
  getLineItemMetadata: () => Record<string, any>
}

const MascotOverlayContext = createContext<MascotOverlayContextType | null>(null)

const DEFAULT_SCALE = 1
const DEFAULT_OFFSET_X = 0
const DEFAULT_OFFSET_Y = 0
const STEP = 10
const MIN_SCALE = 0.2
const MAX_SCALE = 3

export const mascotOverlayConstants = {
  DEFAULT_SCALE,
  DEFAULT_OFFSET_X,
  DEFAULT_OFFSET_Y,
  STEP,
  MIN_SCALE,
  MAX_SCALE,
  SCALE_STEP: 0.1,
}

export function MascotOverlayProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [overlay, setOverlay] = useState<MascotOverlayState>({
    mascot: null,
    scale: DEFAULT_SCALE,
    offsetX: DEFAULT_OFFSET_X,
    offsetY: DEFAULT_OFFSET_Y,
  })

  const value = useMemo<MascotOverlayContextType>(
    () => ({
      overlay,

      isSelected: (mascot) => {
        if (!mascot || !overlay.mascot) return false

        return (
          overlay.mascot.mascot_name === mascot.mascot_name &&
          overlay.mascot.image_url === mascot.image_url
        )
      },

      selectMascot: (mascot) => {
        setOverlay({
          mascot,
          scale: DEFAULT_SCALE,
          offsetX: DEFAULT_OFFSET_X,
          offsetY: DEFAULT_OFFSET_Y,
        })
      },

      toggleMascot: (mascot) => {
        setOverlay((prev) => {
          if (
            mascot &&
            prev.mascot &&
            prev.mascot.mascot_name === mascot.mascot_name &&
            prev.mascot.image_url === mascot.image_url
          ) {
            return {
              mascot: null,
              scale: DEFAULT_SCALE,
              offsetX: DEFAULT_OFFSET_X,
              offsetY: DEFAULT_OFFSET_Y,
            }
          }

          return {
            mascot,
            scale: DEFAULT_SCALE,
            offsetX: DEFAULT_OFFSET_X,
            offsetY: DEFAULT_OFFSET_Y,
          }
        })
      },

      setScale: (value) => {
        setOverlay((prev) => ({
          ...prev,
          scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, value)),
        }))
      },

      moveLeft: () => {
        setOverlay((prev) => ({
          ...prev,
          offsetX: prev.offsetX - STEP,
        }))
      },

      moveRight: () => {
        setOverlay((prev) => ({
          ...prev,
          offsetX: prev.offsetX + STEP,
        }))
      },

      moveUp: () => {
        setOverlay((prev) => ({
          ...prev,
          offsetY: prev.offsetY - STEP,
        }))
      },

      moveDown: () => {
        setOverlay((prev) => ({
          ...prev,
          offsetY: prev.offsetY + STEP,
        }))
      },

      resetTransform: () => {
        setOverlay((prev) => ({
          ...prev,
          scale: DEFAULT_SCALE,
          offsetX: DEFAULT_OFFSET_X,
          offsetY: DEFAULT_OFFSET_Y,
        }))
      },

      getLineItemMetadata: () => {
        if (!overlay.mascot) return {}

        return {
          mascot_name: overlay.mascot.mascot_name,
          mascot_image_url: overlay.mascot.image_url,
          mascot_scale: overlay.scale,
          mascot_offset_x: overlay.offsetX,
          mascot_offset_y: overlay.offsetY,
        }
      },
    }),
    [overlay]
  )

  return (
    <MascotOverlayContext.Provider value={value}>
      {children}
    </MascotOverlayContext.Provider>
  )
}

export function useMascotOverlay() {
  const ctx = useContext(MascotOverlayContext)

  if (!ctx) {
    throw new Error("useMascotOverlay must be used inside MascotOverlayProvider")
  }

  return ctx
}