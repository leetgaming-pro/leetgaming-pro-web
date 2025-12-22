import React, { useMemo, useState, useCallback } from "react";
import { Button, Chip, Listbox, ListboxItem, ListboxSection, ScrollShadow, Spacer } from "@nextui-org/react";
import { GameEventVariationsMap, GameEventCategoryOption } from "./data";

export interface GameEventFilterValue {
  category: GameEventCategoryOption;
  variation: string | null;
  value: string | null;
}

export interface GameEventFilterProps {
  onFilterChange?: (filters: GameEventFilterValue[]) => void;
  onFilterAdd?: (filter: GameEventFilterValue) => void;
  initialFilters?: GameEventFilterValue[];
}

const GameEventFilter: React.FC<GameEventFilterProps> = ({ 
  onFilterChange, 
  onFilterAdd,
  initialFilters = []
}) => {
  const categories: string[] = Object.keys(GameEventVariationsMap).map((key) => key.toString());
  const [selectedCategory, setSelectedCategory] = useState<GameEventCategoryOption | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<GameEventFilterValue[]>(initialFilters);

  const handleCategoryChange = useCallback((value: GameEventCategoryOption | "all" | string) => {
    if (value === "all") {
      setSelectedCategory(null);
      setSelectedVariation(null);
      setSelectedValue(null);
      return;
    }

    setSelectedCategory(value as GameEventCategoryOption);
    setSelectedVariation(null);
    setSelectedValue(null);
  }, []);

  const handleVariationChange = useCallback((value: string | "all") => {
    setSelectedVariation(value === "all" ? null : value);
    setSelectedValue(null);
  }, []);

  const handleValueChange = useCallback((value: string | "all") => {
    setSelectedValue(value === "all" ? null : value);
  }, []);

  const addFilterToQuery = useCallback(() => {
    if (!selectedCategory) return;

    const newFilter: GameEventFilterValue = {
      category: selectedCategory,
      variation: selectedVariation,
      value: selectedValue,
    };

    // Add to active filters
    const updatedFilters = [...activeFilters, newFilter];
    setActiveFilters(updatedFilters);

    // Notify parent components
    onFilterAdd?.(newFilter);
    onFilterChange?.(updatedFilters);

    // Reset selection for next filter
    setSelectedCategory(null);
    setSelectedVariation(null);
    setSelectedValue(null);
  }, [selectedCategory, selectedVariation, selectedValue, activeFilters, onFilterAdd, onFilterChange]);

  const removeFilter = useCallback((index: number) => {
    const updatedFilters = activeFilters.filter((_, i) => i !== index);
    setActiveFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  }, [activeFilters, onFilterChange]);

  const clearAllFilters = useCallback(() => {
    setActiveFilters([]);
    onFilterChange?.([]);
  }, [onFilterChange]);

  const selectedBadges = useMemo(() => {
    if (!selectedCategory) return null;
    
    let badge = selectedCategory;
    if (selectedVariation) {
      badge += ` > ${selectedVariation}`;
    }
    if (selectedValue) {
      badge += `: ${selectedValue}`;
    }
    return badge;
  }, [selectedCategory, selectedVariation, selectedValue]);

  const activeFiltersBadges = useMemo(() => {
    if (activeFilters.length === 0) return null;

    return (
      <ScrollShadow
        hideScrollBar
        className="w-full flex py-0.5 px-2 gap-1"
        orientation="horizontal"
      >
        {activeFilters.map((filter, index) => {
          let label = filter.category;
          if (filter.variation) label += ` > ${filter.variation}`;
          if (filter.value) label += `: ${filter.value}`;
          
          return (
            <Chip 
              key={index} 
              onClose={() => removeFilter(index)}
              variant="flat"
              className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37]"
            >
              {label}
            </Chip>
          );
        })}
        {activeFilters.length > 1 && (
          <Button
            size="sm"
            variant="light"
            className="text-danger"
            onPress={clearAllFilters}
          >
            Clear All
          </Button>
        )}
      </ScrollShadow>
    );
  }, [activeFilters, removeFilter, clearAllFilters]);

  const pendingBadgeContent = useMemo(() => {
    if (!selectedBadges) return null;

    return (
      <div className="flex items-center gap-2 px-2">
        <span className="text-xs text-default-500">Pending:</span>
        <Chip variant="bordered" className="border-dashed">
          {selectedBadges}
        </Chip>
      </div>
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
      <div className="flex flex-col items-center gap-2">
        {pendingBadgeContent}
        <Spacer y={1} />
        <Button 
          onPress={addFilterToQuery} 
          isDisabled={!selectedCategory}
          className="rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#1a1a1a]"
        >
          Add Filter
        </Button>
      </div>

      <div className="col-span-full mt-4">
        {activeFiltersBadges}
      </div>
    </div>
  );
};

export default GameEventFilter;
export type { GameEventFilterValue, GameEventFilterProps };
