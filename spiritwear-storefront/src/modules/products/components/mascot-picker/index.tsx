"use client"

import { useEffect, useState } from "react"
import {
  mascotOverlayConstants,
  useMascotOverlay,
} from "../mascot-overlay-provider"
import {
  loadSelectedSchool,
  onSelectedSchoolChange,
} from "../../../../lib/school-selection"

type Mascot = {
  id?: string
  mascot_name: string
  image_url: string
}

type SelectedSchool = {
  id: string
  school_name: string
  slug: string
}

export default function MascotPicker() {
  const {
    overlay,
    isSelected,
    toggleMascot,
    setScale,
    moveLeft,
    moveRight,
    moveUp,
    moveDown,
    resetTransform,
    selectMascot,
  } = useMascotOverlay()

  const [schoolName, setSchoolName] = useState("")
  const [mascots, setMascots] = useState<Mascot[]>([])
  const [loading, setLoading] = useState(true)

  async function loadMascotsForSchool(selectedSchool: SelectedSchool | null) {
    try {
      if (!selectedSchool?.slug) {
        setSchoolName("")
        setMascots([])
        selectMascot(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setSchoolName(selectedSchool.school_name)

      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

      const res = await fetch(
        `${backendUrl}/store/school-directory/schools/${encodeURIComponent(
          selectedSchool.slug
        )}`,
        {
          headers: {
            "x-publishable-api-key": publishableKey || "",
          },
        }
      )

      if (!res.ok) {
        throw new Error("Failed to fetch school mascots")
      }

      const data = await res.json()
      const schoolMascots = (data.school?.mascots || []).filter(
        (m: Mascot) => !!m.image_url
      )

      setMascots(schoolMascots)

      const currentMascotStillExists = schoolMascots.some(
        (m: Mascot) =>
          overlay.mascot &&
          m.mascot_name === overlay.mascot.mascot_name &&
          m.image_url === overlay.mascot.image_url
      )

      if (!currentMascotStillExists) {
        selectMascot(null)
      }
    } catch (e) {
      console.error(e)
      setSchoolName("")
      setMascots([])
      selectMascot(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMascotsForSchool(loadSelectedSchool())

    const unsubscribe = onSelectedSchoolChange((school) => {
      loadMascotsForSchool(school)
    })

    return unsubscribe
  }, [])

  if (loading) {
    return <div className="mt-6 text-sm text-gray-500">Loading mascots...</div>
  }

  if (!mascots.length) {
    return (
      <div className="mt-6 text-sm text-gray-500">
        No mascot images available for the selected school.
      </div>
    )
  }

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="mb-2 text-base font-semibold">
        Mascots {schoolName ? `for ${schoolName}` : ""}
      </h3>

      <div className="space-y-4">
        {mascots.map((mascot) => {
          const active = isSelected({
            mascot_name: mascot.mascot_name,
            image_url: mascot.image_url,
          })

          return (
            <div
              key={`${mascot.mascot_name}-${mascot.image_url}`}
              className="flex items-start gap-4 rounded border p-3"
            >
              <div className="flex w-28 shrink-0 flex-col items-center">
                <div className="mb-2 flex h-24 w-24 items-center justify-center rounded bg-white">
                  <img
                    src={mascot.image_url}
                    alt={mascot.mascot_name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="mb-2 text-center text-sm font-medium">
                  {mascot.mascot_name}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleMascot({
                      mascot_name: mascot.mascot_name,
                      image_url: mascot.image_url,
                    })
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                >
                  {active ? "Remove Overlay" : "Overlay on Product"}
                </button>
              </div>

              <div className="flex-1">
                {active ? (
                  <div className="grid gap-3">
                    <div className="text-sm font-medium">Overlay Controls</div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setScale(
                            overlay.scale - mascotOverlayConstants.SCALE_STEP
                          )
                        }
                        className="rounded border px-3 py-2 text-sm"
                      >
                        Scale -
                      </button>

                      <div className="min-w-[90px] text-sm">
                        {overlay.scale.toFixed(2)}x
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setScale(
                            overlay.scale + mascotOverlayConstants.SCALE_STEP
                          )
                        }
                        className="rounded border px-3 py-2 text-sm"
                      >
                        Scale +
                      </button>

                      <button
                        type="button"
                        onClick={resetTransform}
                        className="rounded border px-3 py-2 text-sm"
                      >
                        Reset
                      </button>
                    </div>

                    <div className="grid max-w-[220px] grid-cols-3 gap-2">
                      <div />
                      <button
                        type="button"
                        onClick={moveUp}
                        className="rounded border px-3 py-2 text-sm"
                      >
                        Up
                      </button>
                      <div />

                      <button
                        type="button"
                        onClick={moveLeft}
                        className="rounded border px-3 py-2 text-sm"
                      >
                        Left
                      </button>
                      <div className="flex items-center justify-center text-xs text-gray-500">
                        X:{overlay.offsetX}
                        <br />
                        Y:{overlay.offsetY}
                      </div>
                      <button
                        type="button"
                        onClick={moveRight}
                        className="rounded border px-3 py-2 text-sm"
                      >
                        Right
                      </button>

                      <div />
                      <button
                        type="button"
                        onClick={moveDown}
                        className="rounded border px-3 py-2 text-sm"
                      >
                        Down
                      </button>
                      <div />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Turn on this mascot overlay to reveal scale and position controls.
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}