"use client"

import { useEffect, useRef, useState } from "react"
import {
  OverlaySide,
  mascotOverlayConstants,
  useMascotOverlay,
} from "../mascot-overlay-provider"
import { useOverlayOptions } from "../overlay-options"

type Props = {
  images: Array<{
    id?: string
    url: string
  }>
}

type DragTarget = "overlay" | "text"

type DragState = {
  target: DragTarget
  side: OverlaySide
  mode: "drag" | "pinch"
  startX: number
  startY: number
  startOffsetX: number
  startOffsetY: number
  startScale?: number
  startDistance?: number
}

function getSideForIndex(index: number): OverlaySide | null {
  if (index === 0) return "front"
  if (index === 1) return "back"
  return null
}

function getTouchDistance(touches: TouchList) {
  if (touches.length < 2) {
    return 0
  }

  const first = touches[0]
  const second = touches[1]

  return Math.hypot(
    second.clientX - first.clientX,
    second.clientY - first.clientY
  )
}

export default function MascotImageGallery({ images }: Props) {
  const {
    overlay,
    overlayLibrary,
    setActiveSide,
    isSelected,
    toggleOverlay,
    setOffset,
    setScale,
    setTextOffset,
    setTextScale,
  } = useMascotOverlay()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const overlayImageRef = useRef<HTMLImageElement | null>(null)
  const textOverlayRef = useRef<HTMLDivElement | null>(null)
  const { overlays, loading } = useOverlayOptions(overlayLibrary)

  const selectedImage = images?.[selectedIndex]
  const selectedSide = getSideForIndex(selectedIndex)
  const selectedSideState = selectedSide ? overlay.sides[selectedSide] : null

  useEffect(() => {
    if (selectedSide) {
      setActiveSide(selectedSide)
    }
  }, [selectedSide, setActiveSide])

  useEffect(() => {
    if (!dragState) return

    const handleMouseMove = (event: MouseEvent) => {
      if (dragState.mode !== "drag") {
        return
      }

      const deltaX = event.clientX - dragState.startX
      const deltaY = event.clientY - dragState.startY

      setActiveSide(dragState.side)

      if (dragState.target === "overlay") {
        setOffset(dragState.startOffsetX + deltaX, dragState.startOffsetY + deltaY)
        return
      }

      setTextOffset(
        dragState.startOffsetX + deltaX,
        dragState.startOffsetY + deltaY
      )
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (dragState.mode === "pinch" && event.touches.length >= 2) {
        if (
          typeof dragState.startScale === "undefined" ||
          typeof dragState.startDistance === "undefined" ||
          !dragState.startDistance
        ) {
          return
        }

        event.preventDefault()

        const distance = getTouchDistance(event.touches)
        const nextScale =
          dragState.startScale * (distance / dragState.startDistance)

        setActiveSide(dragState.side)

        if (dragState.target === "overlay") {
          setScale(nextScale)
          return
        }

        setTextScale(nextScale)
        return
      }

      const touch = event.touches[0]

      if (!touch) {
        return
      }

      event.preventDefault()

      if (dragState.mode !== "drag") {
        return
      }

      const deltaX = touch.clientX - dragState.startX
      const deltaY = touch.clientY - dragState.startY

      setActiveSide(dragState.side)

      if (dragState.target === "overlay") {
        setOffset(dragState.startOffsetX + deltaX, dragState.startOffsetY + deltaY)
        return
      }

      setTextOffset(
        dragState.startOffsetX + deltaX,
        dragState.startOffsetY + deltaY
      )
    }

    const stopDragging = () => {
      setDragState(null)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", stopDragging)
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", stopDragging)
    window.addEventListener("touchcancel", stopDragging)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", stopDragging)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", stopDragging)
      window.removeEventListener("touchcancel", stopDragging)
    }
  }, [dragState, setActiveSide, setOffset, setScale, setTextOffset, setTextScale])

  useEffect(() => {
    setDragState(null)
  }, [selectedIndex, selectedSideState?.imageOverlay?.image_url, selectedSideState?.text?.value])

  useEffect(() => {
    const overlayImage = overlayImageRef.current

    if (!overlayImage || !selectedSide || !selectedSideState?.imageOverlay?.image_url) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      event.stopPropagation()

      setActiveSide(selectedSide)

      const direction = event.deltaY < 0 ? 1 : -1
      setScale(selectedSideState.scale + direction * mascotOverlayConstants.SCALE_STEP)
    }

    overlayImage.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      overlayImage.removeEventListener("wheel", handleWheel)
    }
  }, [
    selectedSide,
    selectedSideState?.imageOverlay?.image_url,
    selectedSideState?.scale,
    setActiveSide,
    setScale,
  ])

  useEffect(() => {
    const textOverlay = textOverlayRef.current

    if (!textOverlay || !selectedSide || !selectedSideState?.text?.value.trim()) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      event.stopPropagation()

      setActiveSide(selectedSide)

      const direction = event.deltaY < 0 ? 1 : -1
      setTextScale(
        selectedSideState.text!.scale +
          direction * mascotOverlayConstants.SCALE_STEP
      )
    }

    textOverlay.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      textOverlay.removeEventListener("wheel", handleWheel)
    }
  }, [
    selectedSide,
    selectedSideState?.text,
    setActiveSide,
    setTextScale,
  ])

  const startMascotDragging = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!selectedSide || !selectedSideState) {
      return
    }

    event.preventDefault()
    setActiveSide(selectedSide)

    setDragState({
      target: "overlay",
      side: selectedSide,
      mode: "drag",
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: selectedSideState.offsetX,
      startOffsetY: selectedSideState.offsetY,
    })
  }

  const startTextDragging = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedSide || !selectedSideState?.text) {
      return
    }

    event.preventDefault()
    setActiveSide(selectedSide)

    setDragState({
      target: "text",
      side: selectedSide,
      mode: "drag",
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: selectedSideState.text.offsetX,
      startOffsetY: selectedSideState.text.offsetY,
    })
  }

  const startMascotTouchDragging = (event: React.TouchEvent<HTMLImageElement>) => {
    if (!selectedSide || !selectedSideState) {
      return
    }

    if (event.touches.length >= 2) {
      event.preventDefault()
      setActiveSide(selectedSide)

      setDragState({
        target: "overlay",
        side: selectedSide,
        mode: "pinch",
        startX: 0,
        startY: 0,
        startOffsetX: selectedSideState.offsetX,
        startOffsetY: selectedSideState.offsetY,
        startScale: selectedSideState.scale,
        startDistance: getTouchDistance(event.touches),
      })
      return
    }

    const touch = event.touches[0]

    if (!touch) {
      return
    }

    event.preventDefault()
    setActiveSide(selectedSide)

    setDragState({
      target: "overlay",
      side: selectedSide,
      mode: "drag",
      startX: touch.clientX,
      startY: touch.clientY,
      startOffsetX: selectedSideState.offsetX,
      startOffsetY: selectedSideState.offsetY,
    })
  }

  const startTextTouchDragging = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!selectedSide || !selectedSideState?.text) {
      return
    }

    if (event.touches.length >= 2) {
      event.preventDefault()
      setActiveSide(selectedSide)

      setDragState({
        target: "text",
        side: selectedSide,
        mode: "pinch",
        startX: 0,
        startY: 0,
        startOffsetX: selectedSideState.text.offsetX,
        startOffsetY: selectedSideState.text.offsetY,
        startScale: selectedSideState.text.scale,
        startDistance: getTouchDistance(event.touches),
      })
      return
    }

    const touch = event.touches[0]

    if (!touch) {
      return
    }

    event.preventDefault()
    setActiveSide(selectedSide)

    setDragState({
      target: "text",
      side: selectedSide,
      mode: "drag",
      startX: touch.clientX,
      startY: touch.clientY,
      startOffsetX: selectedSideState.text.offsetX,
      startOffsetY: selectedSideState.text.offsetY,
    })
  }

  return (
    <div className="w-full">
      <div className="relative flex items-center justify-center rounded bg-white">
        {selectedImage ? (
          <img src={selectedImage.url} alt="" className="w-full object-contain" />
        ) : null}

        {selectedSide && selectedSideState?.imageOverlay?.image_url ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <img
              src={selectedSideState.imageOverlay.image_url}
              alt={selectedSideState.imageOverlay.overlay_name}
              className={`max-h-[70%] max-w-[70%] object-contain opacity-90 ${
                dragState?.target === "overlay" ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{
                transform: `translate(${selectedSideState.offsetX}px, ${selectedSideState.offsetY}px) scale(${selectedSideState.scale})`,
                transformOrigin: "center center",
                pointerEvents: "auto",
                userSelect: "none",
                touchAction: "none",
              }}
              ref={overlayImageRef}
              draggable={false}
              onMouseDown={startMascotDragging}
              onTouchStart={startMascotTouchDragging}
            />
          </div>
        ) : null}

        {selectedSide && selectedSideState?.text?.value.trim() ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              ref={textOverlayRef}
              className={`select-none whitespace-pre-wrap px-2 py-1 text-center font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.65)] ${
                dragState?.target === "text" ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{
                transform: `translate(${selectedSideState.text.offsetX}px, ${selectedSideState.text.offsetY}px) scale(${selectedSideState.text.scale})`,
                transformOrigin: "center center",
                pointerEvents: "auto",
                userSelect: "none",
                fontSize: "clamp(24px, 4vw, 48px)",
                lineHeight: 1.1,
                maxWidth: "70%",
                color:
                  selectedSideState.text.color ||
                  mascotOverlayConstants.DEFAULT_TEXT_COLOR,
                touchAction: "none",
              }}
              onMouseDown={startTextDragging}
              onTouchStart={startTextTouchDragging}
            >
              {selectedSideState.text.value}
            </div>
          </div>
        ) : null}
      </div>

      {!!images?.length && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id || image.url || index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`shrink-0 rounded border p-1 ${
                selectedIndex === index ? "border-black" : "border-gray-300"
              }`}
            >
              <img src={image.url} alt="" className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 border-t pt-4">
        <div className="mb-3 text-sm font-medium">
          Available {overlayLibrary === "design" ? "Overlays" : "Mascots"}
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading image choices...</div>
        ) : overlays.length ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {overlays.map((overlayOption) => {
              const active = isSelected(overlayOption)

              return (
                <button
                  key={`${overlayOption.overlay_type}-${overlayOption.overlay_name}-${overlayOption.image_url}`}
                  type="button"
                  onClick={() => toggleOverlay(overlayOption)}
                  className={`flex w-24 shrink-0 items-center justify-center rounded border bg-white p-2 ${
                    active ? "border-black bg-gray-50" : "border-gray-300"
                  }`}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded bg-white">
                    <img
                      src={overlayOption.image_url}
                      alt={overlayOption.overlay_name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            {overlayLibrary === "design"
              ? "No pre-designed overlays are available yet."
              : "No mascot images are available for the selected organization."}
          </div>
        )}
      </div>
    </div>
  )
}
