import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCHOOL_DIRECTORY_MODULE } from "../../../../../modules/school-directory"
import {
  hydrateGroup,
  hydrateOrganization,
} from "../../../../../modules/school-directory/organization-utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)
  const slug = req.params.slug

  const schools = await service.listSchools({ slug })

  if (!schools.length) {
    return res.status(404).json({ message: "School not found" })
  }

  const school = schools[0]

  const [colors, mascots, teams] = await Promise.all([
    service.listSchoolColors({ school_id: school.id }, { order: { sort_order: "ASC" } }),
    service.listSchoolMascots({ school_id: school.id }),
    service.listSchoolTeams({ school_id: school.id, is_active: true }, { order: { team_name: "ASC" } }),
  ])

  const teamsWithDetails = await Promise.all(
    teams.map(async (team: any) => {
      const [teamColors, teamMascots, sports] = await Promise.all([
        service.listSchoolTeamColors({ school_team_id: team.id }, { order: { sort_order: "ASC" } }),
        service.listSchoolTeamMascots({ school_team_id: team.id }),
        service.listSports({ id: team.sport_id }),
      ])

      return {
        ...team,
        sport: sports[0] || null,
        colors: teamColors,
        mascots: teamMascots,
      }
    })
  )

  const organization = hydrateOrganization(school)
  const groups = teamsWithDetails.map((team) => hydrateGroup(team))

  res.json({
    organization: {
      ...organization,
      colors,
      mascots,
      groups,
      teams: groups,
    },
    school: {
      ...organization,
      colors,
      mascots,
      teams: groups,
    },
  })
}
