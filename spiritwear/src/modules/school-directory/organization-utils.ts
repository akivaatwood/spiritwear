export const ORGANIZATION_TYPES = [
  "school",
  "fire_department",
  "police_department",
] as const

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number]

export function normalizeOrganizationType(value?: string | null): OrganizationType {
  if (value === "fire_department" || value === "police_department") {
    return value
  }

  return "school"
}

export function getOrganizationName(record: Record<string, any>) {
  return record.organization_name || record.school_name || ""
}

export function getOrganizationTypeLabel(type?: string | null) {
  switch (normalizeOrganizationType(type)) {
    case "fire_department":
      return "Fire Department"
    case "police_department":
      return "Police Department"
    default:
      return "School"
  }
}

export function hydrateOrganization(record: Record<string, any>) {
  const organization_name = getOrganizationName(record)
  const organization_type = normalizeOrganizationType(record.organization_type)

  return {
    ...record,
    organization_name,
    organization_type,
    school_name: record.school_name || organization_name,
  }
}

export function hydrateGroup(record: Record<string, any>) {
  const group_name = record.group_name || record.team_name || ""
  const activity_name = record.activity_name || record.sport?.sport_name || null

  return {
    ...record,
    group_name,
    team_name: record.team_name || group_name,
    activity_name,
  }
}
