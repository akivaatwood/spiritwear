import { model } from "@medusajs/framework/utils"

export const SchoolMascot = model.define("school_mascot", {
  id: model.id().primaryKey(),
  school_id: model.text(),
  mascot_name: model.text(),
  image_url: model.text().nullable(),
  is_primary: model.boolean().default(false),
  is_official: model.boolean().default(false),
})
