import { model } from "@medusajs/framework/utils"

export const SchoolTeamColor = model.define("school_team_color", {
  id: model.id().primaryKey(),
  school_team_id: model.text(),
  color_name: model.text(),
  hex_value: model.text().nullable(),
  is_primary: model.boolean().default(false),
  sort_order: model.number().default(0),
})
