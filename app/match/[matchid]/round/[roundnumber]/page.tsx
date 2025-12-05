"use client"

import { Card, CardBody, CardFooter, CardHeader } from '@nextui-org/card';
import { Button, ButtonGroup, Switch, Tab, Tabs } from '@nextui-org/react';
import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import MatchTimelineHorizontalFull from '@/components/replay/replay-file-item-timeline/match-h-timeline-full';
import { CSFilters, MapViewModeType } from '@/types/replay-api/searchable';

export type SizeOption = 'sm' | 'md' | 'lg'

export default function RoundPage() {
  const params = useParams();
  const matchId = params.matchid as string;
  const roundNumber = params.roundnumber as string;

  // Derive filter from URL params
  const filter = useMemo<CSFilters>(() => ({
    gameIds: 'cs2',
    matchIds: matchId,
    roundNumbers: roundNumber,
  }), [matchId, roundNumber]);

  const size: SizeOption = 'md';

  const [mapViewModes, setMapViewModes] = useState<MapViewModeType[]>([MapViewModeType.MapTrajectoriesLayer])

  return (
    <div className="round-page">
      <Card>
        <CardHeader className="backdrop-blur">
          <div className="flex">
            {/*  Overall Timeline [partial results?user config?]  mapViewModes={mapViewModes}  */}
            <MatchTimelineHorizontalFull filter={filter} size={size} /> 
          </div>
          <div className="flex">
            <div>
              {/* <BattleStats compact upstreamResultReader="lazy" selectedSidesCT_T="CT" {...filterProps} /> */}
            </div>
            <div>
              {/* <BattleStats compact upstreamResultReader="lazy" selectedSidesCT_T="T"  {...filterProps} /> */}
            </div>
          </div>

          {/*  Map and Layers */}
          <div className="map-container">
            {/* {mapViewModes.includes(ViewModeType.HeatmapLayer) && <HeatmapLayer heatmapData={roundData.heatmapData} {...filterProps} />}
            {mapViewModes.includes(ViewModeType.MapRegionsLayer) && <MapRegionsLayer {...filterProps} />}
            {mapViewModes.includes(ViewModeType.MapStrategiesLayer) && <MapStrategiesLayer {...filterProps} />}
            {mapViewModes.includes(ViewModeType.MapTrajectoriesLayer) && <MapTrajectoriesLayer
              utilityTrajectories={{ utilityIcon: "lg", utilityType: "all", utilityColor: "team", destinationPreview: { type: "dashed/none", opacity: 0.5 } }}
              playerTrajectories={{ playerIcon: "lg", playerColor: "team" }}
              lineOfSight={{ length: "colision", lineOfSightColor: "team", lineOfSightOpacity: 0.5, lineOfSightWidth: 2, lineOfSightType: "hover" }}
              visionCones={{ coneVisionColor: "team", coneVisionOpacity: 0.5, coneVisionWidth: 2, coneVisionType: "hover" }}
              {...filterProps} />}
            {mapViewModes.includes(ViewModeType.MapFragsLayer) && <MapFragsLayer fraggingIcon={{ type: "avatar" }} fraggedIcon={{ type: "heatmap" }} {...filterProps} />} */}
            {/* {mapViewModes.includes('objectives') &&   */}
            {/* {mapViewModes.includes('smokes') &&   */}
            {/* {mapViewModes.includes('infernos') &&   */}
            {/* {mapViewModes.includes('projectiles') &&   */}
            {/* {mapViewModes.includes('items') &&   */}

            {/* View Mode Controls */}
            <div className="view-controls">
              <div className="flex">
                <Switch
                  defaultSelected
                  size="sm"
                  color="secondary"
                  
                  // thumbIcon={({ isSelected, className }) =>
                  //   isSelected ? (
                  //     <AdjustmentsIcon className={className} />
                  //   ) : (
                  //     <GlobeIcon className={className} />
                  //   )
                  // }
                >
                  Toggle Filter
                </Switch>

                <ButtonGroup isDisabled>
                  {mapViewModes.map((mode: MapViewModeType, idx: number) => {
                    return (<Button key={idx}>{mode}</Button>)
                  })}
                </ButtonGroup>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Tabs>
            <Tab key="match-vertical-timeline-tab" title="Timeline">
              {/* Events With time column */}
              {/* <MatchVerticalTimeline {...filterProps} /> */}
            </Tab>

            <Tab key="match-highlights-tab" title="Highlights">
              {/* TODO: reutilizar o componente de highlights sm expandido ou criar um de size=lg */}
              {/* <Highlights {...filterProps} /> */}
            </Tab>

            <Tab key="match-scoreboard" title="Scoreboard">
              <div className="grid grid-cols-1 my-2 items-center">
                <div>
                  {/* TODO: colocar primeiro o {team/group/player}-scope, se filtrado, senao segue round-scope */}
                  {/* <BattleStats table upstreamResultReader="cache" selectedSidesCT_T="CT" {...filterProps} /> */}
                </div>
                <div>
                  {/* TODO: colocar primeiro o time/player, se filtrado. (2) */}
                  {/* <BattleStats table upstreamResultReader="cache" selectedSidesCT_T="T"  {...filterProps} /> */}
                </div>
              </div>
            </Tab>

            <Tab key="match-loadout-tab" title="Loadout">
              {/* Toggle Player x Player, Table/Summary view */}
              {/* FlameGraph!!! (use different view approach(**), ie: group vest, utility etc) */}
            </Tab>

            <Tab key="match-tendency-tab advanced" title="Tendency">
              {/* Gauge: Objective */}                      
              {/* FlameGraph? */}
              {/* Dashboard >> Spider
                  Spider1: Anchor Objectives (ie: execb, distribute intensity)
                  Spider2: Frag Distribution
                  Spider3: Economy Distribution
              */}
            </Tab>

            <Tab key="match-mvp" title="MVP">
              
            </Tab>

            <Tab key="match-strategy-tab" className="lt-advanced" title="Strategy">
              {/* Bars: Objectives Breakdown horizontal (**** TODO: linkar com existente ***) */}                      
              {/* FlameGraph!! Yes! Breakdown/Group by team, areas, players, objectives */}
              {/* Dashb/Funnel? Yes! effectivenes (todo: linkar com existente) */}
              {/* Positioning Timeline */}
              {/* Toggle "MVT" (tactic x impact) */}
            </Tab>

            <Tab key="match-economy-tab" className="lt-advanced" title="Economy">
              {/* Dashboard 
                  Volume/Lines Accumulation Graph (togle team x team, player x player)
                  Doughnut: Economy Incomes (toggle team, toggle players)
                  Doughnut: Economy Redistribution (players only)
                  Doughnut: Loadout ROI by ItemType (toggle team, toggle players)
                  Flamegraph: Loadout ROI by item (toggle team, toggle players)
              */}
            </Tab>

            <Tab key="match-anonym-mem-profiles-tab" className="lt-advanced" title="Anonymized Mem.Profiles">
              {/* *** Annonymized Flamegraph *** 
                TODO: toggle Servers / Players
              */}
            </Tab>

            <Tab key="match-events-tab" className="lt-advanced" title="Logs">
              {/* <GameEventsList dem json embedCode={['sm', 'md', 'lg']} {...filterProps} onEventClick={(e) => toggleEventFilter(filterProps, e) } /> */}
            </Tab>
          </Tabs>
        </CardBody>
        <CardFooter className="backdrop-blur">
          {/* 
          <IntegrationNav cli api app webhook automations> 
            ie: "Integrate this event", show apps (ie: "slack/Discord/Jira/Github/Notion")
          </IntegrationNav>
          <StorageNav showUsage dem json />
          <ShareNav />
          <AINav prompt suggestions/> 
          */}
        </CardFooter>
      </Card>


      {/* Editor Mode Controls */}
      <div className="edit-controls">
        <div className="flex">
            {/* Strategy/Region Edit + (Optional) + Integrator for Weighting/ThirdParties/HotPickMinter(* procurar forma de reverter para o player, se o outcome for positivo apenas, caso contrario, reversao para a outra parte?*), +  */}
            {/* Strat Edit (Collection/Archive), reusable */}
        </div>
      </div>


    </div>
  );
}
