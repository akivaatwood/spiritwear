import { model } from "@medusajs/framework/utils"

export const City = model.define("school_city", {
  id: model.id().primaryKey(),
  state_id: model.text(),
  city_name: model.text(),
  slug: model.text(),
})
