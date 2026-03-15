"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";

/* ──────────────────────────────────────────────────────────────────
 *  Brand tokens  (subset usable inside react-pdf)
 * ────────────────────────────────────────────────────────────────── */
const C = {
  navy: "#34445C",
  navyDark: "#1e2a38",
  lime: "#DCFF37",
  orange: "#FF4654",
  gold: "#FFC700",
  cream: "#F5F0E1",
  white: "#ffffff",
  black: "#0a0a0a",
  gray: "#6b7280",
  grayLight: "#e5e7eb",
  emerald: "#059669",
};

/* ──────────────────────────────────────────────────────────────────
 *  Styles
 * ────────────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: C.navy,
    backgroundColor: C.white,
  },

  /* Header */
  header: {
    backgroundColor: C.navy,
    padding: "24 32 20 32",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1, maxWidth: "65%" },
  headerRight: { alignItems: "flex-end", justifyContent: "flex-start" },
  logo: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: C.cream,
    letterSpacing: 1,
  },
  logoAccent: { color: C.lime },
  tagline: { color: C.cream, opacity: 0.8, fontSize: 9, marginTop: 4 },
  headerMeta: {
    color: C.cream,
    opacity: 0.6,
    fontSize: 7,
    textAlign: "right" as const,
  },

  /* Body */
  body: { padding: "16 32 20 32", flex: 1 },

  /* Section headers */
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 2,
    borderBottomColor: C.orange,
  },

  /* Grids */
  row: { flexDirection: "row", gap: 10 },
  col2: { flex: 1 },
  col3: { flex: 1 },

  /* Stat boxes */
  statBox: {
    backgroundColor: "#f8f9fa",
    padding: "8 10",
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: C.orange,
  },
  statValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.orange,
  },
  statLabel: { fontSize: 7, color: C.gray, marginTop: 1 },

  /* Subtle stat boxes */
  statBoxAlt: {
    backgroundColor: "#f0fdf4",
    padding: "8 10",
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: C.emerald,
  },
  statValueAlt: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.emerald,
  },

  /* Cards */
  card: {
    border: `1 solid ${C.grayLight}`,
    padding: "8 10",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
    marginBottom: 2,
  },
  cardText: { fontSize: 7.5, color: C.gray, lineHeight: 1.4 },

  /* Bullet list */
  bullet: { flexDirection: "row", marginBottom: 3 },
  bulletDot: {
    width: 4,
    height: 4,
    backgroundColor: C.orange,
    marginRight: 6,
    marginTop: 3,
  },
  bulletText: { flex: 1, fontSize: 8, color: C.navy, lineHeight: 1.4 },

  /* Revenue bar */
  revenueBar: {
    flexDirection: "row",
    height: 14,
    marginBottom: 8,
    overflow: "hidden",
  },
  revSegment: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  revText: { fontSize: 6, color: C.white, fontFamily: "Helvetica-Bold" },

  /* Roadmap phase */
  phaseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  phaseBadge: {
    width: 50,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginRight: 8,
    backgroundColor: C.navy,
  },
  phaseBadgeText: {
    fontSize: 6.5,
    color: C.cream,
    fontFamily: "Helvetica-Bold",
    textAlign: "center" as const,
  },
  phaseContent: { flex: 1 },
  phaseTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.navy },
  phasePeriod: { fontSize: 7, color: C.gray, marginBottom: 2 },

  /* Footer */
  footer: {
    backgroundColor: C.navy,
    padding: "12 32",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { color: C.cream, opacity: 0.7, fontSize: 7 },
  footerLink: {
    color: C.lime,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textDecoration: "none",
  },

  /* Spacing helpers */
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },

  /* Competitor table */
  table: { borderWidth: 1, borderColor: C.grayLight },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.grayLight,
  },
  tableHeader: { backgroundColor: C.navy },
  tableHeaderText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.cream,
    padding: "4 6",
  },
  tableCell: { fontSize: 7, color: C.navy, padding: "3 6" },
  tableCellHighlight: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.orange,
    padding: "3 6",
    backgroundColor: "#fff5f5",
  },

  /* Inline text */
  bold: { fontFamily: "Helvetica-Bold" },
  small: { fontSize: 7, color: C.gray },
  accent: { color: C.orange },
});

/* ──────────────────────────────────────────────────────────────────
 *  Helper components
 * ────────────────────────────────────────────────────────────────── */
function Stat({
  value,
  label,
  alt,
}: {
  value: string;
  label: string;
  alt?: boolean;
}) {
  return (
    <View style={alt ? s.statBoxAlt : s.statBox}>
      <Text style={alt ? s.statValueAlt : s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={s.bullet}>
      <View style={s.bulletDot} />
      <Text style={s.bulletText}>{children}</Text>
    </View>
  );
}

/* ──────────────────────────────────────────────────────────────────
 *  Document
 * ────────────────────────────────────────────────────────────────── */
export function OnePagerDocument() {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <Document
      title="LeetGaming.PRO — Investor One-Pager"
      author="LeetGaming.PRO"
      subject="Investment Overview"
    >
      <Page size="A4" style={s.page}>
        {/* ──── HEADER ──── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.logo}>
              LEET<Text style={s.logoAccent}>GAMING</Text>.PRO
            </Text>
            <Text style={s.tagline}>
              Compete · Analyze · Earn — The All-in-One Esports Competition
              Platform
            </Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerMeta}>Investment Overview</Text>
            <Text style={s.headerMeta}>{generatedDate}</Text>
            <Text style={s.headerMeta}>investors@leetgaming.pro</Text>
          </View>
        </View>

        {/* ──── BODY ──── */}
        <View style={s.body}>
          {/* ROW 1: Elevator Pitch + Key Metrics ──────────────── */}
          <View style={[s.row, s.mb12]}>
            <View style={[s.col2, { maxWidth: "58%" }]}>
              <Text style={s.sectionTitle}>THE OPPORTUNITY</Text>
              <Text style={[s.bulletText, s.mb8]}>
                LeetGaming.PRO is a full-stack esports competition platform
                combining AI-powered replay analysis, skill-based matchmaking,
                tournaments, verified scores, and transparent prize
                distribution for 63M+ competitive FPS players (CS2 &
                Valorant). No single competitor offers this integrated
                experience.
              </Text>
              <View style={[s.statBoxAlt, s.mb8]}>
                <Text style={s.cardTitle}>CORE MOAT · VERIFIED SCORES</Text>
                <Text style={s.cardText}>
                  Multi-source score verification underpins disputes, rankings,
                  prize distribution, and future infrastructure for prediction
                  and partner ecosystems.
                </Text>
              </View>
              <Text style={[s.sectionTitle, s.mt8]}>WHY NOW?</Text>
              <Bullet>
                Esports viewership surpassing traditional sports demographics
              </Bullet>
              <Bullet>
                Underserved regions (LATAM, SEA, MENA) — massive player bases,
                zero local platforms
              </Bullet>
              <Bullet>
                Blockchain maturity enables transparent, verifiable prize
                distribution
              </Bullet>
              <Bullet>
                No platform integrates analytics + competition + earning — first
                full-stack solution
              </Bullet>
            </View>

            <View style={[s.col2, { maxWidth: "42%" }]}>
              <Text style={s.sectionTitle}>KEY METRICS</Text>
              <View style={s.row}>
                <View style={s.col2}>
                  <Stat value="$21.9B" label="Total Addressable Market" />
                  <Stat value="63M+" label="Addressable Players" />
                  <Stat value="$5–15" label="Customer Acquisition Cost" />
                </View>
                <View style={s.col2}>
                  <Stat value="5:1–15:1" label="LTV : CAC Ratio" alt />
                  <Stat value="$50–200" label="Lifetime Value" alt />
                  <Stat value="2–4 mo" label="Payback Period" alt />
                </View>
              </View>
            </View>
          </View>

          {/* ROW 2: Revenue Model + Competitive ──────────────── */}
          <View style={[s.row, s.mb12]}>
            <View style={[s.col2, { maxWidth: "55%" }]}>
              <Text style={s.sectionTitle}>REVENUE MODEL</Text>
              {/* Revenue split bar */}
              <View style={s.revenueBar}>
                <View
                  style={[
                    s.revSegment,
                    { flex: 40, backgroundColor: C.orange },
                  ]}
                >
                  <Text style={s.revText}>Subscriptions 40%</Text>
                </View>
                <View
                  style={[s.revSegment, { flex: 30, backgroundColor: C.navy }]}
                >
                  <Text style={s.revText}>Tx Fees 30%</Text>
                </View>
                <View
                  style={[s.revSegment, { flex: 20, backgroundColor: C.gold }]}
                >
                  <Text style={[s.revText, { color: C.navy }]}>
                    Value-Add 20%
                  </Text>
                </View>
                <View
                  style={[
                    s.revSegment,
                    { flex: 10, backgroundColor: C.grayLight },
                  ]}
                >
                  <Text style={[s.revText, { color: C.navy }]}>Ads 10%</Text>
                </View>
              </View>

              <View style={s.row}>
                <View style={s.col2}>
                  <View style={s.card}>
                    <Text style={s.cardTitle}>
                      Subscriptions · Free / Pro $9.99 / Team $29.99
                    </Text>
                    <Text style={s.cardText}>
                      Advanced analytics, priority matchmaking, team management
                    </Text>
                  </View>
                  <View style={s.card}>
                    <Text style={s.cardTitle}>Tournament Entry Fees</Text>
                    <Text style={s.cardText}>
                      Hosting fees & commissions on organized competitions
                    </Text>
                  </View>
                </View>
                <View style={s.col2}>
                  <View style={s.card}>
                    <Text style={s.cardTitle}>Wager Rake · 5–10%</Text>
                    <Text style={s.cardText}>
                      Platform fee on skill-based wager matches with verified
                      scores and escrow
                    </Text>
                  </View>
                  <View style={s.card}>
                    <Text style={s.cardTitle}>Score Intelligence Expansion</Text>
                    <Text style={s.cardText}>
                      Future API / infrastructure upside for tournaments,
                      prediction products, and external competition platforms
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[s.col2, { maxWidth: "45%" }]}>
              <Text style={s.sectionTitle}>COMPETITIVE LANDSCAPE</Text>
              <View style={s.table}>
                <View style={[s.tableRow, s.tableHeader]}>
                  <Text style={[s.tableHeaderText, { flex: 2 }]}>Feature</Text>
                  <Text
                    style={[
                      s.tableHeaderText,
                      { flex: 1, textAlign: "center" as const },
                    ]}
                  >
                    Us
                  </Text>
                  <Text
                    style={[
                      s.tableHeaderText,
                      { flex: 1, textAlign: "center" as const },
                    ]}
                  >
                    FACEIT
                  </Text>
                  <Text
                    style={[
                      s.tableHeaderText,
                      { flex: 1, textAlign: "center" as const },
                    ]}
                  >
                    Leetify
                  </Text>
                </View>
                {[
                  ["Replay Analysis", "✓", "—", "✓"],
                  ["Skill Matchmaking", "✓", "✓", "—"],
                  ["Verified Scores", "✓", "—", "—"],
                  ["Prize Distribution", "✓", "~", "—"],
                  ["Multi-Game", "✓", "✓", "—"],
                  ["Freemium", "✓", "—", "✓"],
                  ["Partner-Ready APIs", "✓", "—", "—"],
                ].map((row, i) => (
                  <View
                    key={i}
                    style={[
                      s.tableRow,
                      i % 2 === 0 ? { backgroundColor: "#fafafa" } : {},
                    ]}
                  >
                    <Text style={[s.tableCell, { flex: 2 }]}>{row[0]}</Text>
                    <Text
                      style={[
                        s.tableCellHighlight,
                        { flex: 1, textAlign: "center" as const },
                      ]}
                    >
                      {row[1]}
                    </Text>
                    <Text
                      style={[
                        s.tableCell,
                        { flex: 1, textAlign: "center" as const },
                      ]}
                    >
                      {row[2]}
                    </Text>
                    <Text
                      style={[
                        s.tableCell,
                        { flex: 1, textAlign: "center" as const },
                      ]}
                    >
                      {row[3]}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={[s.small, s.mt8]}>
                LeetGaming.PRO is the only platform offering all six
                capabilities in a single integrated ecosystem.
              </Text>
            </View>
          </View>

          {/* ROW 3: Roadmap + Financial Projections ──────────── */}
          <View style={[s.row, s.mb12]}>
            <View style={[s.col2, { maxWidth: "50%" }]}>
              <Text style={s.sectionTitle}>ROADMAP</Text>
              {[
                {
                  label: "Phase 1",
                  title: "Production Stabilization",
                  period: "Q4 2025 · ✅ Complete",
                  items: "Infra, auth, billing, replay engine",
                },
                {
                  label: "Phase 2",
                  title: "Core Feature Completion",
                  period: "Q1 2026 · 🔄 In Progress",
                  items: "Tournament system, advanced analytics, verified score surfaces",
                },
                {
                  label: "Phase 3",
                  title: "Infrastructure Expansion",
                  period: "Q1–Q2 2026",
                  items: "Partner APIs, external score rails, settlement integrations",
                },
                {
                  label: "Phase 4",
                  title: "Scale & Expansion",
                  period: "Q2–Q3 2026",
                  items: "Multi-region, 500K users, $2.5M monthly volume",
                },
              ].map((phase, i) => (
                <View key={i} style={s.phaseRow}>
                  <View style={s.phaseBadge}>
                    <Text style={s.phaseBadgeText}>{phase.label}</Text>
                  </View>
                  <View style={s.phaseContent}>
                    <Text style={s.phaseTitle}>{phase.title}</Text>
                    <Text style={s.phasePeriod}>{phase.period}</Text>
                    <Text style={s.cardText}>{phase.items}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={[s.col2, { maxWidth: "50%" }]}>
              <Text style={s.sectionTitle}>FINANCIAL PROJECTIONS</Text>
              <View style={s.row}>
                <View style={s.col3}>
                  <View style={s.card}>
                    <Text
                      style={[
                        s.small,
                        { fontFamily: "Helvetica-Bold", color: C.navy },
                      ]}
                    >
                      Conservative
                    </Text>
                    <Text style={[s.statValue, { fontSize: 16 }]}>$90K</Text>
                    <Text style={s.small}>MRR Target</Text>
                  </View>
                </View>
                <View style={s.col3}>
                  <View
                    style={[
                      s.card,
                      { borderColor: C.orange, borderWidth: 1.5 },
                    ]}
                  >
                    <Text
                      style={[
                        s.small,
                        { fontFamily: "Helvetica-Bold", color: C.orange },
                      ]}
                    >
                      Moderate
                    </Text>
                    <Text style={[s.statValue, { fontSize: 16 }]}>$400K</Text>
                    <Text style={s.small}>MRR Target</Text>
                  </View>
                </View>
                <View style={s.col3}>
                  <View style={s.card}>
                    <Text
                      style={[
                        s.small,
                        { fontFamily: "Helvetica-Bold", color: C.navy },
                      ]}
                    >
                      Aggressive
                    </Text>
                    <Text style={[s.statValue, { fontSize: 16 }]}>$1.8M</Text>
                    <Text style={s.small}>MRR Target</Text>
                  </View>
                </View>
              </View>

              <Text style={[s.sectionTitle, s.mt8]}>TRACTION & MILESTONES</Text>
              <View style={s.row}>
                <View style={s.col2}>
                  <Bullet>Infrastructure 95% complete</Bullet>
                  <Bullet>Verified score flow embedded in core journey</Bullet>
                  <Bullet>Auth & Billing 90% live</Bullet>
                  <Bullet>Backend Services 85% deployed</Bullet>
                  <Bullet>Frontend 93% feature-complete</Bullet>
                </View>
                <View style={s.col2}>
                  <Bullet>Payment integration 80% (Stripe live)</Bullet>
                  <Bullet>Wallet system 85% operational</Bullet>
                  <Bullet>External infra expansion planned</Bullet>
                  <Bullet>Testing coverage 50%+</Bullet>
                </View>
              </View>

              <View style={[s.statBoxAlt, s.mt8]}>
                <Text style={s.statValueAlt}>100K</Text>
                <Text style={s.statLabel}>
                  North Star: Monthly Active Competitors by Year 1
                </Text>
              </View>
            </View>
          </View>

          {/* ROW 4: Team + Use of Funds + CTA ─────────────────── */}
          <View style={s.row}>
            <View style={[s.col2, { maxWidth: "35%" }]}>
              <Text style={s.sectionTitle}>TEAM</Text>
              <View style={s.card}>
                <Text style={s.cardTitle}>Pedro Savelis — CTO & Founder</Text>
                <Text style={s.cardText}>
                  Former competitive FPS player. 15+ years software engineering.
                  Enterprise distributed systems, blockchain, gaming infra.
                </Text>
              </View>
              <Text style={[s.small, s.mb4]}>
                Open Advisor slots: Esports Industry, Technical Architecture,
                Growth & Investment
              </Text>
              <Text style={[s.small, { fontFamily: "Helvetica-Bold" }]}>
                Growing 4 → 20+ team members in 2026
              </Text>
            </View>

            <View style={[s.col2, { maxWidth: "30%" }]}>
              <Text style={s.sectionTitle}>USE OF FUNDS</Text>
              <Bullet>40% — Engineering & Product</Bullet>
              <Bullet>25% — Marketing & User Acquisition</Bullet>
              <Bullet>20% — Operations & Infrastructure</Bullet>
              <Bullet>15% — Legal, Compliance & Reserves</Bullet>
            </View>

            <View style={[s.col2, { maxWidth: "35%" }]}>
              <Text style={s.sectionTitle}>SCORES INFRASTRUCTURE</Text>
              <View style={s.row}>
                <View style={s.col2}>
                  <Bullet>6-provider score ingestion</Bullet>
                  <Bullet>Consensus verification lifecycle</Bullet>
                  <Bullet>Dispute-aware finalization window</Bullet>
                </View>
                <View style={s.col2}>
                  <Bullet>Prize / reward settlement rails</Bullet>
                  <Bullet>Embeddable UI and partner-ready surfaces</Bullet>
                  <Bullet>Polygon + Solana oracle targets</Bullet>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ──── FOOTER ──── */}
        <View style={s.footer}>
          <View>
            <Text style={s.footerText}>
              LEET
              <Text style={{ color: C.lime }}>GAMING</Text>
              .PRO — Confidential
            </Text>
            <Text style={[s.footerText, { fontSize: 6 }]}>
              This document contains forward-looking statements and projections.
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Link src="https://leetgaming.pro/investors" style={s.footerLink}>
              leetgaming.pro/investors
            </Link>
            <Link
              src="mailto:investors@leetgaming.pro"
              style={[s.footerText, { textDecoration: "none" }]}
            >
              investors@leetgaming.pro
            </Link>
          </View>
        </View>
      </Page>
    </Document>
  );
}
