"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  clearSelectedSchool,
  loadSelectedSchool,
  onSelectedSchoolChange,
  saveSelectedSchool,
  SelectedSchool,
} from "../../../../lib/school-selection"

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

type SchoolType = {
  id: string
  school_name: string
  slug: string
  city_id?: string
  level?: string
}

async function getStates() {
  const res = await fetch(`${BACKEND_URL}/store/school-directory/states`, {
    headers: {
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
  })
  if (!res.ok) throw new Error("Failed to fetch states")
  return res.json()
}

async function getCities(stateId: string) {
  const res = await fetch(
    `${BACKEND_URL}/store/school-directory/cities?state_id=${encodeURIComponent(stateId)}`,
    {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
    }
  )
  if (!res.ok) throw new Error("Failed to fetch cities")
  return res.json()
}

async function getSchools(cityId: string) {
  const res = await fetch(
    `${BACKEND_URL}/store/school-directory/schools?city_id=${encodeURIComponent(cityId)}`,
    {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
    }
  )
  if (!res.ok) throw new Error("Failed to fetch schools")
  return res.json()
}

function readCartIdFromCookie() {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/_medusa_cart_id=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function syncSelectedSchoolToCart(
  school: SelectedSchool | null
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
      metadata: school
        ? {
            selected_school_id: school.id,
            selected_school_name: school.school_name,
            selected_school_slug: school.slug,
          }
        : {
            selected_school_id: null,
            selected_school_name: null,
            selected_school_slug: null,
          },
    }),
  })
}

export default function SchoolSelectorClient() {
  const router = useRouter()

  const [states, setStates] = useState<StateType[]>([])
  const [cities, setCities] = useState<CityType[]>([])
  const [schools, setSchools] = useState<SchoolType[]>([])
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedSchoolId, setSelectedSchoolId] = useState("")
  const [selectedSchool, setSelectedSchool] = useState<SelectedSchool | null>(null)

  useEffect(() => {
    getStates().then((data) => setStates(data.states || [])).catch(console.error)

    const saved = loadSelectedSchool()
    if (saved) {
      setSelectedSchool(saved)
      setSelectedState(saved.state_id || "")
      setSelectedCity(saved.city_id || "")
      setSelectedSchoolId(saved.id || "")
    }

    const unsubscribe = onSelectedSchoolChange((school) => {
      setSelectedSchool(school)
      setSelectedState(school?.state_id || "")
      setSelectedCity(school?.city_id || "")
      setSelectedSchoolId(school?.id || "")
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
      setSchools([])
      return
    }

    getSchools(selectedCity)
      .then((data) => setSchools(data.schools || []))
      .catch(console.error)
  }, [selectedCity])

  async function handleSchoolChange(schoolId: string) {
    setSelectedSchoolId(schoolId)

    const school = schools.find((s) => s.id === schoolId) || null
    if (!school) return

    const normalized: SelectedSchool = {
      id: school.id,
      school_name: school.school_name,
      slug: school.slug,
      city_id: selectedCity,
      state_id: selectedState,
      level: school.level,
    }

    setSelectedSchool(normalized)
    saveSelectedSchool(normalized)

    try {
      await syncSelectedSchoolToCart(normalized)
    } catch (e) {
      console.error("Failed syncing selected school to cart", e)
    }

    router.refresh()
  }

  async function handleClearSchool() {
    setSelectedState("")
    setSelectedCity("")
    setSelectedSchoolId("")
    setSelectedSchool(null)
    setCities([])
    setSchools([])

    clearSelectedSchool()

    try {
      await syncSelectedSchoolToCart(null)
    } catch (e) {
      console.error("Failed clearing school from cart metadata", e)
    }

    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="rounded border px-2 py-1 text-sm"
        value={selectedState}
        onChange={(e) => {
          setSelectedState(e.target.value)
          setSelectedCity("")
          setSelectedSchoolId("")
          setSelectedSchool(null)
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
        className="rounded border px-2 py-1 text-sm"
        value={selectedCity}
        onChange={(e) => {
          setSelectedCity(e.target.value)
          setSelectedSchoolId("")
          setSelectedSchool(null)
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
        className="rounded border px-2 py-1 text-sm"
        value={selectedSchoolId}
        onChange={(e) => handleSchoolChange(e.target.value)}
        disabled={!selectedCity}
      >
        <option value="">School</option>
        {schools.map((school) => (
          <option key={school.id} value={school.id}>
            {school.school_name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleClearSchool}
        className="rounded border px-3 py-1 text-sm"
      >
        Clear
      </button>
    </div>
  )
}