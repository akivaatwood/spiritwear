import { model } from "@medusajs/framework/utils"

export const State = model.define("school_state", {
  id: model.id().primaryKey(),
  country_code: model.text().default("US"),
  state_code: model.text(),
  state_name: model.text(),
  slug: model.text().unique(),
})
