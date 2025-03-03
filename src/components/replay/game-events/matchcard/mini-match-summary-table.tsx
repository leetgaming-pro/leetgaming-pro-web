import { ActivityIcon, SteamIcon } from "@/components/icons";
import React from "react";
import MatchTimeline from "@/components/replay/replay-file-item-timeline/match-h-timeline-sm";
import { electrolize, sixCaps } from "@/config/fonts";
import { Chip, Divider, Spacer } from "@nextui-org/react";

// Dummy Data (Replace with actual match data)
const mapName = "Dust II";
const team1Name = "Team A";
const team1Logo = "path/to/team1_logo.png";
const team1Score = 16;
const team2Name = "Team B";
const team2Logo = "path/to/team2_logo.png";
const team2Score = 12;

const MatchHeader = ({ showScores }: any) => {
  return (
    <div className={`match-header-container ${electrolize.className}`}>
      {/* Map Background */}
      <div
        className="map-background"
        style={{ backgroundImage: `url("/cs2/map_bg/de_dust2_bg.jpg")` }}
      // TODO: Mostrar Logo da Rede (Steam, etc), Mostrar 5v5
      // TODO: ArenaName
      // TODO: AREA background Image (utilizar Area ao inves de img genérica do mapa)
      // TODO: AREA background Image
      // TODO: AREA background Image
      // TODO: Mostrar a timeline completa do game, marcando o Round atual, Recebendo o nome do round (ie: FullBuy Exec A: Retake Failed, Eco, ForceBuy, etc.)
      // TODO: SourceFilmmakerSupport (icon quando possuir material da comunidade)
      // TODO: Cores de times na timeline: ofw, e 2nd logo
      // TODO: qtd Comments etc (nope, nao colocar qtds aqui)

      // TODO: Round Logo, => Round Num, ?v?, Strat, 
      >
        {/* Map Name Overlay */}
        {<table className="scoreboard-table">
          <thead>
            <tr>
              <td colSpan={2} className="justify-center align-center text-center align-items">
                <div className="map-name flex items-center justify-center align-center h-6" style={{ width: "100%", borderTopLeftRadius: "full", borderBottomLeftRadius: "full" }}>
                  <SteamIcon viewBox="0 0 40 40" className="pt-1" />
                  <span style={{ width: "100%" }} className={electrolize.className}>Competitive<Divider />{mapName}</span>
                  <div className="flex">
                  <span className="text-small text-white-500 pl-2">5v5</span>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3}>
              </td>
            </tr>
          </thead>
          {showScores &&
            <tbody>
              <tr>
                <td className="team-cell">
                  <img src={team1Logo} alt={team1Name} className="team-logo" />
                  <span className="team-name">{team1Name}</span>
                </td>
                <td className="score-cell vs-cell">
                  {team1Score} <span className="vs-text">VS</span> {team2Score}
                </td>
                <td className="team-cell">
                  <img src={team2Logo} alt={team2Name} className="team-logo" />
                  <span className="team-name">{team2Name}</span>
                </td>
              </tr>
            </tbody>
          }
        </table>
        }
        <Spacer y={1} />
        {/* <div className="flex w-full justify-center items-center align-center" style={{
                height: "4px",
                marginTop: "-5px",
                position: "absolute",
                overflow: "visible",
                zIndex: 40,
              }}>
                    <Chip variant="faded"><small>1st-half</small></Chip>
                    <Spacer x={1} />
                    <Chip variant="faded" className="bg-default-100"><small className="text-white-50">Round 5</small></Chip>
                    <Spacer x={1} />
                    <Chip variant="faded" color="success"><small className="text-white-50">Full Buy</small></Chip>
                  </div> */}
        <MatchTimeline className="match-timeline" rounds={[
          { roundNumber: 1, winner: "ct", keyEvents: ["Pistol round win"] },
          { roundNumber: 2, winner: "t", keyEvents: ["Clutch 1v3 by sound"] },
          { roundNumber: 3, winner: "ct", keyEvents: ["Clutch 1v3 by sound"] },
          { roundNumber: 4, winner: "t", keyEvents: [] },
          { roundNumber: 5, winner: "t", keyEvents: [] },
          { roundNumber: 6, winner: "ct", keyEvents: [] },
          { roundNumber: 7, winner: "ct", keyEvents: [] },
          { roundNumber: 8, winner: "ct", keyEvents: [] },
          { roundNumber: 9, winner: "t", keyEvents: [] },
          { roundNumber: 10, winner: "ct", keyEvents: [] },
          { roundNumber: 11, winner: "t", keyEvents: [] },
          { roundNumber: 12, winner: "ct", keyEvents: [] },
          { roundNumber: 13, winner: "t", keyEvents: [] },
          { roundNumber: 14, winner: "ct", keyEvents: ["Clutch 1v3 by sound"], current: true, currentTeam: "ct" },
          { roundNumber: 15, winner: "t", keyEvents: ["Clutch 1v3 by sound"] },
          { roundNumber: 16, winner: "t", keyEvents: ["Clutch 1v3 by sound"] },
          { roundNumber: 17, winner: "t", keyEvents: ["Clutch 1v3 by sound"] },
          { roundNumber: 18, winner: "t", keyEvents: ["Clutch 1v3 by sound"] },
          { roundNumber: 19, winner: "t", keyEvents: ["Clutch 1v3 by sound"] },
          { roundNumber: 20, winner: "t", keyEvents: ["Clutch 1v3 by sound"] },
          { roundNumber: 21, winner: "t", keyEvents: ["Clutch 1v3 by sound"] },
        ]} />
        {/* Scoreboard Table */}

      </div>
    </div>
  );
};

export default MatchHeader;
