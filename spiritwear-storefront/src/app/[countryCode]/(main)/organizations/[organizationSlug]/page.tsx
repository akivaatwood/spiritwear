import { getOrganization } from "../../../../../lib/organization-directory"

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ countryCode: string; organizationSlug: string }>
}) {
  const { organizationSlug } = await params
  const data = await getOrganization(organizationSlug)
  const organization = data.organization

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">{organization.organization_name}</h1>
      <p className="mt-2 text-sm text-gray-600">
        {organization.organization_type === "fire_department"
          ? "Fire Department"
          : organization.organization_type === "police_department"
            ? "Police Department"
            : organization.level === "high_school"
              ? "High School"
              : "College"}
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Colors</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {(organization.colors || []).map((color: any) => (
            <div
              key={color.id}
              className="rounded border px-3 py-2 text-sm"
              style={{
                backgroundColor: color.hex_value || "#fff",
                color: color.hex_value ? "#111" : undefined,
              }}
            >
              {color.color_name}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Mascots</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {(organization.mascots || []).map((mascot: any) => (
            <div key={mascot.id} className="rounded border p-4">
              <div className="font-medium">{mascot.mascot_name}</div>
              {mascot.image_url ? (
                <img
                  src={mascot.image_url}
                  alt={mascot.mascot_name}
                  className="mt-3 h-32 w-full object-contain"
                />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {!!organization.groups?.length && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Groups</h2>
          <div className="mt-3 space-y-4">
            {organization.groups.map((group: any) => (
              <div key={group.id} className="rounded border p-4">
                <div className="text-lg font-semibold">{group.group_name}</div>
                <div className="mt-1 text-sm text-gray-600">
                  {group.activity_name || "General group"}
                  {group.gender ? ` · ${group.gender}` : ""}
                  {group.team_level ? ` · ${group.team_level}` : ""}
                </div>
                {!!group.mascots?.length && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {group.mascots.map((mascot: any) => (
                      <div key={mascot.id} className="rounded border p-4">
                        <div className="font-medium">{mascot.mascot_name}</div>
                        {mascot.image_url ? (
                          <img
                            src={mascot.image_url}
                            alt={mascot.mascot_name}
                            className="mt-3 h-32 w-full object-contain"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
