import { ExecArgs } from "@medusajs/framework/types"
import { SCHOOL_DIRECTORY_MODULE } from "../modules/school-directory"

export default async function seedSchoolDirectory({ container }: ExecArgs) {
  const service = container.resolve(SCHOOL_DIRECTORY_MODULE)

  const [texas] = await service.createStates([
    {
      country_code: "US",
      state_code: "TX",
      state_name: "Texas",
      slug: "texas",
    },
  ])

  const [dallas] = await service.createCities([
    {
      state_id: texas.id,
      city_name: "Dallas",
      slug: "dallas",
    },
  ])

  const [football] = await service.createSports([
    {
      sport_name: "Football",
      slug: "football",
      is_active: true,
    },
  ])

  const [school] = await service.createSchools([
    {
      city_id: dallas.id,
      school_name: "Central High School",
      organization_name: "Central High School",
      organization_type: "school",
      slug: "central-high-school-dallas-tx",
      level: "high_school",
      is_active: true,
    },
  ])

  await service.createSchools([
    {
      city_id: dallas.id,
      school_name: "Dallas Fire Department",
      organization_name: "Dallas Fire Department",
      organization_type: "fire_department",
      slug: "dallas-fire-department",
      level: null,
      is_active: true,
    },
    {
      city_id: dallas.id,
      school_name: "Dallas Police Department",
      organization_name: "Dallas Police Department",
      organization_type: "police_department",
      slug: "dallas-police-department",
      level: null,
      is_active: true,
    },
  ])

  await service.createSchoolColors([
    {
      school_id: school.id,
      color_name: "Blue",
      hex_value: "#0033A0",
      is_primary: true,
      sort_order: 1,
    },
    {
      school_id: school.id,
      color_name: "White",
      hex_value: "#FFFFFF",
      is_primary: false,
      sort_order: 2,
    },
  ])

  await service.createSchoolMascots([
    {
      school_id: school.id,
      mascot_name: "Eagles",
      image_url: "https://cdn.example.com/mascots/eagles.png",
      is_primary: true,
      is_official: true,
    },
  ])

  const [team] = await service.createSchoolTeams([
    {
      school_id: school.id,
      sport_id: football.id,
      team_name: "Central Eagles Football",
      slug: "central-high-school-dallas-tx-football-varsity",
      gender: "boys",
      team_level: "varsity",
      is_active: true,
    },
  ])

  await service.createSchoolTeamColors([
    {
      school_team_id: team.id,
      color_name: "Navy",
      hex_value: "#001F5B",
      is_primary: true,
      sort_order: 1,
    },
    {
      school_team_id: team.id,
      color_name: "Silver",
      hex_value: "#C0C0C0",
      is_primary: false,
      sort_order: 2,
    },
  ])

  await service.createSchoolTeamMascots([
    {
      school_team_id: team.id,
      mascot_name: "War Eagles",
      image_url: "https://cdn.example.com/mascots/war-eagles.png",
      is_primary: true,
      is_official: true,
    },
  ])

  await service.createDesignOverlays([
    {
      name: "Vintage Script",
      slug: "vintage-script",
      category: "Vintage",
      image_url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-vintage-front.png",
      is_active: true,
      sort_order: 0,
    },
    {
      name: "Patriotic Badge",
      slug: "patriotic-badge",
      category: "Patriotic",
      image_url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/hoodie-blue-front.png",
      is_active: true,
      sort_order: 1,
    },
  ])

  console.log("Seeded organization directory")
}
