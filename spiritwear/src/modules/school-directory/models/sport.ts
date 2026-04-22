import { model } from "@medusajs/framework/utils"

export const Sport = model.define("school_sport", {
  id: model.id().primaryKey(),
  sport_name: model.text(),
  slug: model.text().unique(),
  is_active: model.boolean().default(true),
})
