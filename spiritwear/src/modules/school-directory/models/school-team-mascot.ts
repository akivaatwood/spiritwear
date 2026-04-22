import { model } from "@medusajs/framework/utils"

export const SchoolTeamMascot = model.define("school_team_mascot", {
  id: model.id().primaryKey(),
  school_team_id: model.text(),
  mascot_name: model.text(),
  image_url: model.text().nullable(),
  is_primary: model.boolean().default(false),
  is_official: model.boolean().default(false),
})
