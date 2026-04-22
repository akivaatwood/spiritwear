import { model } from "@medusajs/framework/utils"

export const SchoolColor = model.define("school_color", {
  id: model.id().primaryKey(),
  school_id: model.text(),
  color_name: model.text(),
  hex_value: model.text().nullable(),
  is_primary: model.boolean().default(false),
  sort_order: model.number().default(0),
})
