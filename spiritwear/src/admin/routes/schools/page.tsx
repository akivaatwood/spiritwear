import { useEffect, useMemo, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { MagnifyingGlass } from "@medusajs/icons"

function parseLinesToColors(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [color_name, hex_value = ""] = line.split("|").map((s) => s.trim())
      return {
        color_name,
        hex_value: hex_value || null,
        is_primary: index === 0,
        sort_order: index,
      }
    })
}

function parseLinesToMascots(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [mascot_name, image_url = ""] = line.split("|").map((s) => s.trim())
      return {
        mascot_name,
        image_url: image_url || null,
        is_primary: index === 0,
        is_official: true,
      }
    })
}

function colorsToText(colors: any[] = []) {
  return colors.map((c) => `${c.color_name || ""}|${c.hex_value || ""}`).join("\n")
}

function mascotsToText(mascots: any[] = []) {
  return mascots
    .map((m) => `${m.mascot_name || ""}|${m.image_url || ""}`)
    .join("\n")
}

async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(",")[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const SchoolsAdminPage = () => {
  const [schools, setSchools] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [sports, setSports] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [teamUploading, setTeamUploading] = useState(false)
  const [creatingState, setCreatingState] = useState(false)
  const [creatingCity, setCreatingCity] = useState(false)
  const [selectedStateId, setSelectedStateId] = useState("")
  const [search, setSearch] = useState("")
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null)
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [deletingSchool, setDeletingSchool] = useState(false)
  const [deletingTeam, setDeletingTeam] = useState(false)
  const [newStateName, setNewStateName] = useState("")
  const [newStateCode, setNewStateCode] = useState("")
  const [newCityName, setNewCityName] = useState("")

  const emptyForm = {
    city_id: "",
    school_name: "",
    slug: "",
    level: "high_school",
    website_url: "",
    primary_contact_email: "",
    physical_address: "",
    is_active: true,
    colorsText: "",
    mascotsText: "",
    uploadedMascotName: "",
    uploadedMascotUrl: "",
  }

  const emptyTeamForm = {
    sport_id: "",
    team_name: "",
    slug: "",
    gender: "",
    team_level: "",
    is_active: true,
    colorsText: "",
    mascotsText: "",
    uploadedMascotName: "",
    uploadedMascotUrl: "",
  }

  const [form, setForm] = useState(emptyForm)
  const [teamForm, setTeamForm] = useState(emptyTeamForm)

  async function loadStates() {
    const res = await fetch(`/admin/school-directory/states`, {
      credentials: "include",
    })
    const data = await res.json()
    setStates(data.states || [])
  }

  async function loadCities(stateId?: string) {
    const url = stateId
      ? `/admin/school-directory/cities?state_id=${encodeURIComponent(stateId)}`
      : `/admin/school-directory/cities`

    const res = await fetch(url, { credentials: "include" })
    const data = await res.json()
    setCities(data.cities || [])
  }

  async function loadSports() {
    const res = await fetch(`/admin/school-directory/sports`, {
      credentials: "include",
    })
    const data = await res.json()
    setSports(data.sports || [])
  }

  async function loadSchools(query?: string) {
    setLoading(true)
    const url = query
      ? `/admin/school-directory/schools?q=${encodeURIComponent(query)}`
      : `/admin/school-directory/schools`

    const res = await fetch(url, { credentials: "include" })
    const data = await res.json()
    setSchools(data.schools || [])
    setLoading(false)
  }

  async function loadTeams(schoolId: string) {
    const res = await fetch(
      `/admin/school-directory/teams?school_id=${encodeURIComponent(schoolId)}`,
      {
        credentials: "include",
      }
    )
    const data = await res.json()
    setTeams(data.teams || [])
  }

  useEffect(() => {
    loadStates()
    loadCities()
    loadSchools()
    loadSports()
  }, [])

  useEffect(() => {
    if (selectedStateId) {
      loadCities(selectedStateId)
      setForm((prev) => ({ ...prev, city_id: "" }))
    }
  }, [selectedStateId])

  const filteredSchools = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return schools
    return schools.filter((school) =>
      String(school.school_name || "").toLowerCase().includes(q) ||
      String(school.slug || "").toLowerCase().includes(q)
    )
  }, [schools, search])

  function resetForm() {
    setEditingSchoolId(null)
    setTeams([])
    setEditingTeamId(null)
    setForm(emptyForm)
    setTeamForm(emptyTeamForm)
  }

  function resetTeamForm() {
    setEditingTeamId(null)
    setTeamForm(emptyTeamForm)
  }

  async function startEdit(schoolId: string) {
    const res = await fetch(`/admin/school-directory/schools/${schoolId}`, {
      credentials: "include",
    })
    const data = await res.json()
    const school = data.school

    setEditingSchoolId(school.id)
    setForm({
      city_id: school.city_id || "",
      school_name: school.school_name || "",
      slug: school.slug || "",
      level: school.level || "high_school",
      website_url: school.website_url || "",
      primary_contact_email: school.primary_contact_email || "",
      physical_address: school.physical_address || "",
      is_active: school.is_active !== false,
      colorsText: colorsToText(school.colors || []),
      mascotsText: mascotsToText(school.mascots || []),
      uploadedMascotName: "",
      uploadedMascotUrl: "",
    })

    await loadTeams(school.id)
    resetTeamForm()
  }

  async function startEditTeam(teamId: string) {
    const res = await fetch(`/admin/school-directory/teams/${teamId}`, {
      credentials: "include",
    })
    const data = await res.json()
    const team = data.team

    setEditingTeamId(team.id)
    setTeamForm({
      sport_id: team.sport_id || "",
      team_name: team.team_name || "",
      slug: team.slug || "",
      gender: team.gender || "",
      team_level: team.team_level || "",
      is_active: team.is_active !== false,
      colorsText: colorsToText(team.colors || []),
      mascotsText: mascotsToText(team.mascots || []),
      uploadedMascotName: "",
      uploadedMascotUrl: "",
    })
  }

  async function createState() {
    if (!newStateName.trim() || !newStateCode.trim()) {
      alert("State name and state code are required")
      return
    }

    setCreatingState(true)

    try {
      const res = await fetch(`/admin/school-directory/states`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country_code: "US",
          state_code: newStateCode.trim().toUpperCase(),
          state_name: newStateName.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create state")
      }

      await loadStates()
      setSelectedStateId(data.state.id)
      setNewStateName("")
      setNewStateCode("")
    } catch (e: any) {
      alert(e?.message || "Failed to create state")
    } finally {
      setCreatingState(false)
    }
  }

  async function createCity() {
    if (!selectedStateId) {
      alert("Select a state first")
      return
    }

    if (!newCityName.trim()) {
      alert("City name is required")
      return
    }

    setCreatingCity(true)

    try {
      const res = await fetch(`/admin/school-directory/cities`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state_id: selectedStateId,
          city_name: newCityName.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create city")
      }

      await loadCities(selectedStateId)
      setForm((prev) => ({ ...prev, city_id: data.city.id }))
      setNewCityName("")
    } catch (e: any) {
      alert(e?.message || "Failed to create city")
    } finally {
      setCreatingCity(false)
    }
  }

  async function uploadImage(file: File) {
    const contentBase64 = await fileToBase64(file)

    const res = await fetch(`/admin/school-directory/upload-mascot`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        contentBase64,
      }),
    })

    const rawText = await res.text()

    let data: any = {}
    try {
      data = rawText ? JSON.parse(rawText) : {}
    } catch {
      data = { message: rawText }
    }

    if (!res.ok) {
      throw new Error(data?.message || `Upload failed with status ${res.status}`)
    }

    const uploadedUrl = data.url || data.file?.url || ""
    if (!uploadedUrl) {
      throw new Error("Upload succeeded but no URL was returned")
    }

    return uploadedUrl
  }

  async function handleMascotUpload(file: File) {
    setUploading(true)

    try {
      const uploadedUrl = await uploadImage(file)

      setForm((prev) => {
        const mascotName =
          prev.uploadedMascotName.trim() ||
          file.name.replace(/\.[^/.]+$/, "") ||
          "Mascot"

        const existingLines = prev.mascotsText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)

        const cleanedLines = existingLines.filter((line) => {
          const [existingName = "", existingUrl = ""] = line
            .split("|")
            .map((s) => s.trim())

          const sameMascotName =
            existingName.toLowerCase() === mascotName.toLowerCase()

          const isPlaceholderUrl =
            existingUrl.includes("cdn.example.com") ||
            existingUrl.includes("/mascots/eagles.png")

          return !(sameMascotName || isPlaceholderUrl)
        })

        const nextLine = `${mascotName}|${uploadedUrl}`

        return {
          ...prev,
          mascotsText: [...cleanedLines, nextLine].join("\n"),
          uploadedMascotName: "",
          uploadedMascotUrl: uploadedUrl,
        }
      })
    } catch (e: any) {
      console.error("School mascot upload failed:", e)
      alert(e?.message || "Unknown upload error")
    } finally {
      setUploading(false)
    }
  }

  async function handleTeamMascotUpload(file: File) {
    setTeamUploading(true)

    try {
      const uploadedUrl = await uploadImage(file)

      setTeamForm((prev) => {
        const mascotName =
          prev.uploadedMascotName.trim() ||
          file.name.replace(/\.[^/.]+$/, "") ||
          "Mascot"

        const existingLines = prev.mascotsText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)

        const cleanedLines = existingLines.filter((line) => {
          const [existingName = "", existingUrl = ""] = line
            .split("|")
            .map((s) => s.trim())

          const sameMascotName =
            existingName.toLowerCase() === mascotName.toLowerCase()

          const isPlaceholderUrl =
            existingUrl.includes("cdn.example.com") ||
            existingUrl.includes("/mascots/eagles.png")

          return !(sameMascotName || isPlaceholderUrl)
        })

        const nextLine = `${mascotName}|${uploadedUrl}`

        return {
          ...prev,
          mascotsText: [...cleanedLines, nextLine].join("\n"),
          uploadedMascotName: "",
          uploadedMascotUrl: uploadedUrl,
        }
      })
    } catch (e: any) {
      console.error("Team mascot upload failed:", e)
      alert(e?.message || "Unknown upload error")
    } finally {
      setTeamUploading(false)
    }
  }

  async function saveSchool(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      city_id: form.city_id,
      school_name: form.school_name,
      slug: form.slug,
      level: form.level,
      website_url: form.website_url || null,
      primary_contact_email: form.primary_contact_email || null,
      physical_address: form.physical_address || null,
      is_active: form.is_active,
      colors: parseLinesToColors(form.colorsText),
      mascots: parseLinesToMascots(form.mascotsText),
    }

    const url = editingSchoolId
      ? `/admin/school-directory/schools/${editingSchoolId}`
      : `/admin/school-directory/schools`

    const method = editingSchoolId ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      alert(error.message || "Failed to save school")
      setSaving(false)
      return
    }

    await loadSchools()
    if (editingSchoolId) {
      await loadTeams(editingSchoolId)
    }
    setSaving(false)
  }

  async function saveTeam(e: React.FormEvent) {
    e.preventDefault()

    if (!editingSchoolId) {
      alert("Save or select a school first")
      return
    }

    const payload = {
      school_id: editingSchoolId,
      sport_id: teamForm.sport_id,
      team_name: teamForm.team_name,
      slug: teamForm.slug,
      gender: teamForm.gender || null,
      team_level: teamForm.team_level || null,
      is_active: teamForm.is_active,
      colors: parseLinesToColors(teamForm.colorsText),
      mascots: parseLinesToMascots(teamForm.mascotsText),
    }

    const url = editingTeamId
      ? `/admin/school-directory/teams/${editingTeamId}`
      : `/admin/school-directory/teams`

    const method = editingTeamId ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      alert(data?.message || "Failed to save team")
      return
    }

    await loadTeams(editingSchoolId)
    resetTeamForm()
  }

  async function deleteSchool() {
    if (!editingSchoolId) return

    const confirmed = window.confirm(
      "Delete this school and all of its teams, colors, and mascots?"
    )
    if (!confirmed) return

    setDeletingSchool(true)

    try {
      const res = await fetch(`/admin/school-directory/schools/${editingSchoolId}`, {
        method: "DELETE",
        credentials: "include",
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete school")
      }

      await loadSchools()
      resetForm()
    } catch (e: any) {
      alert(e?.message || "Failed to delete school")
    } finally {
      setDeletingSchool(false)
    }
  }

  async function deleteTeam() {
    if (!editingTeamId || !editingSchoolId) return

    const confirmed = window.confirm(
      "Delete this team and all of its colors and mascots?"
    )
    if (!confirmed) return

    setDeletingTeam(true)

    try {
      const res = await fetch(`/admin/school-directory/teams/${editingTeamId}`, {
        method: "DELETE",
        credentials: "include",
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete team")
      }

      await loadTeams(editingSchoolId)
      resetTeamForm()
    } catch (e: any) {
      alert(e?.message || "Failed to delete team")
    } finally {
      setDeletingTeam(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Schools</h1>
      <p style={{ marginBottom: 24, color: "#555" }}>
        View, create, edit schools, and manage teams, team colors, and team mascot images.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>School List</h2>
            <button onClick={() => resetForm()} style={{ padding: "8px 12px" }}>
              New School
            </button>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schools..."
            style={{ width: "100%", padding: 10, marginBottom: 12 }}
          />

          {loading ? (
            <div>Loading...</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {filteredSchools.map((school) => (
                <div
                  key={school.id}
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{school.school_name}</div>
                      <div style={{ fontSize: 13, color: "#666" }}>{school.slug}</div>
                      <div style={{ fontSize: 13, color: "#666" }}>
                        {school.level === "high_school" ? "High School" : "College"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => startEdit(school.id)} style={{ padding: "8px 12px" }}>
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!filteredSchools.length && <div>No schools found.</div>}
            </div>
          )}
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>
              {editingSchoolId ? "Edit School" : "Add School"}
            </h2>
            {editingSchoolId && (
              <button
                type="button"
                onClick={deleteSchool}
                disabled={deletingSchool}
                style={{ padding: "8px 12px", color: "white", background: "#b91c1c", borderRadius: 6 }}
              >
                {deletingSchool ? "Deleting..." : "Delete School"}
              </button>
            )}
          </div>

          <form onSubmit={saveSchool} style={{ display: "grid", gap: 12 }}>
            <label>
              <div style={{ marginBottom: 6 }}>State</div>
              <select
                value={selectedStateId}
                onChange={(e) => setSelectedStateId(e.target.value)}
                style={{ width: "100%", padding: 10 }}
              >
                <option value="">Select a state</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.state_name} ({state.state_code})
                  </option>
                ))}
              </select>
            </label>

            <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 12, display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 600 }}>Add New State</div>
              <input
                placeholder="State name (e.g. Texas)"
                value={newStateName}
                onChange={(e) => setNewStateName(e.target.value)}
                style={{ width: "100%", padding: 10 }}
              />
              <input
                placeholder="State code (e.g. TX)"
                value={newStateCode}
                onChange={(e) => setNewStateCode(e.target.value)}
                style={{ width: "100%", padding: 10 }}
              />
              <button type="button" onClick={createState} disabled={creatingState} style={{ padding: "10px 14px" }}>
                {creatingState ? "Creating State..." : "Add State"}
              </button>
            </div>

            <label>
              <div style={{ marginBottom: 6 }}>City</div>
              <select
                required
                value={form.city_id}
                onChange={(e) => setForm((prev) => ({ ...prev, city_id: e.target.value }))}
                style={{ width: "100%", padding: 10 }}
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.city_name}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 12, display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 600 }}>Add New City</div>
              <input
                placeholder="City name (e.g. Dallas)"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                style={{ width: "100%", padding: 10 }}
              />
              <button
                type="button"
                onClick={createCity}
                disabled={creatingCity || !selectedStateId}
                style={{ padding: "10px 14px" }}
              >
                {creatingCity ? "Creating City..." : "Add City"}
              </button>
            </div>

            <label>
              <div style={{ marginBottom: 6 }}>School Name</div>
              <input
                required
                value={form.school_name}
                onChange={(e) => setForm((prev) => ({ ...prev, school_name: e.target.value }))}
                style={{ width: "100%", padding: 10 }}
              />
            </label>

            <label>
              <div style={{ marginBottom: 6 }}>Slug</div>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                style={{ width: "100%", padding: 10 }}
              />
            </label>

            <label>
              <div style={{ marginBottom: 6 }}>Level</div>
              <select
                value={form.level}
                onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
                style={{ width: "100%", padding: 10 }}
              >
                <option value="high_school">High School</option>
                <option value="college">College</option>
              </select>
            </label>

            <label>
              <div style={{ marginBottom: 6 }}>Website URL</div>
              <input
                value={form.website_url}
                onChange={(e) => setForm((prev) => ({ ...prev, website_url: e.target.value }))}
                style={{ width: "100%", padding: 10 }}
              />
            </label>

            <label>
              <div style={{ marginBottom: 6 }}>Primary Contact Email</div>
              <input
                value={form.primary_contact_email}
                onChange={(e) => setForm((prev) => ({ ...prev, primary_contact_email: e.target.value }))}
                style={{ width: "100%", padding: 10 }}
              />
            </label>

            <label>
              <div style={{ marginBottom: 6 }}>Physical Address</div>
              <textarea
                value={form.physical_address}
                onChange={(e) => setForm((prev) => ({ ...prev, physical_address: e.target.value }))}
                style={{ width: "100%", padding: 10, minHeight: 80 }}
              />
            </label>

            <label>
              <div style={{ marginBottom: 6 }}>School Colors</div>
              <textarea
                value={form.colorsText}
                onChange={(e) => setForm((prev) => ({ ...prev, colorsText: e.target.value }))}
                placeholder={"One per line: Color Name|#HEX\nBlue|#0033A0\nWhite|#FFFFFF"}
                style={{ width: "100%", padding: 10, minHeight: 90 }}
              />
            </label>

            <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 12, display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 600 }}>Upload School Mascot Image</div>

              <input
                value={form.uploadedMascotName}
                onChange={(e) => setForm((prev) => ({ ...prev, uploadedMascotName: e.target.value }))}
                placeholder="Mascot name"
                style={{ width: "100%", padding: 10 }}
              />

              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  await handleMascotUpload(file)
                  e.currentTarget.value = ""
                }}
              />

              {uploading && <div>Uploading school mascot...</div>}

              {form.uploadedMascotUrl ? (
                <img
                  src={form.uploadedMascotUrl}
                  alt="Uploaded school mascot"
                  style={{
                    width: 160,
                    height: 160,
                    objectFit: "contain",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 8,
                    background: "#fff",
                  }}
                />
              ) : null}
            </div>

            <label>
              <div style={{ marginBottom: 6 }}>School Mascots</div>
              <textarea
                value={form.mascotsText}
                onChange={(e) => setForm((prev) => ({ ...prev, mascotsText: e.target.value }))}
                placeholder={"One per line: Mascot Name|Image URL"}
                style={{ width: "100%", padding: 10, minHeight: 120 }}
              />
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              Active
            </label>

            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" disabled={saving} style={{ padding: "10px 14px" }}>
                {saving ? "Saving..." : editingSchoolId ? "Save School" : "Create School"}
              </button>
              <button type="button" onClick={resetForm} style={{ padding: "10px 14px" }}>
                Clear
              </button>
            </div>
          </form>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>
              {editingTeamId ? "Edit Team" : "Add Team"}
            </h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={resetTeamForm} style={{ padding: "8px 12px" }}>
                New Team
              </button>
              {editingTeamId && (
                <button
                  type="button"
                  onClick={deleteTeam}
                  disabled={deletingTeam}
                  style={{ padding: "8px 12px", color: "white", background: "#b91c1c", borderRadius: 6 }}
                >
                  {deletingTeam ? "Deleting..." : "Delete Team"}
                </button>
              )}
            </div>
          </div>

          {!editingSchoolId ? (
            <div style={{ color: "#666" }}>Select or save a school first to manage teams.</div>
          ) : (
            <>
              <div style={{ marginBottom: 16, display: "grid", gap: 10 }}>
                {teams.map((team) => (
                  <div
                    key={team.id}
                    style={{
                      border: "1px solid #e5e5e5",
                      borderRadius: 10,
                      padding: 12,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{team.team_name}</div>
                        <div style={{ fontSize: 13, color: "#666" }}>
                          {team.sport?.sport_name || "Unknown sport"}
                          {team.gender ? ` · ${team.gender}` : ""}
                          {team.team_level ? ` · ${team.team_level}` : ""}
                        </div>
                        <div style={{ fontSize: 13, color: "#666" }}>{team.slug}</div>
                      </div>
                      <div>
                        <button type="button" onClick={() => startEditTeam(team.id)} style={{ padding: "8px 12px" }}>
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!teams.length && <div style={{ color: "#666" }}>No teams yet.</div>}
              </div>

              <form onSubmit={saveTeam} style={{ display: "grid", gap: 12 }}>
                <label>
                  <div style={{ marginBottom: 6 }}>Sport</div>
                  <select
                    required
                    value={teamForm.sport_id}
                    onChange={(e) => setTeamForm((prev) => ({ ...prev, sport_id: e.target.value }))}
                    style={{ width: "100%", padding: 10 }}
                  >
                    <option value="">Select a sport</option>
                    {sports.map((sport) => (
                      <option key={sport.id} value={sport.id}>
                        {sport.sport_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <div style={{ marginBottom: 6 }}>Team Name</div>
                  <input
                    required
                    value={teamForm.team_name}
                    onChange={(e) => setTeamForm((prev) => ({ ...prev, team_name: e.target.value }))}
                    style={{ width: "100%", padding: 10 }}
                  />
                </label>

                <label>
                  <div style={{ marginBottom: 6 }}>Slug</div>
                  <input
                    required
                    value={teamForm.slug}
                    onChange={(e) => setTeamForm((prev) => ({ ...prev, slug: e.target.value }))}
                    style={{ width: "100%", padding: 10 }}
                  />
                </label>

                <label>
                  <div style={{ marginBottom: 6 }}>Gender</div>
                  <select
                    value={teamForm.gender}
                    onChange={(e) => setTeamForm((prev) => ({ ...prev, gender: e.target.value }))}
                    style={{ width: "100%", padding: 10 }}
                  >
                    <option value="">None</option>
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                    <option value="mens">Mens</option>
                    <option value="womens">Womens</option>
                    <option value="coed">Coed</option>
                  </select>
                </label>

                <label>
                  <div style={{ marginBottom: 6 }}>Team Level</div>
                  <select
                    value={teamForm.team_level}
                    onChange={(e) => setTeamForm((prev) => ({ ...prev, team_level: e.target.value }))}
                    style={{ width: "100%", padding: 10 }}
                  >
                    <option value="">None</option>
                    <option value="varsity">Varsity</option>
                    <option value="junior_varsity">Junior Varsity</option>
                    <option value="freshman">Freshman</option>
                    <option value="club">Club</option>
                    <option value="intramural">Intramural</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label>
                  <div style={{ marginBottom: 6 }}>Team Colors</div>
                  <textarea
                    value={teamForm.colorsText}
                    onChange={(e) => setTeamForm((prev) => ({ ...prev, colorsText: e.target.value }))}
                    placeholder={"One per line: Color Name|#HEX"}
                    style={{ width: "100%", padding: 10, minHeight: 90 }}
                  />
                </label>

                <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 12, display: "grid", gap: 10 }}>
                  <div style={{ fontWeight: 600 }}>Upload Team Mascot Image</div>

                  <input
                    value={teamForm.uploadedMascotName}
                    onChange={(e) => setTeamForm((prev) => ({ ...prev, uploadedMascotName: e.target.value }))}
                    placeholder="Team mascot name"
                    style={{ width: "100%", padding: 10 }}
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      await handleTeamMascotUpload(file)
                      e.currentTarget.value = ""
                    }}
                  />

                  {teamUploading && <div>Uploading team mascot...</div>}

                  {teamForm.uploadedMascotUrl ? (
                    <img
                      src={teamForm.uploadedMascotUrl}
                      alt="Uploaded team mascot"
                      style={{
                        width: 160,
                        height: 160,
                        objectFit: "contain",
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: 8,
                        background: "#fff",
                      }}
                    />
                  ) : null}
                </div>

                <label>
                  <div style={{ marginBottom: 6 }}>Team Mascots</div>
                  <textarea
                    value={teamForm.mascotsText}
                    onChange={(e) => setTeamForm((prev) => ({ ...prev, mascotsText: e.target.value }))}
                    placeholder={"One per line: Mascot Name|Image URL"}
                    style={{ width: "100%", padding: 10, minHeight: 120 }}
                  />
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={teamForm.is_active}
                    onChange={(e) => setTeamForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  />
                  Active
                </label>

                <div style={{ display: "flex", gap: 12 }}>
                  <button type="submit" style={{ padding: "10px 14px" }}>
                    {editingTeamId ? "Save Team" : "Create Team"}
                  </button>
                  <button type="button" onClick={resetTeamForm} style={{ padding: "10px 14px" }}>
                    Clear
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Schools",
  icon: MagnifyingGlass,
  rank: 2,
})

export const handle = {
  breadcrumb: () => "Schools",
}

export default SchoolsAdminPage