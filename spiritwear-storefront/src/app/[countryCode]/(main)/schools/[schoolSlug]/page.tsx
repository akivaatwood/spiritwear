import { getSchool } from "../../../../../lib/school-directory"

type PageProps = {
  params: Promise<{ countryCode: string; schoolSlug: string }>
}

export default async function SchoolPage({ params }: PageProps) {
  const { schoolSlug } = await params
  const data = await getSchool(schoolSlug)
  const school = data.school

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold">{school.school_name}</h1>
      <p className="mt-2 text-gray-600">
        {school.level === "high_school" ? "High School" : "College"}
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">School Colors</h2>
        <div className="flex flex-wrap gap-3">
          {(school.colors || []).map((color: any) => (
            <div key={color.id} className="rounded border p-3">
              <div
                className="mb-2 h-8 w-20 rounded border"
                style={{ backgroundColor: color.hex_value || "#eee" }}
              />
              <div className="text-sm">{color.color_name}</div>
              <div className="text-xs text-gray-500">{color.hex_value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">School Mascots</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(school.mascots || []).map((mascot: any) => (
            <div key={mascot.id} className="rounded border p-4">
              {mascot.image_url ? (
                <img
                  src={mascot.image_url}
                  alt={mascot.mascot_name}
                  className="mb-3 h-32 w-full rounded object-contain"
                />
              ) : null}
              <div className="font-medium">{mascot.mascot_name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Teams</h2>
        <div className="space-y-4">
          {(school.teams || []).map((team: any) => (
            <div key={team.id} className="rounded border p-4">
              <div className="text-lg font-semibold">{team.team_name}</div>
              <div className="text-sm text-gray-600">
                {team.sport?.sport_name || "Unknown sport"}
                {team.gender ? ` · ${team.gender}` : ""}
                {team.team_level ? ` · ${team.team_level}` : ""}
              </div>

              {!!team.colors?.length && (
                <div className="mt-3">
                  <div className="mb-1 text-sm font-medium">Team Colors</div>
                  <div className="flex flex-wrap gap-2">
                    {team.colors.map((color: any) => (
                      <div key={color.id} className="rounded border px-2 py-1 text-sm">
                        {color.color_name} {color.hex_value ? `(${color.hex_value})` : ""}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!!team.mascots?.length && (
                <div className="mt-3">
                  <div className="mb-1 text-sm font-medium">Team Mascots</div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {team.mascots.map((mascot: any) => (
                      <div key={mascot.id} className="rounded border p-3">
                        {mascot.image_url ? (
                          <img
                            src={mascot.image_url}
                            alt={mascot.mascot_name}
                            className="mb-2 h-24 w-full object-contain"
                          />
                        ) : null}
                        <div className="text-sm font-medium">{mascot.mascot_name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}