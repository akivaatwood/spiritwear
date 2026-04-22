import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCHOOL_DIRECTORY_MODULE } from "../../../../modules/school-directory"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)
  const state_id = req.query.state_id as string | undefined

  const filters: Record<string, any> = {}
  if (state_id) filters.state_id = state_id

  const cities = await service.listCities(filters, {
    order: { city_name: "ASC" },
  })

  res.json({ cities })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)

  const { state_id, city_name } = req.body as Record<string, any>

  if (!state_id || !city_name) {
    return res.status(400).json({
      message: "state_id and city_name are required",
    })
  }

  const [city] = await service.createCities([
    {
      state_id,
      city_name,
      slug: slugify(city_name),
    },
  ])

  res.status(201).json({ city })
}