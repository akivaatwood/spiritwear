import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORGANIZATION_DIRECTORY_MODULE } from "../../../../../modules/school-directory"
import {
  hydrateGroup,
  hydrateOrganization,
} from "../../../../../modules/school-directory/organization-utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)
  const slug = req.params.slug

  const organizations = await service.listSchools({ slug })

  if (!organizations.length) {
    return res.status(404).json({ message: "Organization not found" })
  }

  const organization = organizations[0]

  const [colors, mascots, teams] = await Promise.all([
    service.listSchoolColors(
      { school_id: organization.id },
      { order: { sort_order: "ASC" } }
    ),
    service.listSchoolMascots({ school_id: organization.id }),
    service.listSchoolTeams(
      { school_id: organization.id, is_active: true },
      { order: { team_name: "ASC" } }
    ),
  ])

  const groups = await Promise.all(
    teams.map(async (team: any) => {
      const [teamColors, teamMascots, sports] = await Promise.all([
        service.listSchoolTeamColors(
          { school_team_id: team.id },
          { order: { sort_order: "ASC" } }
        ),
        service.listSchoolTeamMascots({ school_team_id: team.id }),
        service.listSports({ id: team.sport_id }),
      ])

      return hydrateGroup({
        ...team,
        sport: sports[0] || null,
        colors: teamColors,
        mascots: teamMascots,
      })
    })
  )

  res.json({
    organization: {
      ...hydrateOrganization(organization),
      colors,
      mascots,
      groups,
      teams: groups,
    },
  })
}
