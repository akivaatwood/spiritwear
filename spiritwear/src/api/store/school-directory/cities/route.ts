import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCHOOL_DIRECTORY_MODULE } from "../../../../modules/school-directory"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)
  const state_id = req.query.state_id as string | undefined

  if (!state_id) {
    return res.status(400).json({ message: "state_id is required" })
  }

  const cities = await service.listCities(
    { state_id },
    { order: { city_name: "ASC" } }
  )

  res.json({ cities })
}
