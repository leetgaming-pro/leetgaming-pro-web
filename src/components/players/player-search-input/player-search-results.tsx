import React, { Key, SetStateAction, useMemo, useState } from "react";
import { Avatar, BreadcrumbItem, Breadcrumbs, Button, Chip, Listbox, ListboxItem, ListboxSection, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Spacer } from "@nextui-org/react";
import { SteamIcon } from "@/components/icons";
// import { resultsJson } from "./data"; 

const resultsJson = {
    "players": {
        typeDescription: "Players",
        results: [
            { id: "1", nickname: "sound", avatar: "https://avatars.githubusercontent.com/u/3760203?v=4", type: "Owner", role: "AWPER" }, // Role: ??? AWPER, Lurker etc?
            { id: "2", nickname: "sound", avatar: "https://avatars.githubusercontent.com/u/3760203?v=4", type: "Owner", role: "AWPER" }, // Role: ??? AWPER, Lurker etc?
            { id: "3", nickname: "sound", avatar: "https://avatars.githubusercontent.com/u/3760203?v=4", type: "Owner", role: "AWPER" }, // Role: ??? AWPER, Lurker etc?
            { id: "4", nickname: "sound", avatar: "https://avatars.githubusercontent.com/u/3760203?v=4", type: "Owner", role: "AWPER" }, // Role: ??? AWPER, Lurker etc?
            { id: "5", nickname: "sound", avatar: "https://avatars.githubusercontent.com/u/3760203?v=4", type: "Owner", role: "AWPER" }, // Role: ??? AWPER, Lurker etc?
        ],
    }
};

export type ResourceSearchResult = {
    id: string;
    nickname: string;
    avatar: string;
    role: string;
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
                                        {results.map((player: ResourceSearchResult) => (
                                            <ListboxItem startContent={<SteamIcon height={40} width={40} style={{ borderRadius: "1.5em", padding: "0.2em" }} />} onClick={onPress} key={player.id}>{`${player.nickname} - ${player.role}`}</ListboxItem>
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
