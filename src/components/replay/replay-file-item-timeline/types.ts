
export interface RoundData {
  roundNumber: number;
  winner: "ct" | "t" | null; // Add winner information
  keyEvents: string[]; // Array to store key events in the round
  current?: boolean | null | undefined; // Add current round information
  currentTeam?: "ct" | "t" | null | undefined;
}

export interface MapRegionData {
  
}

export interface TimelineWinnerCardProps {
  roundData: RoundData
}
