import { MedusaService } from "@medusajs/framework/utils"
import { State } from "./models/state"
import { City } from "./models/city"
import { Sport } from "./models/sport"
import { School } from "./models/school"
import { SchoolColor } from "./models/school-color"
import { SchoolMascot } from "./models/school-mascot"
import { SchoolTeam } from "./models/school-team"
import { SchoolTeamColor } from "./models/school-team-color"
import { SchoolTeamMascot } from "./models/school-team-mascot"
import { DesignOverlay } from "./models/design-overlay"

class SchoolDirectoryModuleService extends MedusaService({
  State,
  City,
  Sport,
  School,
  SchoolColor,
  SchoolMascot,
  SchoolTeam,
  SchoolTeamColor,
  SchoolTeamMascot,
  DesignOverlay,
}) {}

export default SchoolDirectoryModuleService
