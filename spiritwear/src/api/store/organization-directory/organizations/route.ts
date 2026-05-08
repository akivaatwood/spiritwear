import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORGANIZATION_DIRECTORY_MODULE } from "../../../../modules/school-directory"
import {
  hydrateGroup,
  hydrateOrganization,
  normalizeOrganizationType,
} from "../../../../modules/school-directory/organization-utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)

  const city_id = req.query.city_id as string | undefined
  const level = req.query.level as string | undefined
  const organization_type = req.query.organization_type as string | undefined

  const filters: Record<string, any> = { is_active: true }

  if (city_id) filters.city_id = city_id
  if (level) filters.level = level
  if (organization_type) {
    filters.organization_type = normalizeOrganizationType(organization_type)
  }

  const organizations = await service.listSchools(filters, {
    order: { school_name: "ASC" },
  })

  const hydratedOrganizations = await Promise.all(
    organizations.map(async (organization: any) => {
      const [mascots, teams] = await Promise.all([
        service.listSchoolMascots({ school_id: organization.id }),
        service.listSchoolTeams(
          { school_id: organization.id, is_active: true },
          { order: { team_name: "ASC" } }
        ),
      ])

      const groups = await Promise.all(
        teams.map(async (team: any) => {
          const [teamMascots, sports] = await Promise.all([
            service.listSchoolTeamMascots({ school_team_id: team.id }),
            service.listSports({ id: team.sport_id }),
          ])

          const primary_mascot =
            teamMascots.find((mascot: any) => mascot.is_primary) ||
            teamMascots[0] ||
            null

          return {
            ...hydrateGroup({
              ...team,
              mascots: teamMascots,
              sport: sports[0] || null,
            }),
            mascots: teamMascots,
            primary_mascot,
          }
        })
      )

      return {
        ...hydrateOrganization(organization),
        mascots,
        primary_mascot:
          mascots.find((mascot: any) => mascot.is_primary) || mascots[0] || null,
        groups,
        teams: groups,
      }
    })
  )

  res.json({
    organizations: hydratedOrganizations,
  })
}
