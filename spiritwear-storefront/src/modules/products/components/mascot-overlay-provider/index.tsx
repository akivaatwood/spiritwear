"use client"

import { createContext, useContext, useMemo, useState } from "react"

export type MascotOverlay = {
  mascot_name: string
  image_url: string
}

export type TextOverlay = {
  value: string
  scale: number
  offsetX: number
  offsetY: number
  color: string
}

export type OverlaySide = "front" | "back"

type SideOverlayState = {
  mascot: MascotOverlay | null
  scale: number
  offsetX: number
  offsetY: number
  text: TextOverlay | null
}

type MascotOverlayState = {
  activeSide: OverlaySide
  sides: Record<OverlaySide, SideOverlayState>
}

type MascotOverlayContextType = {
  overlay: MascotOverlayState
  currentSide: SideOverlayState
  activeSide: OverlaySide
  setActiveSide: (side: OverlaySide) => void
  isSelected: (mascot: MascotOverlay | null) => boolean
  selectMascot: (mascot: MascotOverlay | null) => void
  toggleMascot: (mascot: MascotOverlay | null) => void
  setScale: (value: number) => void
  setOffset: (offsetX: number, offsetY: number) => void
  moveLeft: () => void
  moveRight: () => void
  moveUp: () => void
  moveDown: () => void
  resetTransform: () => void
  setTextValue: (value: string) => void
  clearText: () => void
  setTextScale: (value: number) => void
  setTextOffset: (offsetX: number, offsetY: number) => void
  setTextColor: (value: string) => void
  moveTextLeft: () => void
  moveTextRight: () => void
  moveTextUp: () => void
  moveTextDown: () => void
  resetTextTransform: () => void
  getLineItemMetadata: () => Record<string, any>
}

const MascotOverlayContext = createContext<MascotOverlayContextType | null>(null)

const DEFAULT_SCALE = 1
const DEFAULT_OFFSET_X = 0
const DEFAULT_OFFSET_Y = 0
const DEFAULT_TEXT_COLOR = "#ffffff"
const STEP = 10
const MIN_SCALE = 0.2
const MAX_SCALE = 3

export const mascotOverlayConstants = {
  DEFAULT_SCALE,
  DEFAULT_OFFSET_X,
  DEFAULT_OFFSET_Y,
  DEFAULT_TEXT_COLOR,
  STEP,
  MIN_SCALE,
  MAX_SCALE,
  SCALE_STEP: 0.1,
}

function createEmptySideState(): SideOverlayState {
  return {
    mascot: null,
    scale: DEFAULT_SCALE,
    offsetX: DEFAULT_OFFSET_X,
    offsetY: DEFAULT_OFFSET_Y,
    text: null,
  }
}

function updateActiveSide(
  prev: MascotOverlayState,
  updater: (side: SideOverlayState) => SideOverlayState
): MascotOverlayState {
  return {
    ...prev,
    sides: {
      ...prev.sides,
      [prev.activeSide]: updater(prev.sides[prev.activeSide]),
    },
  }
}

export function MascotOverlayProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [overlay, setOverlay] = useState<MascotOverlayState>({
    activeSide: "front",
    sides: {
      front: createEmptySideState(),
      back: createEmptySideState(),
    },
  })

  const currentSide = overlay.sides[overlay.activeSide]

  const value = useMemo<MascotOverlayContextType>(
    () => ({
      overlay,
      currentSide,
      activeSide: overlay.activeSide,

      setActiveSide: (side) => {
        setOverlay((prev) => {
          if (prev.activeSide === side) {
            return prev
          }

          return {
            ...prev,
            activeSide: side,
          }
        })
      },

      isSelected: (mascot) => {
        if (!mascot || !currentSide.mascot) return false

        return (
          currentSide.mascot.mascot_name === mascot.mascot_name &&
          currentSide.mascot.image_url === mascot.image_url
        )
      },

      selectMascot: (mascot) => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => ({
            ...side,
            mascot,
            scale: DEFAULT_SCALE,
            offsetX: DEFAULT_OFFSET_X,
            offsetY: DEFAULT_OFFSET_Y,
          }))
        )
      },

      toggleMascot: (mascot) => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => {
            if (
              mascot &&
              side.mascot &&
              side.mascot.mascot_name === mascot.mascot_name &&
              side.mascot.image_url === mascot.image_url
            ) {
              return {
                ...side,
                mascot: null,
                scale: DEFAULT_SCALE,
                offsetX: DEFAULT_OFFSET_X,
                offsetY: DEFAULT_OFFSET_Y,
              }
            }

            return {
              ...side,
              mascot,
              scale: DEFAULT_SCALE,
              offsetX: DEFAULT_OFFSET_X,
              offsetY: DEFAULT_OFFSET_Y,
            }
          })
        )
      },

      setScale: (value) => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => ({
            ...side,
            scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, value)),
          }))
        )
      },

      setOffset: (offsetX, offsetY) => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => ({
            ...side,
            offsetX,
            offsetY,
          }))
        )
      },

      moveLeft: () => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => ({
            ...side,
            offsetX: side.offsetX - STEP,
          }))
        )
      },

      moveRight: () => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => ({
            ...side,
            offsetX: side.offsetX + STEP,
          }))
        )
      },

      moveUp: () => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => ({
            ...side,
            offsetY: side.offsetY - STEP,
          }))
        )
      },

      moveDown: () => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => ({
            ...side,
            offsetY: side.offsetY + STEP,
          }))
        )
      },

      resetTransform: () => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => ({
            ...side,
            scale: DEFAULT_SCALE,
            offsetX: DEFAULT_OFFSET_X,
            offsetY: DEFAULT_OFFSET_Y,
          }))
        )
      },

      setTextValue: (value) => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => {
            const trimmedValue = value.trim()

            if (!trimmedValue) {
              return {
                ...side,
                text: null,
              }
            }

            return {
              ...side,
              text: {
                value,
                scale: side.text?.scale ?? DEFAULT_SCALE,
                offsetX: side.text?.offsetX ?? DEFAULT_OFFSET_X,
                offsetY: side.text?.offsetY ?? DEFAULT_OFFSET_Y,
                color: side.text?.color ?? DEFAULT_TEXT_COLOR,
              },
            }
          })
        )
      },

      clearText: () => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => ({
            ...side,
            text: null,
          }))
        )
      },

      setTextScale: (value) => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => {
            if (!side.text) {
              return side
            }

            return {
              ...side,
              text: {
                ...side.text,
                scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, value)),
              },
            }
          })
        )
      },

      setTextOffset: (offsetX, offsetY) => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => {
            if (!side.text) {
              return side
            }

            return {
              ...side,
              text: {
                ...side.text,
                offsetX,
                offsetY,
              },
            }
          })
        )
      },

      setTextColor: (value) => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => {
            if (!side.text) {
              return side
            }

            return {
              ...side,
              text: {
                ...side.text,
                color: value,
              },
            }
          })
        )
      },

      moveTextLeft: () => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => {
            if (!side.text) {
              return side
            }

            return {
              ...side,
              text: {
                ...side.text,
                offsetX: side.text.offsetX - STEP,
              },
            }
          })
        )
      },

      moveTextRight: () => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => {
            if (!side.text) {
              return side
            }

            return {
              ...side,
              text: {
                ...side.text,
                offsetX: side.text.offsetX + STEP,
              },
            }
          })
        )
      },

      moveTextUp: () => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => {
            if (!side.text) {
              return side
            }

            return {
              ...side,
              text: {
                ...side.text,
                offsetY: side.text.offsetY - STEP,
              },
            }
          })
        )
      },

      moveTextDown: () => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => {
            if (!side.text) {
              return side
            }

            return {
              ...side,
              text: {
                ...side.text,
                offsetY: side.text.offsetY + STEP,
              },
            }
          })
        )
      },

      resetTextTransform: () => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => {
            if (!side.text) {
              return side
            }

            return {
              ...side,
              text: {
                ...side.text,
                scale: DEFAULT_SCALE,
                offsetX: DEFAULT_OFFSET_X,
                offsetY: DEFAULT_OFFSET_Y,
              },
            }
          })
        )
      },

      getLineItemMetadata: () => {
        const metadata: Record<string, any> = {}

        ;(["front", "back"] as OverlaySide[]).forEach((sideName) => {
          const side = overlay.sides[sideName]
          const prefix = sideName === "front" ? "front" : "back"

          if (side.mascot) {
            metadata[`${prefix}_mascot_name`] = side.mascot.mascot_name
            metadata[`${prefix}_mascot_image_url`] = side.mascot.image_url
            metadata[`${prefix}_mascot_scale`] = side.scale
            metadata[`${prefix}_mascot_offset_x`] = side.offsetX
            metadata[`${prefix}_mascot_offset_y`] = side.offsetY
          }

          if (side.text?.value.trim()) {
            metadata[`${prefix}_overlay_text`] = side.text.value
            metadata[`${prefix}_overlay_text_scale`] = side.text.scale
            metadata[`${prefix}_overlay_text_offset_x`] = side.text.offsetX
            metadata[`${prefix}_overlay_text_offset_y`] = side.text.offsetY
            metadata[`${prefix}_overlay_text_color`] = side.text.color
          }
        })

        return metadata
      },
    }),
    [currentSide, overlay]
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
