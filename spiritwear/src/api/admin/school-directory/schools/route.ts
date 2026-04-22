import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCHOOL_DIRECTORY_MODULE } from "../../../../modules/school-directory"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)

  const city_id = req.query.city_id as string | undefined
  const level = req.query.level as string | undefined
  const q = (req.query.q as string | undefined)?.trim().toLowerCase()

  const filters: Record<string, any> = {}
  if (city_id) filters.city_id = city_id
  if (level) filters.level = level

  let schools = await service.listSchools(filters, {
    order: { school_name: "ASC" },
  })

  if (q) {
    schools = schools.filter((school: any) =>
      String(school.school_name || "").toLowerCase().includes(q) ||
      String(school.slug || "").toLowerCase().includes(q)
    )
  }

  const schoolsWithDetails = await Promise.all(
    schools.map(async (school: any) => {
      const [colors, mascots, cities] = await Promise.all([
        service.listSchoolColors({ school_id: school.id }, { order: { sort_order: "ASC" } }),
        service.listSchoolMascots({ school_id: school.id }),
        service.listCities({ id: school.city_id }),
      ])

      return {
        ...school,
        colors,
        mascots,
        city: cities[0] || null,
      }
    })
  )

  res.json({ schools: schoolsWithDetails })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(SCHOOL_DIRECTORY_MODULE)

  const body = req.body as Record<string, any>
  const {
    city_id,
    school_name,
    slug,
    level,
    website_url,
    primary_contact_email,
    physical_address,
    is_active,
    colors = [],
    mascots = [],
  } = body

  if (!city_id || !school_name || !slug || !level) {
    return res.status(400).json({
      message: "city_id, school_name, slug, and level are required",
    })
  }

  const [school] = await service.createSchools([
    {
      city_id,
      school_name,
      slug,
      level,
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
        school_id: school.id,
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
        school_id: school.id,
        mascot_name: m.mascot_name,
        image_url: m.image_url || null,
        is_primary: !!m.is_primary,
        is_official: !!m.is_official,
      }))

    if (payload.length) {
      await service.createSchoolMascots(payload)
    }
  }

  res.status(201).json({ school })
}
