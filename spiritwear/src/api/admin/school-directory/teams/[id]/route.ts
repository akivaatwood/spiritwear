import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCHOOL_DIRECTORY_MODULE } from "../../../../../modules/school-directory"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)
    const id = req.params.id

    const teams = await service.listSchoolTeams({ id })

    if (!teams.length) {
        return res.status(404).json({ message: "Team not found" })
    }

    const team = teams[0]

    const [colors, mascots, sports] = await Promise.all([
        service.listSchoolTeamColors({ school_team_id: team.id }, { order: { sort_order: "ASC" } }),
        service.listSchoolTeamMascots({ school_team_id: team.id }),
        service.listSports({ id: team.sport_id }),
    ])

    res.json({
        team: {
            ...team,
            colors,
            mascots,
            sport: sports[0] || null,
        },
    })
}

export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
    const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)
    const id = req.params.id
    const body = req.body as Record<string, any>

    const teams = await service.listSchoolTeams({ id })
    if (!teams.length) {
        return res.status(404).json({ message: "Team not found" })
    }

    const updates: Record<string, any> = {}
    const allowed = [
        "sport_id",
        "team_name",
        "slug",
        "gender",
        "team_level",
        "is_active",
    ]

    for (const key of allowed) {
        if (key in body) {
            updates[key] = body[key]
        }
    }

    await service.updateSchoolTeams([
        {
            id,
            ...updates,
        },
    ])

    if (Array.isArray(body.colors)) {
        const existingColors = await service.listSchoolTeamColors({ school_team_id: id })
        if (existingColors.length) {
            await service.deleteSchoolTeamColors(existingColors.map((c: any) => c.id))
        }

        const colorPayload = body.colors
            .filter((c: any) => c?.color_name)
            .map((c: any, index: number) => ({
                school_team_id: id,
                color_name: c.color_name,
                hex_value: c.hex_value || null,
                is_primary: !!c.is_primary,
                sort_order: Number.isFinite(c.sort_order) ? c.sort_order : index,
            }))

        if (colorPayload.length) {
            await service.createSchoolTeamColors(colorPayload)
        }
    }

    if (Array.isArray(body.mascots)) {
        const existingMascots = await service.listSchoolTeamMascots({ school_team_id: id })
        if (existingMascots.length) {
            await service.deleteSchoolTeamMascots(existingMascots.map((m: any) => m.id))
        }

        const mascotPayload = body.mascots
            .filter((m: any) => m?.mascot_name)
            .map((m: any) => ({
                school_team_id: id,
                mascot_name: m.mascot_name,
                image_url: m.image_url || null,
                is_primary: !!m.is_primary,
                is_official: !!m.is_official,
            }))

        if (mascotPayload.length) {
            await service.createSchoolTeamMascots(mascotPayload)
        }
    }

    const refreshed = await service.listSchoolTeams({ id })
    const [colors, mascots, sports] = await Promise.all([
        service.listSchoolTeamColors({ school_team_id: id }, { order: { sort_order: "ASC" } }),
        service.listSchoolTeamMascots({ school_team_id: id }),
        service.listSports({ id: refreshed[0].sport_id }),
    ])

    res.json({
        team: {
            ...refreshed[0],
            colors,
            mascots,
            sport: sports[0] || null,
        },
    })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)
    const id = req.params.id

    const teams = await service.listSchoolTeams({ id })
    if (!teams.length) {
        return res.status(404).json({ message: "Team not found" })
    }

    const teamColors = await service.listSchoolTeamColors({ school_team_id: id })
    const teamMascots = await service.listSchoolTeamMascots({ school_team_id: id })

    if (teamColors.length) {
        await service.deleteSchoolTeamColors(teamColors.map((c: any) => c.id))
    }

    if (teamMascots.length) {
        await service.deleteSchoolTeamMascots(teamMascots.map((m: any) => m.id))
    }

    await service.deleteSchoolTeams([id])

    res.json({ id, object: "team", deleted: true })
}