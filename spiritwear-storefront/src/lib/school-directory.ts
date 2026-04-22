const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!

const defaultHeaders = {
  "x-publishable-api-key": PUBLISHABLE_KEY,
}

export async function getStates() {
  const res = await fetch(`${BACKEND_URL}/store/school-directory/states`, {
    headers: defaultHeaders,
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error("Failed to fetch states")
  return res.json()
}

export async function getCities(stateId: string) {
  const res = await fetch(
    `${BACKEND_URL}/store/school-directory/cities?state_id=${encodeURIComponent(stateId)}`,
    {
      headers: defaultHeaders,
      next: { revalidate: 300 },
    }
  )

  if (!res.ok) throw new Error("Failed to fetch cities")
  return res.json()
}

export async function getSchools(cityId: string, level?: string) {
  const params = new URLSearchParams({ city_id: cityId })
  if (level) params.set("level", level)

  const res = await fetch(
    `${BACKEND_URL}/store/school-directory/schools?${params.toString()}`,
    {
      headers: defaultHeaders,
      next: { revalidate: 300 },
    }
  )

  if (!res.ok) throw new Error("Failed to fetch schools")
  return res.json()
}

export async function getSchool(slug: string) {
  const res = await fetch(
    `${BACKEND_URL}/store/school-directory/schools/${encodeURIComponent(slug)}`,
    {
      headers: defaultHeaders,
      next: { revalidate: 300 },
    }
  )

  if (!res.ok) throw new Error("Failed to fetch school")
  return res.json()
}