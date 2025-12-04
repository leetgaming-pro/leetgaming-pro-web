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
      <h1 className="text-2xl font-semibold mb-4">Advanced Search</h1>
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <Input label="Query" placeholder="Replay ID contains..." value={query} onChange={e => setQuery(e.target.value)} className="max-w-xs" />
        <CheckboxGroup label="Game" value={gameFilter} onChange={setGameFilter} orientation="horizontal">
          <Checkbox value="cs2">CS2</Checkbox>
          <Checkbox value="csgo">CSGO</Checkbox>
          <Checkbox value="valorant">Valorant</Checkbox>
        </CheckboxGroup>
        <RadioGroup label="Visibility" orientation="horizontal" value={visibility} onValueChange={setVisibility}>
          <Radio value="public">Public</Radio>
          <Radio value="private">Private</Radio>
          <Radio value="shared">Shared</Radio>
          <Radio value="all">All</Radio>
        </RadioGroup>
        <Button color="primary" onPress={runSearch} isLoading={loading}>Search</Button>
      </div>
      {error && <Card className="mb-4"><CardBody className="text-danger text-sm">{error}</CardBody></Card>}
      {loading && results.length === 0 && (
        <div className="flex items-center gap-2"><Spinner size="sm" /> <span className="text-sm">Searching...</span></div>
      )}
      {!loading && results.length === 0 && !error && (
        <p className="text-sm text-default-500">No results</p>
      )}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {results.map(r => (
            <Card key={r.id} isPressable onPress={() => window.location.href = `/replays/${r.id}`}> 
              <CardBody className="p-3 text-xs">
                <div className="flex justify-between mb-1">
                  <Chip size="sm" color="primary" variant="flat">{r.gameId.toUpperCase()}</Chip>
                  <Chip size="sm" color={r.status === "Completed" || r.status === "Ready" ? "success" : r.status === "Failed" ? "danger" : "warning"}>{r.status}</Chip>
                </div>
                <div className="font-semibold truncate">{r.id}</div>
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
