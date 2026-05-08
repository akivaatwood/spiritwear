import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORGANIZATION_DIRECTORY_MODULE } from "../../../../modules/school-directory"

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
