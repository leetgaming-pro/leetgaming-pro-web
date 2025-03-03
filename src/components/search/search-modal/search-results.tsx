import React, { Key, SetStateAction, useMemo, useState } from "react";
import { Avatar, BreadcrumbItem, Breadcrumbs, Button, Chip, Listbox, ListboxItem, ListboxSection, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Spacer } from "@nextui-org/react";
import { SteamIcon } from "@/components/icons";
import TeamAvatar from "@/components/console-layout/team-avatar";
import ViewPlayerInfoCard from "@/components/replay/game-events/playercard/view-player-info-card";
// import { resultsJson } from "./data"; 

const resultsJson = {
    "GameEvent": {
        typeDescription: "Highlights",
        results: [
            {
                href: "/match/73098213018002179/round/5/highlights/ClutchSituation?types=[1v5]&status=clutch_won&player=sound",
                breadcrumb: () => (
                    <Breadcrumbs
                        itemClasses={{
                            item: "px-0",
                            separator: "px-0",
                        }}
                    >
                        <BreadcrumbItem href="/match/73098213018002179"><Chip variant="dot" color="danger">730...2179</Chip> Match</BreadcrumbItem>
                        <BreadcrumbItem href="/match/73098213018002179/round/5"><Chip variant="faded">#5</Chip> Round <TeamAvatar
                            classNames={{
                                base: "border-1 border-primary-foreground/20",
                                name: "text-primary-foreground/80",
                            }}
                            name="C T" /></BreadcrumbItem>
                        <BreadcrumbItem href="/match/73098213018002179/round/5/highlights/ClutchSituation?types=[1v5]"><Chip variant="faded">1v5</Chip> Clutch Situation</BreadcrumbItem>
                        <BreadcrumbItem href="/match/73098213018002179/round/5/highlights/ClutchSituation?types=[1v5]&status=clutch_won">Status: <code>clutch_won</code></BreadcrumbItem>
                        <BreadcrumbItem
                            classNames={{
                                item: "px-0",
                            }}
                        >
                            <Avatar size="sm"></Avatar>
                        </BreadcrumbItem>
                    </Breadcrumbs>
                ),
            },
            {
                href: "/match/73098213018002179/round/5/highlights/ClutchSituation?types=[1v5]&status=clutch_won&player=sound",
                breadcrumb: () => (
                    <Breadcrumbs
                        itemClasses={{
                            item: "px-0",
                            separator: "px-0",
                        }}
                    >
                        <BreadcrumbItem href="/match/73098213018002179"><Chip variant="dot" color="danger">730...2179</Chip> Match</BreadcrumbItem>
                        <BreadcrumbItem href="/match/73098213018002179/round/5"><Chip variant="faded">#5</Chip> Round <TeamAvatar
                            classNames={{
                                base: "border-1 border-primary-foreground/20",
                                name: "text-primary-foreground/80",
                            }}
                            name="C T" /></BreadcrumbItem>
                        <BreadcrumbItem href="/match/73098213018002179/round/5/highlights/ClutchSituation?types=[1v5]"><Chip variant="faded">1v5</Chip> Clutch Situation</BreadcrumbItem>
                        <BreadcrumbItem href="/match/73098213018002179/round/5/highlights/ClutchSituation?types=[1v5]&status=clutch_won">Status: <code>clutch_won</code></BreadcrumbItem>
                        <BreadcrumbItem
                            classNames={{
                                item: "px-0",
                            }}
                        >
                            <Avatar size="sm"></Avatar>
                        </BreadcrumbItem>
                    </Breadcrumbs>
                ),
            },
        ],
    },
    "Match": {
        typeDescription: "Match",
        results: [
            {
                href: "/match/73098213018002179/round/5/highlights/ClutchSituation?types=[1v5]&status=clutch_won&player=sound",
                breadcrumb: () => (
                    <Breadcrumbs
                        itemClasses={{
                            item: "px-0",
                            separator: "px-0",
                        }}
                    >
                        <BreadcrumbItem href="/match/73098213018002179"><Chip variant="dot" color="danger">730...2179</Chip> Match</BreadcrumbItem>
                        <BreadcrumbItem href="/match/73098213018002179/round/5"><Chip variant="faded">#5</Chip> Round <TeamAvatar
                            classNames={{
                                base: "border-1 border-primary-foreground/20",
                                name: "text-primary-foreground/80",
                            }}
                            name="C T" /></BreadcrumbItem>
                        <BreadcrumbItem href="/match/73098213018002179/round/5/highlights/ClutchSituation?types=[1v5]"><Chip variant="faded">1v5</Chip> Clutch Situation</BreadcrumbItem>
                        <BreadcrumbItem href="/match/73098213018002179/round/5/highlights/ClutchSituation?types=[1v5]&status=clutch_won">Status: <Chip variant="faded" color="success"><code>clutch_won</code></Chip></BreadcrumbItem>
                        <BreadcrumbItem
                            classNames={{
                                item: "px-0",
                            }}
                        >
                            Player: <code>sound</code>
                        </BreadcrumbItem>
                    </Breadcrumbs>
                ),
            },
            {
                href: "/match/73098213018002179&player=sound",
                breadcrumb: () => (
                    <Breadcrumbs
                        itemClasses={{
                            item: "px-0",
                            separator: "px-0",
                        }}
                    >
                        <BreadcrumbItem href="/match/73098213018002179"><Chip variant="dot" color="danger">730...2179</Chip> Match</BreadcrumbItem>
                        <BreadcrumbItem
                            classNames={{
                                item: "px-0",
                            }}
                        >

                            <Popover showArrow placement="bottom">
                                <PopoverTrigger>
                                    <span className="text-primary ml-1">Player: <code>@sound</code></span>
                                </PopoverTrigger>
                                <PopoverContent className="p-1">
                                    <ViewPlayerInfoCard />
                                </PopoverContent>
                            </Popover>

                            
                        </BreadcrumbItem>
                    </Breadcrumbs>
                ),
            },
        ],
    },
};

export type ResourceSearchResult = {
    href: string;
    breadcrumb: any;
};

const SearchResults = ({ onPress }: any) => {
    const resultsMap: Record<string, any> = resultsJson
    const resourceResultTypes = Object.keys(resultsMap)

    return (
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
            <>
                <div>
                    <ScrollShadow className="w-full h-[400px]">
                        <Listbox
                            label="Results found"
                            selectionMode="single"
                        >
                            {resourceResultTypes.map((tKey: string) => {
                                const { typeDescription, results } = resultsMap[tKey];

                                return (
                                    <ListboxSection key={tKey} title={typeDescription}>
                                        {results.map((resource: ResourceSearchResult) => (
                                            <ListboxItem startContent={<SteamIcon height={40} width={40} style={{ borderRadius: "1.5em", padding: "0.2em" }} />} onClick={onPress} key={resource.href}>{resource.breadcrumb()}</ListboxItem>
                                        ))}
                                    </ListboxSection>
                                );
                            })}

                        </Listbox>
                    </ScrollShadow>
                </div>
            </>
            {/* {selectedCategory && (
        <>
          <div>
            <Listbox
              items={[
                GameEventVariationsMaitem].emptySelectionPlaceholder,
                ...GameEventVariationsMaitem].variations
              ]}
              // selectedKeys={[selectedVariation] as Key[] || [GameEventVariationsMaitem].emptySelectionPlaceholder] as Key[]}
              onSelectionChange={handleVariationChange}
              // labelPlacement="outside"
              label="Variation"
              selectionMode="multiple"
            >
              {(item) => (
                <ListboxItem key={item} value={item}>
                  {item}
                </ListboxItem>
              )}
            </Listbox>
          </div>

          <div>
            {selectedVariation && selectedVariation !== GameEventVariationsMaitem].emptySelectionPlaceholder && (
              <Listbox
                items={Object.values(GameEventVariationsMaitem].variations)}
                // value={selectedValue}
                // selectedKeys={[selectedValue] as Key[]}
                onSelectionChange={handleValueChange}
                // labelPlacement="outside"
                label="Value"
              >
                {(item) => (
                  <ListboxItem key={item} value={item} textValue={item.toString()}>
                    {item.toString()}
                  </ListboxItem>
                )}
              </Listbox>
            )}
          </div>
        </>
      )} */}
            {/* <div className="col-span-full">
        {badgeContent} 
      </div> */}
        </div>
    );
};

export default SearchResults;
