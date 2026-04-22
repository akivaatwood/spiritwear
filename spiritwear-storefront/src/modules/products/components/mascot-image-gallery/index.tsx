"use client"

import { useState } from "react"
import { useMascotOverlay } from "../mascot-overlay-provider"

type Props = {
    images: Array<{
        id?: string
        url: string
    }>
}

export default function MascotImageGallery({ images }: Props) {
    const { overlay } = useMascotOverlay()
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectedImage = images?.[selectedIndex]
    const isFrontImage = selectedIndex === 0

    return (
        <div className="w-full">
            <div className="relative flex items-center justify-center rounded bg-white">
                {selectedImage ? (
                    <img
                        src={selectedImage.url}
                        alt=""
                        className="w-full object-contain"
                    />
                ) : null}

                {isFrontImage && overlay.mascot?.image_url ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <img
                            src={overlay.mascot.image_url}
                            alt={overlay.mascot.mascot_name}
                            className="max-h-[70%] max-w-[70%] object-contain opacity-90"
                            style={{
                                transform: `translate(${overlay.offsetX}px, ${overlay.offsetY}px) scale(${overlay.scale})`,
                                transformOrigin: "center center",
                            }}
                        />
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
                            className={`rounded border p-1 ${selectedIndex === index ? "border-black" : "border-gray-300"
                                }`}
                        >
                            <img
                                src={image.url}
                                alt=""
                                className="h-16 w-16 object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}