import { model } from "@medusajs/framework/utils"

export const DesignOverlay = model.define("design_overlay", {
  id: model.id().primaryKey(),
  name: model.text(),
  slug: model.text().unique(),
  image_url: model.text().nullable(),
  category: model.text().nullable(),
  is_active: model.boolean().default(true),
  sort_order: model.number().default(0),
})
