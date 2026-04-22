import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCHOOL_DIRECTORY_MODULE } from "../../../../../modules/school-directory"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)
  const slug = req.params.slug

  const teams = await service.listSchoolTeams({ slug, is_active: true })

  if (!teams.length) {
    return res.status(404).json({ message: "Team not found" })
  }

  const team = teams[0]

  const [teamColors, teamMascots, sports, schools] = await Promise.all([
    service.listSchoolTeamColors({ school_team_id: team.id }, { order: { sort_order: "ASC" } }),
    service.listSchoolTeamMascots({ school_team_id: team.id }),
    service.listSports({ id: team.sport_id }),
    service.listSchools({ id: team.school_id }),
  ])

  res.json({
    team: {
      ...team,
      sport: sports[0] || null,
      school: schools[0] || null,
      colors: teamColors,
      mascots: teamMascots,
    },
  })
}
