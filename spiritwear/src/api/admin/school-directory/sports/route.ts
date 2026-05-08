import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCHOOL_DIRECTORY_MODULE } from "../../../../modules/school-directory"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)

  const sports = await service.listSports({}, {
    order: { sport_name: "ASC" },
  })

  res.json({ sports })
}

function slugifySportName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)

  const { sport_name, slug, is_active } = req.body as Record<string, any>

  if (!sport_name || !String(sport_name).trim()) {
    return res.status(400).json({
      message: "sport_name is required",
    })
  }

  const normalizedSlug = String(slug || "")
    .trim()
    .toLowerCase() || slugifySportName(String(sport_name))

  if (!normalizedSlug) {
    return res.status(400).json({
      message: "A valid slug could not be generated for this sport",
    })
  }

  const existing = await service.listSports(
    { slug: normalizedSlug },
    { take: 1 }
  )

  if (existing.length) {
    return res.status(409).json({
      message: "A sport with that slug already exists",
    })
  }

  const [sport] = await service.createSports([
    {
      sport_name: String(sport_name).trim(),
      slug: normalizedSlug,
      is_active: is_active !== false,
    },
  ])

  res.status(201).json({ sport })
}
