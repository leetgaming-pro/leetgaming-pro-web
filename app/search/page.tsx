"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import { Input, Chip, Card, CardBody, Spinner, Button, CheckboxGroup, Checkbox, RadioGroup, Radio } from "@nextui-org/react";
import { SearchBuilder } from "@/types/replay-api/search-builder";

interface SearchResultItem {
  id: string;
  gameId: string;
  createdAt: string;
  status: string;
  size?: number;
}

export default function AdvancedSearchPage() {
  const sdk = useMemo(() => new ReplayAPISDK(ReplayApiSettingsMock, logger), []);
  const [query, setQuery] = useState<string>("");
  const [gameFilter, setGameFilter] = useState<string[]>(["cs2"]);
  const [visibility, setVisibility] = useState<string>("public");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      type GameIdType = 'cs2' | 'csgo' | 'valorant';
      type VisibilityType = 'public' | 'private' | 'shared' | 'unlisted';
      const builder = new SearchBuilder()
        .withGameIds(gameFilter[0] as GameIdType)
        .paginate(1, 30);
      const validVisibilities: VisibilityType[] = ['public', 'private', 'shared', 'unlisted'];
      if (visibility !== "all" && validVisibilities.includes(visibility as VisibilityType)) {
        builder.withResourceVisibilities(visibility as VisibilityType);
      }
      const response = await sdk.replayFiles.searchReplayFiles(builder.build().filters);
      // naive text filter against id
      const filtered = response.filter(r => !query || r.id.includes(query));
      setResults(filtered.map(r => ({ id: r.id, gameId: r.gameId, createdAt: r.createdAt, status: r.status, size: r.size })));
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Search failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameFilter, visibility]);

  return (
    <div className="px-4 py-6 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
          <span className="text-xl text-[#F5F0E1] dark:text-[#34445C]">🔍</span>
        </div>
        <h1 className="text-2xl font-semibold text-[#34445C] dark:text-[#F5F0E1]">Advanced Search</h1>
      </div>
      <Card className="mb-6 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardBody>
          <div className="flex flex-wrap gap-4 items-end">
            <Input 
              label="Query" 
              placeholder="Replay ID contains..." 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              className="max-w-xs"
              classNames={{
                inputWrapper: "rounded-none border-[#FF4654]/30 dark:border-[#DCFF37]/30",
              }}
            />
            <CheckboxGroup 
              label="Game" 
              value={gameFilter} 
              onChange={setGameFilter} 
              orientation="horizontal"
              classNames={{
                wrapper: "gap-3",
              }}
            >
              <Checkbox value="cs2" classNames={{ wrapper: "rounded-none" }}>CS2</Checkbox>
              <Checkbox value="csgo" classNames={{ wrapper: "rounded-none" }}>CSGO</Checkbox>
              <Checkbox value="valorant" classNames={{ wrapper: "rounded-none" }}>Valorant</Checkbox>
            </CheckboxGroup>
            <RadioGroup label="Visibility" orientation="horizontal" value={visibility} onValueChange={setVisibility}>
              <Radio value="public">Public</Radio>
              <Radio value="private">Private</Radio>
              <Radio value="shared">Shared</Radio>
              <Radio value="all">All</Radio>
            </RadioGroup>
            <Button 
              className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-[#F5F0E1] dark:text-[#34445C] rounded-none"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
              onPress={runSearch} 
              isLoading={loading}
            >
              Search
            </Button>
          </div>
        </CardBody>
      </Card>
      {error && <Card className="mb-4 rounded-none border border-danger/30"><CardBody className="text-danger text-sm">{error}</CardBody></Card>}
      {loading && results.length === 0 && (
        <div className="flex items-center gap-2"><Spinner size="sm" color="primary" /> <span className="text-sm text-[#34445C] dark:text-[#F5F0E1]">Searching...</span></div>
      )}
      {!loading && results.length === 0 && !error && (
        <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
          <CardBody className="text-center py-8">
            <p className="text-sm text-default-500">No results found</p>
          </CardBody>
        </Card>
      )}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {results.map(r => (
            <Card key={r.id} isPressable onPress={() => window.location.href = `/replays/${r.id}`} className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:shadow-lg hover:shadow-[#FF4654]/10 dark:hover:shadow-[#DCFF37]/10 transition-all"> 
              <CardBody className="p-3 text-xs">
                <div className="flex justify-between mb-1">
                  <Chip size="sm" color="primary" variant="flat" className="rounded-none">{r.gameId.toUpperCase()}</Chip>
                  <Chip size="sm" className="rounded-none" color={r.status === "Completed" || r.status === "Ready" ? "success" : r.status === "Failed" ? "danger" : "warning"}>{r.status}</Chip>
                </div>
                <div className="font-semibold truncate text-[#34445C] dark:text-[#F5F0E1]">{r.id}</div>
                <div className="text-default-400 mt-1">{new Date(r.createdAt).toLocaleString()}</div>
                {r.size && <div className="text-default-300 mt-1">{(r.size/1024/1024).toFixed(2)} MB</div>}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
