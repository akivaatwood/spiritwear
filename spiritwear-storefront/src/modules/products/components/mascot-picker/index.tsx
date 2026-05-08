"use client"

import {
  mascotOverlayConstants,
  useMascotOverlay,
} from "../mascot-overlay-provider"
import { useOverlayOptions } from "../overlay-options"

export default function MascotPicker() {
  const {
    currentSide,
    activeSide,
    overlayLibrary,
    setScale,
    moveLeft,
    moveRight,
    moveUp,
    moveDown,
    resetTransform,
    setTextValue,
    clearText,
    setTextScale,
    setTextColor,
    moveTextLeft,
    moveTextRight,
    moveTextUp,
    moveTextDown,
    resetTextTransform,
  } = useMascotOverlay()

  const { organizationName, overlays, loading } = useOverlayOptions(overlayLibrary)

  const sideLabel = activeSide === "front" ? "Front" : "Back"
  const overlayTitle =
    overlayLibrary === "design"
      ? "Pre-designed Overlays"
      : `Mascots ${organizationName ? `for ${organizationName}` : ""}`

  return (
    <div className="mt-8 border-t pt-6">
      <div className="mb-4 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
        Editing {sideLabel} image. Select the first product image to edit the
        front or the second product image to edit the back.
      </div>

      <h3 className="mb-2 text-base font-semibold">{overlayTitle}</h3>

      {loading ? (
        <div className="mt-6 text-sm text-gray-500">Loading overlays...</div>
      ) : currentSide.imageOverlay ? (
        <div className="rounded border p-3">
          <div className="flex items-start gap-4">
            <div className="flex w-28 shrink-0 flex-col items-center">
              <div className="mb-2 flex h-24 w-24 items-center justify-center rounded bg-white">
                <img
                  src={currentSide.imageOverlay.image_url}
                  alt={currentSide.imageOverlay.overlay_name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="mb-2 text-center text-sm font-medium">
                {currentSide.imageOverlay.overlay_name}
              </div>

              {currentSide.imageOverlay.source_label ? (
                <div className="mb-2 text-center text-xs text-gray-500">
                  {currentSide.imageOverlay.source_label}
                </div>
              ) : null}
            </div>

            <div className="flex-1">
              <div className="grid gap-3">
                <div className="text-sm font-medium">
                  {sideLabel} Overlay Controls
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setScale(
                        currentSide.scale - mascotOverlayConstants.SCALE_STEP
                      )
                    }
                    className="rounded border px-3 py-2 text-sm"
                  >
                    Scale -
                  </button>

                  <div className="min-w-[90px] text-sm">
                    {currentSide.scale.toFixed(2)}x
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setScale(
                        currentSide.scale + mascotOverlayConstants.SCALE_STEP
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
                    X:{currentSide.offsetX}
                    <br />
                    Y:{currentSide.offsetY}
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
            </div>
          </div>
        </div>
      ) : overlays.length ? (
        <div className="rounded border border-dashed px-3 py-4 text-sm text-gray-500">
          Select an available image below the product thumbnails to place it on
          the {sideLabel.toLowerCase()}.
        </div>
      ) : (
        <div className="text-sm text-gray-500">
          {overlayLibrary === "design"
            ? "No pre-designed overlays are available yet."
            : "No mascot images are available for the selected organization."}
        </div>
      )}

      <div className="mt-8 border-t pt-6">
        <h3 className="mb-2 text-base font-semibold">
          Text Overlay for {sideLabel}
        </h3>

        <div className="grid gap-3 rounded border p-3">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Overlay Text</span>
            <input
              type="text"
              value={currentSide.text?.value ?? ""}
              onChange={(event) => setTextValue(event.target.value)}
              placeholder={`Enter text for the ${sideLabel.toLowerCase()} image`}
              className="rounded border px-3 py-2"
            />
          </label>

          {currentSide.text ? (
            <>
              <label className="grid gap-2 text-sm">
                <span className="font-medium">Text Color</span>
                <input
                  type="color"
                  value={
                    currentSide.text.color ||
                    mascotOverlayConstants.DEFAULT_TEXT_COLOR
                  }
                  onChange={(event) => setTextColor(event.target.value)}
                  className="h-10 w-16 cursor-pointer rounded border bg-white p-1"
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setTextScale(
                      currentSide.text!.scale - mascotOverlayConstants.SCALE_STEP
                    )
                  }
                  className="rounded border px-3 py-2 text-sm"
                >
                  Text Scale -
                </button>

                <div className="min-w-[90px] text-sm">
                  {currentSide.text.scale.toFixed(2)}x
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setTextScale(
                      currentSide.text!.scale + mascotOverlayConstants.SCALE_STEP
                    )
                  }
                  className="rounded border px-3 py-2 text-sm"
                >
                  Text Scale +
                </button>

                <button
                  type="button"
                  onClick={resetTextTransform}
                  className="rounded border px-3 py-2 text-sm"
                >
                  Reset Text
                </button>

                <button
                  type="button"
                  onClick={clearText}
                  className="rounded border px-3 py-2 text-sm"
                >
                  Remove Text
                </button>
              </div>

              <div className="grid max-w-[220px] grid-cols-3 gap-2">
                <div />
                <button
                  type="button"
                  onClick={moveTextUp}
                  className="rounded border px-3 py-2 text-sm"
                >
                  Up
                </button>
                <div />

                <button
                  type="button"
                  onClick={moveTextLeft}
                  className="rounded border px-3 py-2 text-sm"
                >
                  Left
                </button>
                <div className="flex items-center justify-center text-xs text-gray-500">
                  X:{currentSide.text.offsetX}
                  <br />
                  Y:{currentSide.text.offsetY}
                </div>
                <button
                  type="button"
                  onClick={moveTextRight}
                  className="rounded border px-3 py-2 text-sm"
                >
                  Right
                </button>

                <div />
                <button
                  type="button"
                  onClick={moveTextDown}
                  className="rounded border px-3 py-2 text-sm"
                >
                  Down
                </button>
                <div />
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">
              Add text to enable text placement and size controls for the{" "}
              {sideLabel.toLowerCase()} image.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
