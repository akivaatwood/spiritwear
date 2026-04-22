export type SelectedSchool = {
    id: string
    school_name: string
    slug: string
    city_id?: string
    state_id?: string
    level?: string
}

const STORAGE_KEY = "spiritwear_selected_school"
const COOKIE_KEY = "spiritwear_selected_school"
const EVENT_NAME = "spiritwear:selected-school-changed"

export function saveSelectedSchool(school: SelectedSchool | null) {
    if (typeof window === "undefined") return

    if (!school) {
        localStorage.removeItem(STORAGE_KEY)
        document.cookie = `${COOKIE_KEY}=; path=/; max-age=0`
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: null }))
        return
    }

    const value = JSON.stringify(school)

    localStorage.setItem(STORAGE_KEY, value)
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 30}`

    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: school }))
}

export function loadSelectedSchool(): SelectedSchool | null {
    if (typeof window === "undefined") return null

    const fromStorage = localStorage.getItem(STORAGE_KEY)
    if (fromStorage) {
        try {
            return JSON.parse(fromStorage)
        } catch {
            return null
        }
    }

    const cookieMatch = document.cookie.match(
        /(?:^|; )spiritwear_selected_school=([^;]+)/
    )

    if (cookieMatch?.[1]) {
        try {
            return JSON.parse(decodeURIComponent(cookieMatch[1]))
        } catch {
            return null
        }
    }

    return null
}


export function clearSelectedSchool() {
    saveSelectedSchool(null)
}

export function onSelectedSchoolChange(
    callback: (school: SelectedSchool | null) => void
) {
    if (typeof window === "undefined") return () => { }

    const handler = (event: Event) => {
        const customEvent = event as CustomEvent<SelectedSchool | null>
        callback(customEvent.detail ?? null)
    }

    const storageHandler = () => {
        callback(loadSelectedSchool())
    }

    window.addEventListener(EVENT_NAME, handler)
    window.addEventListener("storage", storageHandler)

    return () => {
        window.removeEventListener(EVENT_NAME, handler)
        window.removeEventListener("storage", storageHandler)
    }
}