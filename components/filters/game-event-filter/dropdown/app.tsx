import React, { Key, SetStateAction, useMemo, useState } from "react";
import { Button, Chip, Listbox, ListboxItem, ListboxSection, ScrollShadow, Spacer } from "@nextui-org/react";
import { GameEventVariationsMap, GameEventCategoryOption } from "./data"; // Import your enums

const GameEventFilter: React.FC = () => {
  const categories: string[] = Object.keys(GameEventVariationsMap).map((key) => key.toString());
  const [selectedCategory, setSelectedCategory] = useState<GameEventCategoryOption | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handleCategoryChange = (value: GameEventCategoryOption | "all" | any) => {
    if (value === "all") {
      setSelectedCategory(null);
      setSelectedVariation(null);
      setSelectedValue(null);
      return;
    }

    setSelectedCategory(value);
    setSelectedVariation(null);
    setSelectedValue(null);
  };

  const handleVariationChange = (value: string | "all" | any) => {
    setSelectedVariation(value);
    setSelectedValue(null);
  };

  const handleValueChange = (value: string | "all" | any) => {
    setSelectedValue(value);
  };

  const addFilterToQuery = () => {
    // TODO: Implement filter query logic with selectedCategory, selectedVariation, selectedValue
  };

  const selectedBadges = useMemo(() => {
    if (!selectedVariation || !selectedValue) return null;
    return `${selectedVariation}: ${selectedValue}`;
  }, [selectedVariation, selectedValue]);

  const badgeContent = useMemo(() => {
    if (!selectedBadges) return null;

    return (
      <ScrollShadow
        hideScrollBar
        className="w-full flex py-0.5 px-2 gap-1"
        orientation="horizontal"
      >
        <Chip>{selectedBadges}</Chip>
      </ScrollShadow>
    );
  }, [selectedBadges]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
     <>
     <div>
     <ScrollShadow className="w-[150px] h-[400px]">
        <Listbox
          onSelectionChange={handleCategoryChange}
          label="Game Event"
          selectionMode="single"
        >
          {categories.map((item) => {
            const sectionKeyString = item?.toString().replace(" ", "") || "a";
            const sectionKey = item as keyof typeof GameEventVariationsMap;
            const section = GameEventVariationsMap[sectionKey];

            return (
              <ListboxSection key={sectionKeyString} title={section.description} showDivider>
                {section.variations?.map((variation) => (
                  <ListboxItem  key={sectionKeyString + variation.toString().replace(" ", "") + "1"}>{variation}</ListboxItem>
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
      <div className="flex justify-center">
        <Spacer y={1} />
        <Button onPress={addFilterToQuery} disabled={!selectedCategory}>
          Add Filter
        </Button>
      </div>

      <div className="col-span-full">
        {badgeContent}
      </div>
    </div>
  );
};

export default GameEventFilter;
