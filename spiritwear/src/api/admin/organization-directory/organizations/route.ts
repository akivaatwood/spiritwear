import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORGANIZATION_DIRECTORY_MODULE } from "../../../../modules/school-directory"
import {
  getOrganizationName,
  hydrateOrganization,
  normalizeOrganizationType,
} from "../../../../modules/school-directory/organization-utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)

  const city_id = req.query.city_id as string | undefined
  const level = req.query.level as string | undefined
  const organization_type = req.query.organization_type as string | undefined
  const q = (req.query.q as string | undefined)?.trim().toLowerCase()

  const filters: Record<string, any> = {}
  if (city_id) filters.city_id = city_id
  if (level) filters.level = level
  if (organization_type) {
    filters.organization_type = normalizeOrganizationType(organization_type)
  }

  let organizations = await service.listSchools(filters, {
    order: { school_name: "ASC" },
  })

  if (q) {
    organizations = organizations.filter((organization: any) =>
      String(getOrganizationName(organization)).toLowerCase().includes(q) ||
      String(organization.slug || "").toLowerCase().includes(q)
    )
  }

  const organizationsWithDetails = await Promise.all(
    organizations.map(async (organization: any) => {
      const [colors, mascots, cities] = await Promise.all([
        service.listSchoolColors(
          { school_id: organization.id },
          { order: { sort_order: "ASC" } }
        ),
        service.listSchoolMascots({ school_id: organization.id }),
        service.listCities({ id: organization.city_id }),
      ])

      return {
        ...hydrateOrganization(organization),
        colors,
        mascots,
        city: cities[0] || null,
      }
    })
  )

  res.json({ organizations: organizationsWithDetails })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(ORGANIZATION_DIRECTORY_MODULE)

  const body = req.body as Record<string, any>
  const {
    city_id,
    organization_name,
    school_name,
    organization_type,
    slug,
    level,
    website_url,
    primary_contact_email,
    physical_address,
    is_active,
    colors = [],
    mascots = [],
  } = body

  const normalizedType = normalizeOrganizationType(organization_type)
  const normalizedName = organization_name || school_name

  if (!city_id || !normalizedName || !slug) {
    return res.status(400).json({
      message: "city_id, organization_name, and slug are required",
    })
  }

  if (normalizedType === "school" && !level) {
    return res.status(400).json({
      message: "level is required for schools",
    })
  }

  const [organization] = await service.createSchools([
    {
      city_id,
      school_name: normalizedName,
      organization_name: normalizedName,
      organization_type: normalizedType,
      slug,
      level: normalizedType === "school" ? level : null,
      website_url: website_url || null,
      primary_contact_email: primary_contact_email || null,
      physical_address: physical_address || null,
      is_active: is_active !== false,
    },
  ])

  if (Array.isArray(colors) && colors.length) {
    const payload = colors
      .filter((c: any) => c?.color_name)
      .map((c: any, index: number) => ({
        school_id: organization.id,
        color_name: c.color_name,
        hex_value: c.hex_value || null,
        is_primary: !!c.is_primary,
        sort_order: Number.isFinite(c.sort_order) ? c.sort_order : index,
      }))

    if (payload.length) {
      await service.createSchoolColors(payload)
    }
  }

  if (Array.isArray(mascots) && mascots.length) {
    const payload = mascots
      .filter((m: any) => m?.mascot_name)
      .map((m: any) => ({
        school_id: organization.id,
        mascot_name: m.mascot_name,
        image_url: m.image_url || null,
        is_primary: !!m.is_primary,
        is_official: !!m.is_official,
      }))

    if (payload.length) {
      await service.createSchoolMascots(payload)
    }
  }

  res.status(201).json({ organization: hydrateOrganization(organization) })
}
