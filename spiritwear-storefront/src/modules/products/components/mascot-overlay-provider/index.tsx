"use client"

import { createContext, useContext, useMemo, useState } from "react"

export type OverlayLibrary = "organization" | "design"
export type OverlayType = "mascot" | "design"

export type ImageOverlay = {
  overlay_type: OverlayType
  overlay_name: string
  image_url: string
  source_id?: string
  source_label?: string | null
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
  imageOverlay: ImageOverlay | null
  scale: number
  offsetX: number
  offsetY: number
  text: TextOverlay | null
}

type MascotOverlayState = {
  activeSide: OverlaySide
  overlayLibrary: OverlayLibrary
  sides: Record<OverlaySide, SideOverlayState>
}

type MascotOverlayContextType = {
  overlay: MascotOverlayState
  currentSide: SideOverlayState
  activeSide: OverlaySide
  overlayLibrary: OverlayLibrary
  setOverlayLibrary: (library: OverlayLibrary) => void
  setActiveSide: (side: OverlaySide) => void
  isSelected: (imageOverlay: ImageOverlay | null) => boolean
  selectOverlay: (imageOverlay: ImageOverlay | null) => void
  toggleOverlay: (imageOverlay: ImageOverlay | null) => void
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
    imageOverlay: null,
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
    overlayLibrary: "organization",
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
      overlayLibrary: overlay.overlayLibrary,

      setOverlayLibrary: (library) => {
        setOverlay((prev) => {
          if (prev.overlayLibrary === library) {
            return prev
          }

          return {
            ...prev,
            overlayLibrary: library,
          }
        })
      },

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

      isSelected: (imageOverlay) => {
        if (!imageOverlay || !currentSide.imageOverlay) return false

        return (
          currentSide.imageOverlay.overlay_type === imageOverlay.overlay_type &&
          currentSide.imageOverlay.overlay_name === imageOverlay.overlay_name &&
          currentSide.imageOverlay.image_url === imageOverlay.image_url
        )
      },

      selectOverlay: (imageOverlay) => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => ({
            ...side,
            imageOverlay,
            scale: DEFAULT_SCALE,
            offsetX: DEFAULT_OFFSET_X,
            offsetY: DEFAULT_OFFSET_Y,
          }))
        )
      },

      toggleOverlay: (imageOverlay) => {
        setOverlay((prev) =>
          updateActiveSide(prev, (side) => {
            if (
              imageOverlay &&
              side.imageOverlay &&
              side.imageOverlay.overlay_type === imageOverlay.overlay_type &&
              side.imageOverlay.overlay_name === imageOverlay.overlay_name &&
              side.imageOverlay.image_url === imageOverlay.image_url
            ) {
              return {
                ...side,
                imageOverlay: null,
                scale: DEFAULT_SCALE,
                offsetX: DEFAULT_OFFSET_X,
                offsetY: DEFAULT_OFFSET_Y,
              }
            }

            return {
              ...side,
              imageOverlay,
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

          if (side.imageOverlay) {
            metadata[`${prefix}_overlay_type`] = side.imageOverlay.overlay_type
            metadata[`${prefix}_overlay_name`] = side.imageOverlay.overlay_name
            metadata[`${prefix}_overlay_image_url`] = side.imageOverlay.image_url
            metadata[`${prefix}_overlay_source_id`] =
              side.imageOverlay.source_id || null
            metadata[`${prefix}_overlay_source_label`] =
              side.imageOverlay.source_label || null
            metadata[`${prefix}_overlay_scale`] = side.scale
            metadata[`${prefix}_overlay_offset_x`] = side.offsetX
            metadata[`${prefix}_overlay_offset_y`] = side.offsetY

            if (side.imageOverlay.overlay_type === "mascot") {
              metadata[`${prefix}_mascot_name`] = side.imageOverlay.overlay_name
              metadata[`${prefix}_mascot_image_url`] = side.imageOverlay.image_url
              metadata[`${prefix}_mascot_scale`] = side.scale
              metadata[`${prefix}_mascot_offset_x`] = side.offsetX
              metadata[`${prefix}_mascot_offset_y`] = side.offsetY
            }

            if (side.imageOverlay.overlay_type === "design") {
              metadata[`${prefix}_design_overlay_name`] =
                side.imageOverlay.overlay_name
              metadata[`${prefix}_design_overlay_image_url`] =
                side.imageOverlay.image_url
            }
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
