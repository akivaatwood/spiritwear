"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import {
  getCities,
  getOrganizations,
  getStates,
} from "../../../../lib/organization-directory"
import {
  loadSelectedOrganization,
  saveSelectedOrganization,
  SelectedOrganization,
  OrganizationType,
} from "../../../../lib/organization-selection"

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
  level?: string | null
  city_id?: string
  primary_mascot?: {
    id: string
    mascot_name: string
    image_url?: string | null
  } | null
  mascots?: Array<{
    id: string
    mascot_name: string
    image_url?: string | null
  }>
  groups?: Array<{
    id: string
    group_name: string
    activity_name?: string | null
    primary_mascot?: {
      id: string
      mascot_name: string
      image_url?: string | null
    } | null
  }>
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

export default function OrganizationsPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = use(params)

  const [states, setStates] = useState<StateType[]>([])
  const [cities, setCities] = useState<CityType[]>([])
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([])
  const [selectedType, setSelectedType] = useState<OrganizationType>("school")
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("")

  useEffect(() => {
    getStates().then((data) => {
      const loadedStates = data.states || []
      setStates(loadedStates)

      const saved = loadSelectedOrganization()
      if (saved?.organization_type) {
        setSelectedType(saved.organization_type)
      }
      if (saved?.state_id) {
        setSelectedState(saved.state_id)
      }
      if (saved?.city_id) {
        setSelectedCity(saved.city_id)
      }
      if (saved?.id) {
        setSelectedOrganizationId(saved.id)
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedState) {
      setCities([])
      setSelectedCity("")
      setOrganizations([])
      return
    }

    getCities(selectedState).then((data) => {
      setCities(data.cities || [])
    })
  }, [selectedState])

  useEffect(() => {
    if (!selectedCity) {
      setOrganizations([])
      return
    }

    getOrganizations(
      selectedCity,
      selectedType,
      selectedType === "school" ? selectedLevel || undefined : undefined
    ).then((data) => {
      setOrganizations(data.organizations || [])
    })
  }, [selectedCity, selectedType, selectedLevel])

  function handleOrganizationSelect(organization: OrganizationRecord) {
    const selection: SelectedOrganization = {
      id: organization.id,
      organization_name: organization.organization_name,
      slug: organization.slug,
      organization_type: organization.organization_type,
      city_id: selectedCity,
      state_id: selectedState,
      level: organization.level || undefined,
    }

    setSelectedOrganizationId(organization.id)
    saveSelectedOrganization(selection)
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Browse Organizations</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>
          <select
            className="w-full rounded border p-2"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value as OrganizationType)
              setSelectedOrganizationId("")
              setOrganizations([])
              saveSelectedOrganization(null)
              if (e.target.value !== "school") {
                setSelectedLevel("")
              }
            }}
          >
            <option value="school">Schools</option>
            <option value="fire_department">Fire Departments</option>
            <option value="police_department">Police Departments</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">State</label>
          <select
            className="w-full rounded border p-2"
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value)
              setSelectedCity("")
              setSelectedOrganizationId("")
              setOrganizations([])
              saveSelectedOrganization(null)
            }}
          >
            <option value="">Select a state</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.state_name} ({state.state_code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">City</label>
          <select
            className="w-full rounded border p-2"
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value)
              setSelectedOrganizationId("")
              saveSelectedOrganization(null)
            }}
            disabled={!selectedState}
          >
            <option value="">Select a city</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.city_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Level</label>
          <select
            className="w-full rounded border p-2"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            disabled={selectedType !== "school"}
          >
            <option value="">All</option>
            <option value="high_school">High School</option>
            <option value="college">College</option>
          </select>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {organizations.map((organization) => {
          const isSelected = selectedOrganizationId === organization.id

          return (
            <div
              key={organization.id}
              className={`rounded border p-4 ${
                isSelected ? "border-black bg-gray-50" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">
                    {organization.organization_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getOrganizationTypeLabel(organization.organization_type)}
                    {organization.organization_type === "school" &&
                    organization.level
                      ? ` · ${
                          organization.level === "high_school"
                            ? "High School"
                            : "College"
                        }`
                      : ""}
                  </div>
                  {organization.primary_mascot ? (
                    <div className="mt-2 text-sm text-gray-700">
                      Mascot: {organization.primary_mascot.mascot_name}
                    </div>
                  ) : null}
                  {!!organization.groups?.length && (
                    <div className="mt-2 space-y-1 text-sm text-gray-700">
                      {organization.groups.map((group) =>
                        group.primary_mascot ? (
                          <div key={group.id}>
                            Team mascot: {group.group_name} - {group.primary_mascot.mascot_name}
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {organization.primary_mascot?.image_url ? (
                      <img
                        src={organization.primary_mascot.image_url}
                        alt={organization.primary_mascot.mascot_name}
                        className="h-16 w-16 rounded border object-contain bg-white p-1"
                      />
                    ) : null}
                    {organization.groups
                      ?.filter((group) => group.primary_mascot?.image_url)
                      .map((group) => (
                        <img
                          key={group.id}
                          src={group.primary_mascot!.image_url!}
                          alt={group.primary_mascot!.mascot_name}
                          title={`${group.group_name}: ${group.primary_mascot!.mascot_name}`}
                          className="h-16 w-16 rounded border object-contain bg-white p-1"
                        />
                      ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOrganizationSelect(organization)}
                    className="rounded border px-3 py-2 text-sm"
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>

                  <Link
                    href={`/${countryCode}/organizations/${organization.slug}`}
                    className="rounded border px-3 py-2 text-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          )
        })}

        {!organizations.length && selectedCity && (
          <p className="text-sm text-gray-500">No organizations found.</p>
        )}
      </div>
    </main>
  )
}
