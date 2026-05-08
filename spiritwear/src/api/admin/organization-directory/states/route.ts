import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORGANIZATION_DIRECTORY_MODULE } from "../../../../modules/school-directory"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)

  const states = await service.listStates(
    {},
    {
      order: { state_name: "ASC" },
    }
  )

  res.json({ states })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)

  const { country_code, state_code, state_name } = req.body as Record<string, any>

  if (!state_code || !state_name) {
    return res.status(400).json({
      message: "state_code and state_name are required",
    })
  }

  const [state] = await service.createStates([
    {
      country_code: country_code || "US",
      state_code: String(state_code).toUpperCase(),
      state_name,
      slug: slugify(state_name),
    },
  ])

  res.status(201).json({ state })
}
