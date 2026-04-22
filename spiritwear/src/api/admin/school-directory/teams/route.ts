import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCHOOL_DIRECTORY_MODULE } from "../../../../modules/school-directory"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)
    const school_id = req.query.school_id as string | undefined

    const filters: Record<string, any> = {}
    if (school_id) filters.school_id = school_id

    const teams = await service.listSchoolTeams(filters, {
        order: { team_name: "ASC" },
    })

    const hydrated = await Promise.all(
        teams.map(async (team: any) => {
            const [colors, mascots, sports] = await Promise.all([
                service.listSchoolTeamColors({ school_team_id: team.id }, { order: { sort_order: "ASC" } }),
                service.listSchoolTeamMascots({ school_team_id: team.id }),
                service.listSports({ id: team.sport_id }),
            ])

            return {
                ...team,
                colors,
                mascots,
                sport: sports[0] || null,
            }
        })
    )

    res.json({ teams: hydrated })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)

    const {
        school_id,
        sport_id,
        team_name,
        slug,
        gender,
        team_level,
        is_active,
        colors = [],
        mascots = [],
    } = req.body as Record<string, any>

    if (!school_id || !sport_id || !team_name || !slug) {
        return res.status(400).json({
            message: "school_id, sport_id, team_name, and slug are required",
        })
    }

    const [team] = await service.createSchoolTeams([
        {
            school_id,
            sport_id,
            team_name,
            slug,
            gender: gender || null,
            team_level: team_level || null,
            is_active: is_active !== false,
        },
    ])

    if (Array.isArray(colors) && colors.length) {
        const payload = colors
            .filter((c: any) => c?.color_name)
            .map((c: any, index: number) => ({
                school_team_id: team.id,
                color_name: c.color_name,
                hex_value: c.hex_value || null,
                is_primary: !!c.is_primary,
                sort_order: Number.isFinite(c.sort_order) ? c.sort_order : index,
            }))

        if (payload.length) {
            await service.createSchoolTeamColors(payload)
        }
    }

    if (Array.isArray(mascots) && mascots.length) {
        const payload = mascots
            .filter((m: any) => m?.mascot_name)
            .map((m: any) => ({
                school_team_id: team.id,
                mascot_name: m.mascot_name,
                image_url: m.image_url || null,
                is_primary: !!m.is_primary,
                is_official: !!m.is_official,
            }))

        if (payload.length) {
            await service.createSchoolTeamMascots(payload)
        }
    }

    res.status(201).json({ team })
}