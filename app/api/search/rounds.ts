import { Loggable, logger } from "@/lib/logger";
import { ResultOptions, RouteBuilder } from "@/types/replay-api/replay-api.route-builder";
import { EmptyFilter, CSFilters, RoundData } from "@/types/replay-api/searchable";
import { ReplayApiResourceType, ReplayApiSettingsMock } from "@/types/replay-api/settings";


export const getContextValue = (context: any, key: string): any[] | undefined | null => {
    const parameterValue = context.params[key] || context.query[key] || context.body[key] || context[key];

    if (parameterValue === null || parameterValue === undefined) {
        return null;
    }

    if (Array.isArray(parameterValue)) {
        return parameterValue;
    }

    return [parameterValue];
}

// { notFound: true; props?: undefined; } | { props: { roundData: RoundData | undefined; }; notFound?: undefined; }
//: (context: any) => Promise<{ notFound: true; props?: undefined; } | { props: { roundData: RoundData | undefined; }; notFound?: undefined; }>
export const getServerSideProps = async (context: any) => {
  const filterPropsKeys = Object.keys(EmptyFilter)

  const queryFilter = filterPropsKeys.reduce((acc, curr) => {
    const inputValue = getContextValue(context, curr);

    if (inputValue !== null && inputValue !== undefined && inputValue.length) {
        acc[curr] = inputValue;
    }

    return acc
  }, {} as any);

  if (!queryFilter || !Object.keys(queryFilter).length) {
    console.log('No parameters provided');
    return { notFound: true };
  }

  const roundData = await fetchRoundData(queryFilter);
    // if (roundData.error) {
    //   // TODO: error handling
    //     console.error('Error fetching round data:', roundData.error);
    //     return { notFound: true };
    // }


  return { props: { roundData } };
};

export const fetchRoundData = async (filter: CSFilters, resultOptions?: ResultOptions): Promise<RoundData | undefined> => {
  const builder = new RouteBuilder(ReplayApiSettingsMock, logger)

  const roundData = await builder.withFilter(filter)
    .get<RoundData>(ReplayApiResourceType.Round, resultOptions)
    .catch((e) => {
      (logger as Loggable).error(e, 'error fetching ', JSON.stringify(filter))
      return {} as RoundData
    })

  return roundData

  // const battleStats = endpoint.get(ReplayApiResourceType.BattleStats)
  // const economy = endpoint.get(ReplayApiResourceType.Economy)
  // const events = endpoint.get(ReplayApiResourceType.Event)
  // const highlights = endpoint.get(ReplayApiResourceType.Highlight)
  // const mapRegionStats = endpoint.get(ReplayApiResourceType.MapRegionStats)
  // const positioning = endpoint.get(ReplayApiResourceType.Positioning)
  // const strategy = endpoint.get(ReplayApiResourceType.Strategy)
  // const utility = endpoint.get(ReplayApiResourceType.Utility)


  // const ctoken = await fetch(accountsApiRoute + '/onboard/steam', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     v_hash: req.body.v_hash,
  //     steam: {
  //       id: req.body.steam_id,
  //     },
  //   }),
  // });

  // if (!ctoken.ok) {
  //   return res.status(ctoken.status).json(await ctoken.json());
  // }

  // const { user_id: uid, resource_owner: rid } = await ctoken.json().then((data) => {
  //   return res.json(data);
  // })


  // res.json({ uid, rid });
}