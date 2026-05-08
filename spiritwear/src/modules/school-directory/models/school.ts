import { model } from "@medusajs/framework/utils"

export const School = model.define("school", {
  id: model.id().primaryKey(),
  city_id: model.text(),
  school_name: model.text(),
  organization_name: model.text().nullable(),
  organization_type: model.text().default("school"),
  slug: model.text().unique(),
  level: model.text().nullable(),
  website_url: model.text().nullable(),
  primary_contact_email: model.text().nullable(),
  physical_address: model.text().nullable(),
  is_active: model.boolean().default(true),
})
