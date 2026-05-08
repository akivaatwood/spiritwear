"use client"

import { useEffect, useState } from "react"
import { ImageOverlay, OverlayLibrary } from "./mascot-overlay-provider"
import {
  loadSelectedOrganization,
  onSelectedOrganizationChange,
  SelectedOrganization,
} from "../../../lib/organization-selection"

export type OverlayOption = ImageOverlay

function dedupeOverlays(overlays: OverlayOption[]) {
  const seen = new Set<string>()

  return overlays.filter((overlay) => {
    const key = `${overlay.overlay_type}::${overlay.overlay_name}::${overlay.image_url}`
    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

async function fetchOverlayOptions(
  overlayLibrary: OverlayLibrary,
  selectedOrganization: SelectedOrganization | null
) {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  if (overlayLibrary === "design") {
    const res = await fetch(`${backendUrl}/store/design-overlays`, {
      headers: {
        "x-publishable-api-key": publishableKey || "",
      },
    })

    if (!res.ok) {
      throw new Error("Failed to fetch design overlays")
    }

    const data = await res.json()
    const designOverlays = ((data.design_overlays || []) as any[])
      .filter((overlay) => !!overlay.image_url)
      .map((overlay) => ({
        overlay_type: "design" as const,
        overlay_name: overlay.name,
        image_url: overlay.image_url,
        source_id: overlay.id,
        source_label: overlay.category || "Pre-designed overlay",
      }))

    return {
      organizationName: "",
      overlays: dedupeOverlays(designOverlays),
    }
  }

  if (!selectedOrganization?.slug) {
    return {
      organizationName: "",
      overlays: [],
    }
  }

  const res = await fetch(
    `${backendUrl}/store/organization-directory/organizations/${encodeURIComponent(
      selectedOrganization.slug
    )}`,
    {
      headers: {
        "x-publishable-api-key": publishableKey || "",
      },
    }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch organization overlays")
  }

  const data = await res.json()
  const organizationOverlays = ((data.organization?.mascots || []) as any[])
    .filter((overlay) => !!overlay.image_url)
    .map((overlay) => ({
      overlay_type: "mascot" as const,
      overlay_name: overlay.mascot_name,
      image_url: overlay.image_url,
      source_id: overlay.id,
      source_label: data.organization?.organization_name || "Organization",
    }))

  const groupOverlays = ((data.organization?.groups || []) as any[]).flatMap(
    (group) =>
      ((group.mascots || []) as any[])
        .filter((overlay) => !!overlay.image_url)
        .map((overlay) => ({
          overlay_type: "mascot" as const,
          overlay_name: overlay.mascot_name,
          image_url: overlay.image_url,
          source_id: overlay.id,
          source_label:
            group.group_name || group.team_name
              ? [group.group_name || group.team_name, group.activity_name]
                  .filter(Boolean)
                  .join(" - ")
              : "Group",
        }))
  )

  return {
    organizationName: data.organization?.organization_name || "",
    overlays: dedupeOverlays([...organizationOverlays, ...groupOverlays]),
  }
}

export function useOverlayOptions(overlayLibrary: OverlayLibrary) {
  const [organizationName, setOrganizationName] = useState("")
  const [overlays, setOverlays] = useState<OverlayOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const load = async (selectedOrganization: SelectedOrganization | null) => {
      try {
        setLoading(true)
        const result = await fetchOverlayOptions(
          overlayLibrary,
          selectedOrganization
        )

        if (!isMounted) {
          return
        }

        setOrganizationName(result.organizationName)
        setOverlays(result.overlays)
      } catch (e) {
        console.error(e)

        if (!isMounted) {
          return
        }

        setOrganizationName("")
        setOverlays([])
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load(loadSelectedOrganization())

    const unsubscribe = onSelectedOrganizationChange((organization) => {
      if (overlayLibrary === "organization") {
        load(organization)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [overlayLibrary])

  return { organizationName, overlays, loading }
}
