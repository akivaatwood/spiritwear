import SchoolDirectoryModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const ORGANIZATION_DIRECTORY_MODULE = "organizationDirectory"
export const SCHOOL_DIRECTORY_MODULE = ORGANIZATION_DIRECTORY_MODULE

export default Module(SCHOOL_DIRECTORY_MODULE, {
  service: SchoolDirectoryModuleService,
})
