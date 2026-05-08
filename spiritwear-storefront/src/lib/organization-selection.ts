export type OrganizationType = "school" | "fire_department" | "police_department"

export type SelectedOrganization = {
  id: string
  organization_name: string
  school_name?: string
  slug: string
  organization_type: OrganizationType
  city_id?: string
  state_id?: string
  level?: string
}

const STORAGE_KEY = "spiritwear_selected_organization"
const LEGACY_STORAGE_KEY = "spiritwear_selected_school"
const COOKIE_KEY = "spiritwear_selected_organization"
const LEGACY_COOKIE_KEY = "spiritwear_selected_school"
const EVENT_NAME = "spiritwear:selected-organization-changed"

function normalizeSelection(
  value: Partial<SelectedOrganization> & { school_name?: string } | null
): SelectedOrganization | null {
  if (!value?.id || !value?.slug) {
    return null
  }

  return {
    id: value.id,
    organization_name: value.organization_name || value.school_name || "",
    school_name: value.organization_name || value.school_name || "",
    slug: value.slug,
    organization_type:
      value.organization_type === "fire_department" ||
      value.organization_type === "police_department"
        ? value.organization_type
        : "school",
    city_id: value.city_id,
    state_id: value.state_id,
    level: value.level,
  }
}

export function saveSelectedOrganization(organization: SelectedOrganization | null) {
  if (typeof window === "undefined") return

  if (!organization) {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    document.cookie = `${COOKIE_KEY}=; path=/; max-age=0`
    document.cookie = `${LEGACY_COOKIE_KEY}=; path=/; max-age=0`
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: null }))
    return
  }

  const normalized = normalizeSelection(organization)!
  const value = JSON.stringify(normalized)

  localStorage.setItem(STORAGE_KEY, value)
  localStorage.setItem(LEGACY_STORAGE_KEY, value)
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 30}`
  document.cookie = `${LEGACY_COOKIE_KEY}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 30}`

  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: normalized }))
}

export function loadSelectedOrganization(): SelectedOrganization | null {
  if (typeof window === "undefined") return null

  const fromStorage =
    localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
  if (fromStorage) {
    try {
      return normalizeSelection(JSON.parse(fromStorage))
    } catch {
      return null
    }
  }

  const cookieMatch =
    document.cookie.match(/(?:^|; )spiritwear_selected_organization=([^;]+)/) ||
    document.cookie.match(/(?:^|; )spiritwear_selected_school=([^;]+)/)

  if (cookieMatch?.[1]) {
    try {
      return normalizeSelection(JSON.parse(decodeURIComponent(cookieMatch[1])))
    } catch {
      return null
    }
  }

  return null
}

export function clearSelectedOrganization() {
  saveSelectedOrganization(null)
}

export function onSelectedOrganizationChange(
  callback: (organization: SelectedOrganization | null) => void
) {
  if (typeof window === "undefined") return () => {}

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<SelectedOrganization | null>
    callback(customEvent.detail ?? null)
  }

  const storageHandler = () => {
    callback(loadSelectedOrganization())
  }

  window.addEventListener(EVENT_NAME, handler)
  window.addEventListener("storage", storageHandler)

  return () => {
    window.removeEventListener(EVENT_NAME, handler)
    window.removeEventListener("storage", storageHandler)
  }
}
