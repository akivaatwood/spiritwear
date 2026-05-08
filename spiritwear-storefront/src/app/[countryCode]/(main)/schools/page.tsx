"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { getStates, getCities, getSchools } from "../../../../lib/school-directory"
import {
  loadSelectedSchool,
  saveSelectedSchool,
  SelectedSchool,
} from "../../../../lib/school-selection"

type StateType = {
  id: string
  state_name: string
  state_code: string
}

type CityType = {
  id: string
  city_name: string
}

type SchoolType = {
  id: string
  school_name: string
  slug: string
  level: string
  city_id?: string
}

export default function SchoolsPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = use(params)

  const [states, setStates] = useState<StateType[]>([])
  const [cities, setCities] = useState<CityType[]>([])
  const [schools, setSchools] = useState<SchoolType[]>([])
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedSchoolId, setSelectedSchoolId] = useState("")

  useEffect(() => {
    getStates().then((data) => {
      const loadedStates = data.states || []
      setStates(loadedStates)

      const saved = loadSelectedSchool()
      if (saved?.state_id) {
        setSelectedState(saved.state_id)
      }
      if (saved?.city_id) {
        setSelectedCity(saved.city_id)
      }
      if (saved?.id) {
        setSelectedSchoolId(saved.id)
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedState) {
      setCities([])
      setSelectedCity("")
      setSchools([])
      return
    }

    getCities(selectedState).then((data) => {
      setCities(data.cities || [])
    })
  }, [selectedState])

  useEffect(() => {
    if (!selectedCity) {
      setSchools([])
      return
    }

    getSchools(selectedCity, selectedLevel || undefined).then((data) => {
      setSchools(data.schools || [])
    })
  }, [selectedCity, selectedLevel])

  function handleSchoolSelect(school: SchoolType) {
    const selection: SelectedSchool = {
      id: school.id,
      organization_name: school.school_name,
      organization_type: "school",
      school_name: school.school_name,
      slug: school.slug,
      city_id: selectedCity,
      state_id: selectedState,
      level: school.level,
    }

    setSelectedSchoolId(school.id)
    saveSelectedSchool(selection)
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Browse Schools</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">State</label>
          <select
            className="w-full rounded border p-2"
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value)
              setSelectedCity("")
              setSelectedSchoolId("")
              setSchools([])
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
              setSelectedSchoolId("")
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
          >
            <option value="">All</option>
            <option value="high_school">High School</option>
            <option value="college">College</option>
          </select>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {schools.map((school) => {
          const isSelected = selectedSchoolId === school.id

          return (
            <div
              key={school.id}
              className={`rounded border p-4 ${
                isSelected ? "border-black bg-gray-50" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">{school.school_name}</div>
                  <div className="text-sm text-gray-600">
                    {school.level === "high_school" ? "High School" : "College"}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSchoolSelect(school)}
                    className="rounded border px-3 py-2 text-sm"
                  >
                    {isSelected ? "Selected" : "Select School"}
                  </button>

                  <Link
                    href={`/${countryCode}/schools/${school.slug}`}
                    className="rounded border px-3 py-2 text-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          )
        })}

        {!schools.length && selectedCity && (
          <p className="text-sm text-gray-500">No schools found.</p>
        )}
      </div>
    </main>
  )
}
