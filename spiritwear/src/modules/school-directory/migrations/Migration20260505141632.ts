import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260505141632 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "school_team" drop constraint if exists "school_team_slug_unique";`);
    this.addSql(`alter table if exists "school_state" drop constraint if exists "school_state_slug_unique";`);
    this.addSql(`alter table if exists "school_sport" drop constraint if exists "school_sport_slug_unique";`);
    this.addSql(`alter table if exists "school" drop constraint if exists "school_slug_unique";`);
    this.addSql(`create table if not exists "school" ("id" text not null, "city_id" text not null, "school_name" text not null, "organization_name" text null, "organization_type" text not null default 'school', "slug" text not null, "level" text null, "website_url" text null, "primary_contact_email" text null, "physical_address" text null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "school_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_school_slug_unique" ON "school" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_school_deleted_at" ON "school" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "school_city" ("id" text not null, "state_id" text not null, "city_name" text not null, "slug" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "school_city_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_school_city_deleted_at" ON "school_city" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "school_color" ("id" text not null, "school_id" text not null, "color_name" text not null, "hex_value" text null, "is_primary" boolean not null default false, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "school_color_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_school_color_deleted_at" ON "school_color" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "school_mascot" ("id" text not null, "school_id" text not null, "mascot_name" text not null, "image_url" text null, "is_primary" boolean not null default false, "is_official" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "school_mascot_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_school_mascot_deleted_at" ON "school_mascot" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "school_sport" ("id" text not null, "sport_name" text not null, "slug" text not null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "school_sport_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_school_sport_slug_unique" ON "school_sport" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_school_sport_deleted_at" ON "school_sport" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "school_state" ("id" text not null, "country_code" text not null default 'US', "state_code" text not null, "state_name" text not null, "slug" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "school_state_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_school_state_slug_unique" ON "school_state" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_school_state_deleted_at" ON "school_state" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "school_team" ("id" text not null, "school_id" text not null, "sport_id" text not null, "team_name" text not null, "slug" text not null, "gender" text null, "team_level" text null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "school_team_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_school_team_slug_unique" ON "school_team" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_school_team_deleted_at" ON "school_team" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "school_team_color" ("id" text not null, "school_team_id" text not null, "color_name" text not null, "hex_value" text null, "is_primary" boolean not null default false, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "school_team_color_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_school_team_color_deleted_at" ON "school_team_color" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "school_team_mascot" ("id" text not null, "school_team_id" text not null, "mascot_name" text not null, "image_url" text null, "is_primary" boolean not null default false, "is_official" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "school_team_mascot_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_school_team_mascot_deleted_at" ON "school_team_mascot" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "school" cascade;`);

    this.addSql(`drop table if exists "school_city" cascade;`);

    this.addSql(`drop table if exists "school_color" cascade;`);

    this.addSql(`drop table if exists "school_mascot" cascade;`);

    this.addSql(`drop table if exists "school_sport" cascade;`);

    this.addSql(`drop table if exists "school_state" cascade;`);

    this.addSql(`drop table if exists "school_team" cascade;`);

    this.addSql(`drop table if exists "school_team_color" cascade;`);

    this.addSql(`drop table if exists "school_team_mascot" cascade;`);
  }

}
