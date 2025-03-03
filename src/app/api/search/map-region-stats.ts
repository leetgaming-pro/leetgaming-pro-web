import { logger } from "@/lib/logger"
import { ResultOptions, RouteBuilder } from "@/types/replay-api/replay-api.route-builder"
import { CSFilters, MapRegionData } from "@/types/replay-api/searchable"
import { ReplayApiResourceType, ReplayApiSettingsMock } from "@/types/replay-api/settings"
import { MapRegionStats } from "@/types/replay-api/stats.types"

export const fetchMapRegionStats: MapRegionStats = async (filter: CSFilters, resultOptions?: ResultOptions)
  : Promise<MapRegionData | undefined> => {
  const builder = new RouteBuilder(ReplayApiSettingsMock, logger)

  const mapRegionData = await builder
    .withFilter(filter)
    .get<MapRegionData>(ReplayApiResourceType.MapRegionStats, resultOptions)


  return mapRegionData
}

