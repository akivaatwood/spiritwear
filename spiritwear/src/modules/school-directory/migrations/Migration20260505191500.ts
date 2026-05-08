import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260505191500 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "design_overlay" ("id" text not null, "name" text not null, "slug" text not null, "image_url" text null, "category" text null, "is_active" boolean not null default true, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "design_overlay_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_design_overlay_slug_unique" ON "design_overlay" ("slug") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_design_overlay_deleted_at" ON "design_overlay" ("deleted_at") WHERE deleted_at IS NULL;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "design_overlay" cascade;`)
  }
}
