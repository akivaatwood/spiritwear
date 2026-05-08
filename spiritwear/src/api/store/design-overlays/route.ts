import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORGANIZATION_DIRECTORY_MODULE } from "../../../modules/school-directory"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)

  const designOverlays = await service.listDesignOverlays(
    { is_active: true },
    { order: { sort_order: "ASC", name: "ASC" } }
  )

  res.json({ design_overlays: designOverlays })
}
