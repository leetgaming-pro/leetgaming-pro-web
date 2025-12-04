import { logger } from "@/lib/logger"
import { ResultOptions, RouteBuilder } from "@/types/replay-api/replay-api.route-builder"
import { CSFilters, MapRegionData } from "@/types/replay-api/searchable"
import { ReplayApiResourceType, ReplayApiSettingsMock } from "@/types/replay-api/settings"

/**
 * Fetch map region statistics from the API
 * @param filter CS game filters
 * @param resultOptions Optional pagination and sorting options
 * @returns Map region data or undefined
 */
export const fetchMapRegionStats = async (
  filter: CSFilters,
  resultOptions?: ResultOptions
): Promise<MapRegionData | undefined> => {
  const builder = new RouteBuilder(ReplayApiSettingsMock, logger)

  const mapRegionData = await builder
    .withFilter(filter)
    .get<MapRegionData>(ReplayApiResourceType.MapRegionStats, resultOptions)

  return mapRegionData
}

