import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORGANIZATION_DIRECTORY_MODULE } from "../../../../../modules/school-directory"
import {
  hydrateGroup,
  hydrateOrganization,
  normalizeOrganizationType,
} from "../../../../../modules/school-directory/organization-utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)
  const id = req.params.id

  const organizations = await service.listSchools({ id })

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
      { school_id: organization.id },
      { order: { team_name: "ASC" } }
    ),
  ])

  res.json({
    organization: {
      ...hydrateOrganization(organization),
      colors,
      mascots,
      groups: teams.map((team: any) => hydrateGroup(team)),
      teams: teams.map((team: any) => hydrateGroup(team)),
    },
  })
}

export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)
  const id = req.params.id
  const body = req.body as Record<string, any>

  const organizations = await service.listSchools({ id })
  if (!organizations.length) {
    return res.status(404).json({ message: "Organization not found" })
  }

  const updates: Record<string, any> = {}
  const allowed = [
    "city_id",
    "school_name",
    "organization_name",
    "organization_type",
    "slug",
    "level",
    "website_url",
    "primary_contact_email",
    "physical_address",
    "is_active",
  ]

  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key]
    }
  }

  const normalizedType = normalizeOrganizationType(
    updates.organization_type || organizations[0].organization_type
  )
  const normalizedName =
    updates.organization_name ||
    updates.school_name ||
    organizations[0].organization_name ||
    organizations[0].school_name

  updates.organization_type = normalizedType
  updates.organization_name = normalizedName
  updates.school_name = normalizedName

  if (normalizedType !== "school") {
    updates.level = null
  }

  await service.updateSchools([
    {
      id,
      ...updates,
    },
  ])

  if (Array.isArray(body.colors)) {
    const existingColors = await service.listSchoolColors({ school_id: id })
    if (existingColors.length) {
      await service.deleteSchoolColors(existingColors.map((c: any) => c.id))
    }

    const colorPayload = body.colors
      .filter((c: any) => c?.color_name)
      .map((c: any, index: number) => ({
        school_id: id,
        color_name: c.color_name,
        hex_value: c.hex_value || null,
        is_primary: !!c.is_primary,
        sort_order: Number.isFinite(c.sort_order) ? c.sort_order : index,
      }))

    if (colorPayload.length) {
      await service.createSchoolColors(colorPayload)
    }
  }

  if (Array.isArray(body.mascots)) {
    const existingMascots = await service.listSchoolMascots({ school_id: id })
    if (existingMascots.length) {
      await service.deleteSchoolMascots(existingMascots.map((m: any) => m.id))
    }

    const mascotPayload = body.mascots
      .filter((m: any) => m?.mascot_name)
      .map((m: any) => ({
        school_id: id,
        mascot_name: m.mascot_name,
        image_url: m.image_url || null,
        is_primary: !!m.is_primary,
        is_official: !!m.is_official,
      }))

    if (mascotPayload.length) {
      await service.createSchoolMascots(mascotPayload)
    }
  }

  const refreshed = await service.listSchools({ id })
  const [colors, mascots] = await Promise.all([
    service.listSchoolColors({ school_id: id }, { order: { sort_order: "ASC" } }),
    service.listSchoolMascots({ school_id: id }),
  ])

  res.json({
    organization: { ...hydrateOrganization(refreshed[0]), colors, mascots },
  })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)
  const id = req.params.id

  const organizations = await service.listSchools({ id })
  if (!organizations.length) {
    return res.status(404).json({ message: "Organization not found" })
  }

  const schoolTeams = await service.listSchoolTeams({ school_id: id })
  const schoolColors = await service.listSchoolColors({ school_id: id })
  const schoolMascots = await service.listSchoolMascots({ school_id: id })

  for (const team of schoolTeams) {
    const teamColors = await service.listSchoolTeamColors({ school_team_id: team.id })
    const teamMascots = await service.listSchoolTeamMascots({ school_team_id: team.id })

    if (teamColors.length) {
      await service.deleteSchoolTeamColors(teamColors.map((c: any) => c.id))
    }

    if (teamMascots.length) {
      await service.deleteSchoolTeamMascots(teamMascots.map((m: any) => m.id))
    }
  }

  if (schoolTeams.length) {
    await service.deleteSchoolTeams(schoolTeams.map((t: any) => t.id))
  }

  if (schoolColors.length) {
    await service.deleteSchoolColors(schoolColors.map((c: any) => c.id))
  }

  if (schoolMascots.length) {
    await service.deleteSchoolMascots(schoolMascots.map((m: any) => m.id))
  }

  await service.deleteSchools([id])

  res.json({ id, object: "organization", deleted: true })
}
