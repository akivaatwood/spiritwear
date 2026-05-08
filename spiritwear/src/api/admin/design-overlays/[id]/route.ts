import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORGANIZATION_DIRECTORY_MODULE } from "../../../../modules/school-directory"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)
  const id = req.params.id

  const overlays = await service.listDesignOverlays({ id })
  if (!overlays.length) {
    return res.status(404).json({ message: "Design overlay not found" })
  }

  res.json({ design_overlay: overlays[0] })
}

export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)
  const id = req.params.id
  const body = req.body as Record<string, any>

  const overlays = await service.listDesignOverlays({ id })
  if (!overlays.length) {
    return res.status(404).json({ message: "Design overlay not found" })
  }

  const updates: Record<string, any> = {}
  const allowed = ["name", "slug", "image_url", "category", "is_active", "sort_order"]

  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key]
    }
  }

  if ("slug" in updates && updates.slug) {
    const normalizedSlug = String(updates.slug).trim().toLowerCase()
    const existing = await service.listDesignOverlays({ slug: normalizedSlug })

    if (existing.some((overlay: any) => overlay.id !== id)) {
      return res.status(409).json({
        message: "A design overlay with that slug already exists",
      })
    }

    updates.slug = normalizedSlug
  }

  await service.updateDesignOverlays([{ id, ...updates }])

  const refreshed = await service.listDesignOverlays({ id })
  res.json({ design_overlay: refreshed[0] })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)
  const id = req.params.id

  const overlays = await service.listDesignOverlays({ id })
  if (!overlays.length) {
    return res.status(404).json({ message: "Design overlay not found" })
  }

  await service.deleteDesignOverlays([id])

  res.json({ id, object: "design_overlay", deleted: true })
}
