import { model } from "@medusajs/framework/utils"

export const School = model.define("school", {
  id: model.id().primaryKey(),
  city_id: model.text(),
  school_name: model.text(),
  slug: model.text().unique(),
  level: model.text(),
  website_url: model.text().nullable(),
  primary_contact_email: model.text().nullable(),
  physical_address: model.text().nullable(),
  is_active: model.boolean().default(true),
})
