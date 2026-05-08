"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  clearSelectedOrganization,
  loadSelectedOrganization,
  onSelectedOrganizationChange,
  saveSelectedOrganization,
  SelectedOrganization,
  OrganizationType,
} from "../../../../lib/organization-selection"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!

type StateType = {
  id: string
  state_name: string
  state_code: string
}

type CityType = {
  id: string
  city_name: string
}

type OrganizationRecord = {
  id: string
  organization_name: string
  organization_type: OrganizationType
  slug: string
  city_id?: string
  level?: string | null
}

async function getStates() {
  const res = await fetch(`${BACKEND_URL}/store/organization-directory/states`, {
    headers: {
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
  })
  if (!res.ok) throw new Error("Failed to fetch states")
  return res.json()
}

async function getCities(stateId: string) {
  const res = await fetch(
    `${BACKEND_URL}/store/organization-directory/cities?state_id=${encodeURIComponent(stateId)}`,
    {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
    }
  )
  if (!res.ok) throw new Error("Failed to fetch cities")
  return res.json()
}

async function getOrganizations(cityId: string, organizationType: OrganizationType) {
  const params = new URLSearchParams({
    city_id: cityId,
    organization_type: organizationType,
  })

  const res = await fetch(
    `${BACKEND_URL}/store/organization-directory/organizations?${params.toString()}`,
    {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
    }
  )
  if (!res.ok) throw new Error("Failed to fetch organizations")
  return res.json()
}

function readCartIdFromCookie() {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/_medusa_cart_id=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function syncSelectedOrganizationToCart(
  organization: SelectedOrganization | null
) {
  const cartId = readCartIdFromCookie()
  if (!cartId) return

  await fetch(`${BACKEND_URL}/store/carts/${cartId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
    body: JSON.stringify({
      metadata: organization
        ? {
            selected_organization_id: organization.id,
            selected_organization_name: organization.organization_name,
            selected_organization_slug: organization.slug,
            selected_organization_type: organization.organization_type,
            selected_school_id: organization.id,
            selected_school_name: organization.organization_name,
            selected_school_slug: organization.slug,
          }
        : {
            selected_organization_id: null,
            selected_organization_name: null,
            selected_organization_slug: null,
            selected_organization_type: null,
            selected_school_id: null,
            selected_school_name: null,
            selected_school_slug: null,
          },
    }),
  })
}

function getOrganizationTypeLabel(type: OrganizationType) {
  switch (type) {
    case "fire_department":
      return "Fire Department"
    case "police_department":
      return "Police Department"
    default:
      return "School"
  }
}

export default function SchoolSelectorClient() {
  const router = useRouter()

  const [states, setStates] = useState<StateType[]>([])
  const [cities, setCities] = useState<CityType[]>([])
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([])
  const [selectedType, setSelectedType] = useState<OrganizationType>("school")
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("")
  const [selectedOrganization, setSelectedOrganization] =
    useState<SelectedOrganization | null>(null)

  useEffect(() => {
    getStates().then((data) => setStates(data.states || [])).catch(console.error)

    const saved = loadSelectedOrganization()
    if (saved) {
      setSelectedOrganization(saved)
      setSelectedType(saved.organization_type || "school")
      setSelectedState(saved.state_id || "")
      setSelectedCity(saved.city_id || "")
      setSelectedOrganizationId(saved.id || "")
    }

    const unsubscribe = onSelectedOrganizationChange((organization) => {
      if (!organization) {
        setSelectedOrganization(null)
        setSelectedOrganizationId("")
        return
      }

      setSelectedOrganization(organization)
      setSelectedType(organization.organization_type || "school")
      setSelectedState(organization.state_id || "")
      setSelectedCity(organization.city_id || "")
      setSelectedOrganizationId(organization.id || "")
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!selectedState) {
      setCities([])
      return
    }

    getCities(selectedState)
      .then((data) => setCities(data.cities || []))
      .catch(console.error)
  }, [selectedState])

  useEffect(() => {
    if (!selectedCity) {
      setOrganizations([])
      return
    }

    getOrganizations(selectedCity, selectedType)
      .then((data) => setOrganizations(data.organizations || []))
      .catch(console.error)
  }, [selectedCity, selectedType])

  async function handleOrganizationChange(organizationId: string) {
    setSelectedOrganizationId(organizationId)

    const organization =
      organizations.find((item) => item.id === organizationId) || null
    if (!organization) return

    const normalized: SelectedOrganization = {
      id: organization.id,
      organization_name: organization.organization_name,
      slug: organization.slug,
      organization_type: organization.organization_type,
      city_id: selectedCity,
      state_id: selectedState,
      level: organization.level || undefined,
    }

    setSelectedOrganization(normalized)
    saveSelectedOrganization(normalized)

    try {
      await syncSelectedOrganizationToCart(normalized)
    } catch (e) {
      console.error("Failed syncing selected organization to cart", e)
    }

    router.refresh()
  }

  async function handleClearOrganization() {
    setSelectedState("")
    setSelectedCity("")
    setSelectedOrganizationId("")
    setSelectedOrganization(null)
    setCities([])
    setOrganizations([])

    clearSelectedOrganization()

    try {
      await syncSelectedOrganizationToCart(null)
    } catch (e) {
      console.error("Failed clearing organization from cart metadata", e)
    }

    router.refresh()
  }

  return (
    <div className="flex min-h-9 shrink-0 items-center justify-end gap-2">
      <select
        className="h-9 rounded border px-2 text-sm"
        value={selectedType}
        onChange={(e) => {
          setSelectedType(e.target.value as OrganizationType)
          setSelectedOrganizationId("")
          setSelectedOrganization(null)
          clearSelectedOrganization()
          void syncSelectedOrganizationToCart(null)
        }}
      >
        <option value="school">School</option>
        <option value="fire_department">Fire Department</option>
        <option value="police_department">Police Department</option>
      </select>

      <select
        className="h-9 rounded border px-2 text-sm"
        value={selectedState}
        onChange={(e) => {
          setSelectedState(e.target.value)
          setSelectedCity("")
          setSelectedOrganizationId("")
          setSelectedOrganization(null)
          clearSelectedOrganization()
          void syncSelectedOrganizationToCart(null)
        }}
      >
        <option value="">State</option>
        {states.map((state) => (
          <option key={state.id} value={state.id}>
            {state.state_name}
          </option>
        ))}
      </select>

      <select
        className="h-9 rounded border px-2 text-sm"
        value={selectedCity}
        onChange={(e) => {
          setSelectedCity(e.target.value)
          setSelectedOrganizationId("")
          setSelectedOrganization(null)
          clearSelectedOrganization()
          void syncSelectedOrganizationToCart(null)
        }}
        disabled={!selectedState}
      >
        <option value="">City</option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.city_name}
          </option>
        ))}
      </select>

      <select
        className="h-9 rounded border px-2 text-sm"
        value={selectedOrganizationId}
        onChange={(e) => handleOrganizationChange(e.target.value)}
        disabled={!selectedCity}
      >
        <option value="">{getOrganizationTypeLabel(selectedType)}</option>
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.organization_name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleClearOrganization}
        className="inline-flex h-9 items-center rounded border px-3 text-sm"
        disabled={!selectedOrganization}
      >
        Clear
      </button>
    </div>
  )
}
