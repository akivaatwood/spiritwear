import { model } from "@medusajs/framework/utils"

export const SchoolTeam = model.define("school_team", {
  id: model.id().primaryKey(),
  school_id: model.text(),
  sport_id: model.text(),
  team_name: model.text(),
  slug: model.text().unique(),
  gender: model.text().nullable(),
  team_level: model.text().nullable(),
  is_active: model.boolean().default(true),
})
