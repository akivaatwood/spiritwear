import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORGANIZATION_DIRECTORY_MODULE } from "../../../modules/school-directory"

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)
  const q = (req.query.q as string | undefined)?.trim().toLowerCase()

  let overlays = await service.listDesignOverlays(
    {},
    { order: { sort_order: "ASC", name: "ASC" } }
  )

  if (q) {
    overlays = overlays.filter((overlay: any) => {
      return (
        String(overlay.name || "")
          .toLowerCase()
          .includes(q) ||
        String(overlay.slug || "")
          .toLowerCase()
          .includes(q) ||
        String(overlay.category || "")
          .toLowerCase()
          .includes(q)
      )
    })
  }

  res.json({ design_overlays: overlays })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)
  const body = req.body as Record<string, any>
  const name = String(body.name || "").trim()
  const slug = String(body.slug || "").trim().toLowerCase() || slugify(name)

  if (!name) {
    return res.status(400).json({ message: "name is required" })
  }

  if (!slug) {
    return res
      .status(400)
      .json({ message: "A valid slug is required for the design overlay" })
  }

  const existing = await service.listDesignOverlays({ slug }, { take: 1 })
  if (existing.length) {
    return res.status(409).json({
      message: "A design overlay with that slug already exists",
    })
  }

  const [designOverlay] = await service.createDesignOverlays([
    {
      name,
      slug,
      image_url: body.image_url || null,
      category: body.category || null,
      is_active: body.is_active !== false,
      sort_order: Number.isFinite(body.sort_order) ? body.sort_order : 0,
    },
  ])

  res.status(201).json({ design_overlay: designOverlay })
}
