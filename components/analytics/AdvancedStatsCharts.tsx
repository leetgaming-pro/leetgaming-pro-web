"use client";
import React, { useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  Chip,
  Divider,
} from "@nextui-org/react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Icon } from "@iconify/react";

// Types for advanced player stats
export interface AdvancedPlayerStats {
  player_id: string;
  player_name: string;
  team: string;
  
  // Combat stats
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  headshot_pct: number;
  adr: number;
  kast: number;
  rating_2: number;
  
  // Multi-kills
  double_kills: number;
  triple_kills: number;
  quad_kills: number;
  aces: number;
  
  // Entry fragging
  opening_kills: number;
  opening_deaths: number;
  opening_attempts: number;
  
  // Trade kills
  trade_kills: number;
  traded_deaths: number;
  
  // Clutch stats
  clutch_wins: number;
  clutch_attempts: number;
  clutch_1v1_wins: number;
  clutch_1v2_wins: number;
  clutch_1v3_wins: number;
  clutch_1v4_wins: number;
  clutch_1v5_wins: number;
  
  // Utility stats
  flashes_thrown: number;
  smokes_thrown: number;
  hes_thrown: number;
  molotovs_thrown: number;
  enemies_flashed: number;
  flash_assists: number;
  team_flashes: number;
  utility_damage: number;
  
  // Weapon performance
  weapon_kills: Record<string, number>;
  weapon_headshots: Record<string, number>;
  weapon_accuracy: Record<string, number>;
  
  // Damage breakdown
  damage_by_weapon: Record<string, number>;
  damage_by_hitbox: Record<string, number>;
  total_damage: number;
  
  // Economy
  money_spent_total: number;
  money_earned_total: number;
  
  // Objectives
  bomb_plants: number;
  bomb_defuses: number;
  
  // Special kills
  wallbang_kills: number;
  noscope_kills: number;
  through_smoke_kills: number;
  airborne_kills: number;
  blind_kills: number;
  knife_kills: number;
}

const COLORS = {
  primary: "#DCFF37",
  secondary: "#FF4654",
  ct: "#5D79AE",
  t: "#DE9B35",
  success: "#17C964",
  warning: "#F5A524",
  danger: "#F31260",
  neutral: "#889096",
};

// Multi-kill breakdown chart
export function MultiKillChart({ stats }: { stats: AdvancedPlayerStats }) {
  const data = [
    { name: "2K", value: stats.double_kills || 0, color: "#17C964" },
    { name: "3K", value: stats.triple_kills || 0, color: "#006FEE" },
    { name: "4K", value: stats.quad_kills || 0, color: "#F5A524" },
    { name: "ACE", value: stats.aces || 0, color: "#F31260" },
  ];

  const totalMultiKills = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon icon="solar:stars-bold" className="text-[#DCFF37]" width={20} />
          <h3 className="text-lg font-semibold">Multi-Kills</h3>
          <Chip size="sm" variant="flat" className="ml-2">
            {totalMultiKills} total
          </Chip>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {data.map((item) => (
            <div key={item.name} className="text-center">
              <div className="text-2xl font-bold" style={{ color: item.color }}>
                {item.value}
              </div>
              <div className="text-xs text-default-400">{item.name}</div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fill: "#889096", fontSize: 12 }} width={40} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

// Clutch performance chart
export function ClutchChart({ stats }: { stats: AdvancedPlayerStats }) {
  const clutchData = [
    { name: "1v1", wins: stats.clutch_1v1_wins || 0 },
    { name: "1v2", wins: stats.clutch_1v2_wins || 0 },
    { name: "1v3", wins: stats.clutch_1v3_wins || 0 },
    { name: "1v4", wins: stats.clutch_1v4_wins || 0 },
    { name: "1v5", wins: stats.clutch_1v5_wins || 0 },
  ];

  const totalClutches = clutchData.reduce((sum, d) => sum + d.wins, 0);
  const clutchRate = stats.clutch_attempts > 0 
    ? ((stats.clutch_wins / stats.clutch_attempts) * 100).toFixed(0) 
    : 0;

  return (
    <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon icon="solar:shield-user-bold" className="text-[#FF4654]" width={20} />
          <h3 className="text-lg font-semibold">Clutch Performance</h3>
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold text-[#FF4654]">{totalClutches}</div>
            <div className="text-xs text-default-400">Clutches Won</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#DCFF37]">{clutchRate}%</div>
            <div className="text-xs text-default-400">Win Rate</div>
          </div>
        </div>
        <div className="space-y-2">
          {clutchData.map((clutch) => (
            <div key={clutch.name} className="flex items-center gap-3">
              <span className="text-sm text-default-500 w-10">{clutch.name}</span>
              <Progress
                value={clutch.wins * 20}
                className="flex-1"
                size="sm"
                color="danger"
              />
              <span className="text-sm font-semibold w-8 text-right">{clutch.wins}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// Utility usage chart
export function UtilityChart({ stats }: { stats: AdvancedPlayerStats }) {
  const utilityData = [
    { name: "Flashes", value: stats.flashes_thrown || 0, icon: "solar:flash-bold", color: "#F5A524" },
    { name: "Smokes", value: stats.smokes_thrown || 0, icon: "solar:cloud-bold", color: "#889096" },
    { name: "HE", value: stats.hes_thrown || 0, icon: "solar:bomb-bold", color: "#F31260" },
    { name: "Molotovs", value: stats.molotovs_thrown || 0, icon: "solar:fire-bold", color: "#FF4654" },
  ];

  const totalUtility = utilityData.reduce((sum, d) => sum + d.value, 0);
  const flashEfficiency = stats.flashes_thrown > 0 
    ? ((stats.enemies_flashed / stats.flashes_thrown) * 100).toFixed(0) 
    : 0;

  return (
    <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon icon="solar:bomb-minimalistic-bold" className="text-[#F5A524]" width={20} />
          <h3 className="text-lg font-semibold">Utility Usage</h3>
          <Chip size="sm" variant="flat" className="ml-2">
            {totalUtility} thrown
          </Chip>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {utilityData.map((item) => (
            <div key={item.name} className="text-center">
              <Icon icon={item.icon} width={24} style={{ color: item.color }} className="mx-auto mb-1" />
              <div className="text-xl font-bold" style={{ color: item.color }}>
                {item.value}
              </div>
              <div className="text-xs text-default-400">{item.name}</div>
            </div>
          ))}
        </div>
        <Divider className="my-3" />
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold text-[#F5A524]">{stats.enemies_flashed || 0}</div>
            <div className="text-xs text-default-400">Enemies Flashed</div>
          </div>
          <div>
            <div className="font-semibold text-[#17C964]">{stats.flash_assists || 0}</div>
            <div className="text-xs text-default-400">Flash Assists</div>
          </div>
          <div>
            <div className="font-semibold text-[#F31260]">{stats.team_flashes || 0}</div>
            <div className="text-xs text-default-400">Team Flashes</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-default-400">Flash Efficiency</span>
            <span className="font-semibold">{flashEfficiency}%</span>
          </div>
          <Progress value={Number(flashEfficiency)} size="sm" color="warning" />
        </div>
        {stats.utility_damage > 0 && (
          <div className="mt-3 p-2 rounded bg-content2/30 text-center">
            <div className="text-lg font-bold text-[#FF4654]">{stats.utility_damage}</div>
            <div className="text-xs text-default-400">Utility Damage</div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// Weapon performance breakdown
export function WeaponPerformanceChart({ stats }: { stats: AdvancedPlayerStats }) {
  const weaponData = useMemo(() => {
    const weapons = Object.entries(stats.weapon_kills || {})
      .map(([weapon, kills]) => ({
        weapon: weapon.replace("weapon_", "").toUpperCase(),
        kills,
        headshots: stats.weapon_headshots?.[weapon] || 0,
        damage: stats.damage_by_weapon?.[weapon] || 0,
        accuracy: stats.weapon_accuracy?.[weapon] || 0,
      }))
      .filter((w) => w.kills > 0)
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 8);

    return weapons;
  }, [stats]);

  if (weaponData.length === 0) {
    return (
      <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon="solar:gun-bold" className="text-[#DCFF37]" width={20} />
            <h3 className="text-lg font-semibold">Weapon Performance</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-center text-default-400 py-8">
            No weapon data available
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon icon="solar:gun-bold" className="text-[#DCFF37]" width={20} />
          <h3 className="text-lg font-semibold">Weapon Performance</h3>
        </div>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weaponData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" tick={{ fill: "#889096", fontSize: 10 }} />
            <YAxis type="category" dataKey="weapon" tick={{ fill: "#889096", fontSize: 10 }} width={60} />
            <RechartsTooltip
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
              formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            <Legend />
            <Bar dataKey="kills" name="Kills" fill={COLORS.primary} />
            <Bar dataKey="headshots" name="Headshots" fill={COLORS.secondary} />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

// Damage breakdown chart
export function DamageBreakdownChart({ stats }: { stats: AdvancedPlayerStats }) {
  const hitboxData = useMemo(() => {
    const hitboxes = [
      { name: "Head", value: stats.damage_by_hitbox?.["head"] || 0, color: "#F31260" },
      { name: "Body", value: stats.damage_by_hitbox?.["body"] || 0, color: "#17C964" },
      { name: "Arms", value: stats.damage_by_hitbox?.["arms"] || 0, color: "#006FEE" },
      { name: "Legs", value: stats.damage_by_hitbox?.["legs"] || 0, color: "#F5A524" },
    ];

    return hitboxes.filter((h) => h.value > 0);
  }, [stats]);

  if (hitboxData.length === 0) {
    return (
      <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon="solar:target-bold" className="text-[#FF4654]" width={20} />
            <h3 className="text-lg font-semibold">Damage Breakdown</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-center text-default-400 py-8">
            No damage data available
          </div>
        </CardBody>
      </Card>
    );
  }

  const totalDamage = hitboxData.reduce((sum, h) => sum + h.value, 0);

  return (
    <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon icon="solar:target-bold" className="text-[#FF4654]" width={20} />
          <h3 className="text-lg font-semibold">Damage Breakdown</h3>
          <Chip size="sm" variant="flat" className="ml-2">
            {totalDamage} total
          </Chip>
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex items-center gap-6">
          <ResponsiveContainer width={150} height={150}>
            <PieChart>
              <Pie
                data={hitboxData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                dataKey="value"
              >
                {hitboxData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-3">
            {hitboxData.map((hitbox) => (
              <div key={hitbox.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hitbox.color }} />
                <span className="text-sm flex-1">{hitbox.name}</span>
                <span className="text-sm font-semibold">{hitbox.value}</span>
                <span className="text-xs text-default-400">
                  ({((hitbox.value / totalDamage) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Special kills showcase
export function SpecialKillsChart({ stats }: { stats: AdvancedPlayerStats }) {
  const specialKills = [
    { name: "Wallbang", value: stats.wallbang_kills || 0, icon: "solar:wall-bold", color: "#889096" },
    { name: "No Scope", value: stats.noscope_kills || 0, icon: "solar:eye-closed-bold", color: "#F5A524" },
    { name: "Through Smoke", value: stats.through_smoke_kills || 0, icon: "solar:cloud-bold", color: "#006FEE" },
    { name: "Airborne", value: stats.airborne_kills || 0, icon: "solar:ufo-bold", color: "#17C964" },
    { name: "Blind", value: stats.blind_kills || 0, icon: "solar:eye-bold", color: "#F31260" },
    { name: "Knife", value: stats.knife_kills || 0, icon: "solar:knife-bold", color: "#FF4654" },
  ];

  const totalSpecialKills = specialKills.reduce((sum, s) => sum + s.value, 0);

  return (
    <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon icon="solar:star-shine-bold" className="text-[#F5A524]" width={20} />
          <h3 className="text-lg font-semibold">Special Kills</h3>
          <Chip size="sm" variant="flat" className="ml-2">
            {totalSpecialKills} total
          </Chip>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-3 gap-4">
          {specialKills.map((kill) => (
            <div
              key={kill.name}
              className={`p-3 rounded-lg text-center ${
                kill.value > 0 ? "bg-content2/50" : "bg-content2/20 opacity-50"
              }`}
            >
              <Icon icon={kill.icon} width={28} style={{ color: kill.color }} className="mx-auto mb-2" />
              <div className="text-xl font-bold" style={{ color: kill.value > 0 ? kill.color : "#889096" }}>
                {kill.value}
              </div>
              <div className="text-xs text-default-400">{kill.name}</div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// Entry fragging stats
export function EntryFraggingChart({ stats }: { stats: AdvancedPlayerStats }) {
  const entrySuccess = stats.opening_attempts > 0
    ? ((stats.opening_kills / stats.opening_attempts) * 100).toFixed(0)
    : 0;

  const tradeRate = stats.traded_deaths > 0 || stats.trade_kills > 0
    ? (stats.trade_kills / Math.max(1, stats.traded_deaths + stats.trade_kills) * 100).toFixed(0)
    : 0;

  return (
    <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon icon="solar:running-bold" className="text-[#17C964]" width={20} />
          <h3 className="text-lg font-semibold">Entry & Trade Stats</h3>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 gap-6">
          {/* Entry Stats */}
          <div>
            <div className="text-center mb-3">
              <div className="text-3xl font-bold text-[#17C964]">
                {stats.opening_kills || 0}/{stats.opening_deaths || 0}
              </div>
              <div className="text-xs text-default-400">Opening K/D</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-default-400">Entry Success</span>
                <span className="font-semibold">{entrySuccess}%</span>
              </div>
              <Progress value={Number(entrySuccess)} size="sm" color="success" />
            </div>
          </div>

          {/* Trade Stats */}
          <div>
            <div className="text-center mb-3">
              <div className="text-3xl font-bold text-[#006FEE]">
                {stats.trade_kills || 0}/{stats.traded_deaths || 0}
              </div>
              <div className="text-xs text-default-400">Trades K/D</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-default-400">Trade Rate</span>
                <span className="font-semibold">{tradeRate}%</span>
              </div>
              <Progress value={Number(tradeRate)} size="sm" color="primary" />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Economy overview
export function EconomyOverviewChart({ stats }: { stats: AdvancedPlayerStats }) {
  const netMoney = (stats.money_earned_total || 0) - (stats.money_spent_total || 0);
  const profitColor = netMoney >= 0 ? COLORS.success : COLORS.danger;

  return (
    <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon icon="solar:wallet-money-bold" className="text-[#17C964]" width={20} />
          <h3 className="text-lg font-semibold">Economy</h3>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-[#17C964]">
              ${(stats.money_earned_total || 0).toLocaleString()}
            </div>
            <div className="text-xs text-default-400">Earned</div>
          </div>
          <div>
            <div className="text-xl font-bold text-[#F31260]">
              ${(stats.money_spent_total || 0).toLocaleString()}
            </div>
            <div className="text-xs text-default-400">Spent</div>
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: profitColor }}>
              {netMoney >= 0 ? "+" : ""}${netMoney.toLocaleString()}
            </div>
            <div className="text-xs text-default-400">Net</div>
          </div>
        </div>
        <Divider className="my-4" />
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 rounded bg-content2/30">
            <Icon icon="solar:bomb-bold" width={24} className="text-[#DE9B35] mx-auto mb-1" />
            <div className="text-lg font-bold">{stats.bomb_plants || 0}</div>
            <div className="text-xs text-default-400">Bomb Plants</div>
          </div>
          <div className="p-3 rounded bg-content2/30">
            <Icon icon="solar:shield-check-bold" width={24} className="text-[#5D79AE] mx-auto mb-1" />
            <div className="text-lg font-bold">{stats.bomb_defuses || 0}</div>
            <div className="text-xs text-default-400">Bomb Defuses</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Main advanced stats panel
export function AdvancedStatsPanel({ stats }: { stats: AdvancedPlayerStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MultiKillChart stats={stats} />
        <ClutchChart stats={stats} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EntryFraggingChart stats={stats} />
        <EconomyOverviewChart stats={stats} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WeaponPerformanceChart stats={stats} />
        <DamageBreakdownChart stats={stats} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UtilityChart stats={stats} />
        <SpecialKillsChart stats={stats} />
      </div>
    </div>
  );
}
