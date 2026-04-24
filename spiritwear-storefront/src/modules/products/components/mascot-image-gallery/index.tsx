"use client"

import { useEffect, useRef, useState } from "react"
import {
  OverlaySide,
  mascotOverlayConstants,
  useMascotOverlay,
} from "../mascot-overlay-provider"

type Props = {
  images: Array<{
    id?: string
    url: string
  }>
}

type DragTarget = "mascot" | "text"

type DragState = {
  target: DragTarget
  side: OverlaySide
  startX: number
  startY: number
  startOffsetX: number
  startOffsetY: number
}

function getSideForIndex(index: number): OverlaySide | null {
  if (index === 0) return "front"
  if (index === 1) return "back"
  return null
}

export default function MascotImageGallery({ images }: Props) {
  const {
    overlay,
    setActiveSide,
    setOffset,
    setScale,
    setTextOffset,
    setTextScale,
  } = useMascotOverlay()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const overlayImageRef = useRef<HTMLImageElement | null>(null)
  const textOverlayRef = useRef<HTMLDivElement | null>(null)

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
      const deltaX = event.clientX - dragState.startX
      const deltaY = event.clientY - dragState.startY

      setActiveSide(dragState.side)

      if (dragState.target === "mascot") {
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

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", stopDragging)
    }
  }, [dragState, setActiveSide, setOffset, setTextOffset])

  useEffect(() => {
    setDragState(null)
  }, [selectedIndex, selectedSideState?.mascot?.image_url, selectedSideState?.text?.value])

  useEffect(() => {
    const overlayImage = overlayImageRef.current

    if (!overlayImage || !selectedSide || !selectedSideState?.mascot?.image_url) {
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
    selectedSideState?.mascot?.image_url,
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
      target: "mascot",
      side: selectedSide,
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
      startX: event.clientX,
      startY: event.clientY,
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

        {selectedSide && selectedSideState?.mascot?.image_url ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <img
              src={selectedSideState.mascot.image_url}
              alt={selectedSideState.mascot.mascot_name}
              className={`max-h-[70%] max-w-[70%] object-contain opacity-90 ${
                dragState?.target === "mascot" ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{
                transform: `translate(${selectedSideState.offsetX}px, ${selectedSideState.offsetY}px) scale(${selectedSideState.scale})`,
                transformOrigin: "center center",
                pointerEvents: "auto",
                userSelect: "none",
              }}
              ref={overlayImageRef}
              draggable={false}
              onMouseDown={startMascotDragging}
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
              }}
              onMouseDown={startTextDragging}
            >
              {selectedSideState.text.value}
            </div>
          </div>
        ) : null}
      </div>

      {!!images?.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {images.map((image, index) => (
            <button
              key={image.id || image.url || index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`rounded border p-1 ${
                selectedIndex === index ? "border-black" : "border-gray-300"
              }`}
            >
              <img src={image.url} alt="" className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
