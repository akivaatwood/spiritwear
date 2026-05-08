import {
  getCities as getOrganizationCities,
  getOrganization,
  getOrganizations,
  getStates as getOrganizationStates,
} from "./organization-directory"

export const getStates = getOrganizationStates
export const getCities = getOrganizationCities

export async function getSchools(cityId: string, level?: string) {
  const data = await getOrganizations(cityId, "school", level)
  return { schools: data.organizations || [] }
}

export async function getSchool(slug: string) {
  const data = await getOrganization(slug)
  return { school: data.organization }
}
