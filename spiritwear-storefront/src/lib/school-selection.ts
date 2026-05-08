import {
  clearSelectedOrganization,
  loadSelectedOrganization,
  onSelectedOrganizationChange,
  saveSelectedOrganization,
  type SelectedOrganization,
} from "./organization-selection"

export type SelectedSchool = SelectedOrganization & {
  school_name: string
}

export const saveSelectedSchool = saveSelectedOrganization
export const loadSelectedSchool = () => loadSelectedOrganization() as SelectedSchool | null
export const clearSelectedSchool = clearSelectedOrganization
export const onSelectedSchoolChange = (
  callback: (school: SelectedSchool | null) => void
) => onSelectedOrganizationChange((organization) => callback(organization as SelectedSchool | null))
