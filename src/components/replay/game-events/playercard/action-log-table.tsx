import { ScrollShadow } from "@nextui-org/react";
import React from "react";

const KillIcon = () => <span>💀</span>;
const FlashIcon = () => <span>⚡</span>;
const DamageIcon = () => <span>💥</span>;
const PlantIcon = () => <span>💣</span>;

// TODO: generic + parametrizar filtro

const LogTable = () => {
  const logData = [
    // { time: "0:15", action: "Kill (AK-47, HS)", value: "1 enemy" },
    { time: "0:30", action: "Flash (Popflash) 0:1", value: "x2 enemies" },
    { time: "1:00", action: "Damage (AWP, 98)", value: "Chest" },
    { time: "1:25", action: "Plant (B-site)", value: null }, // Null for no value
    { time: "1:45", action: "Kill (USP-S)", value: "1 enemy" },
  ];

  const getIcon = (action: any) => {
    if (action.startsWith("Kill")) return <KillIcon />;
    if (action.startsWith("Flash")) return <FlashIcon />;
    if (action.startsWith("Damage")) return <DamageIcon />;
    if (action.startsWith("Plant")) return <PlantIcon />;
    return null;
  };

  return (
    <ScrollShadow size={100} className="w-[370px] h-[115px]" hideScrollBar>
    <table className="round-log align-items items-center justify-center" style={{
        width: "370px",
    }}>
      {/* <thead>
        <tr>
          <th>Time</th>
          <th>Action</th>
          <th></th>
          <th style={{
            textAlign: "center",
            width: "40px"
          }}>Value</th>
        </tr>
      </thead> */}
      <tbody>
        {logData.map((entry, index) => (
          <tr key={index}>
            <td className="align-items items-center justify-center pl-3" style={{
                textAlign: "center",
                width: "40px",
            }}><span className="pl-1">{entry.time}</span></td>
            <td className="align-items items-center justify-center" style={{
                width: "100%",
                textAlign: "center"
            }}>{entry.action}</td>
            <td className="align-items items-center justify-center" style={{
                textAlign: "right",
            }}>{getIcon(entry.action)}</td>
            <td className="align-items items-center justify-center" style={{
                textAlign: "left",
            }}>{entry.value || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </ScrollShadow>
  );
};

export default LogTable;
