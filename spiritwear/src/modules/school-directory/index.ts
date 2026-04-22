import SchoolDirectoryModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const SCHOOL_DIRECTORY_MODULE = "schoolDirectory"

export default Module(SCHOOL_DIRECTORY_MODULE, {
  service: SchoolDirectoryModuleService,
})
