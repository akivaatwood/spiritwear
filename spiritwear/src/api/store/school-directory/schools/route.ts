import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCHOOL_DIRECTORY_MODULE } from "../../../../modules/school-directory"
import {
  hydrateOrganization,
  normalizeOrganizationType,
} from "../../../../modules/school-directory/organization-utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)

  const city_id = req.query.city_id as string | undefined
  const level = req.query.level as string | undefined
  const organization_type = req.query.organization_type as string | undefined

  const filters: Record<string, any> = { is_active: true }

  if (city_id) filters.city_id = city_id
  if (level) filters.level = level
  if (organization_type) {
    filters.organization_type = normalizeOrganizationType(organization_type)
  }

  const schools = await service.listSchools(filters, {
    order: { school_name: "ASC" },
  })

  const organizations = schools.map((school: any) => hydrateOrganization(school))

  res.json({ organizations, schools: organizations })
}
