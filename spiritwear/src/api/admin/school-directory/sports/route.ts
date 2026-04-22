import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCHOOL_DIRECTORY_MODULE } from "../../../../modules/school-directory"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)

  const sports = await service.listSports({}, {
    order: { sport_name: "ASC" },
  })

  res.json({ sports })
}
