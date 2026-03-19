"use client";

import React from "react";
import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Locale } from "@/lib/i18n";
import { getTierOneLocale } from "@/lib/i18n";
import { investorOverviewCopy } from "@/lib/investors/overview-copy";
import { roadmapTimelineCopy } from "@/lib/investors/shared-copy";

const CONTACT_EMAIL = "investors@leetgaming.pro";
const CALENDLY_URL = "https://calendly.com/leetgaming-pro/investor-meeting";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontFamily: "Helvetica",
    fontSize: 9,
    backgroundColor: "#ffffff",
    color: "#34445C",
  },
  header: {
    backgroundColor: "#34445C",
    padding: 18,
    marginBottom: 18,
  },
  logo: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#F5F0E1",
  },
  subtitle: {
    marginTop: 6,
    color: "#DCFF37",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: "#FF4654",
  },
  body: {
    color: "#4B5563",
    lineHeight: 1.5,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  col: {
    flex: 1,
  },
  statCard: {
    borderWidth: 1,
    borderColor: "#FFE2E5",
    backgroundColor: "#FFF6F7",
    padding: 10,
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#FF4654",
  },
  statLabel: {
    marginTop: 2,
    fontSize: 7.5,
    color: "#6B7280",
  },
  bullet: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  bulletDot: {
    width: 4,
    height: 4,
    marginTop: 4,
    backgroundColor: "#FF4654",
  },
  bulletText: {
    flex: 1,
    color: "#4B5563",
    lineHeight: 1.4,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  chip: {
    marginTop: 4,
    color: "#FF4654",
    fontSize: 7.5,
  },
  footer: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  link: {
    color: "#FF4654",
    textDecoration: "none",
    fontFamily: "Helvetica-Bold",
  },
});

function Bullet({ children }: { children: string }) {
  return (
    <View style={styles.bullet}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export function OnePagerDocument({ locale = "en-US" }: { locale?: Locale }) {
  const tierOneLocale = getTierOneLocale(locale);
  const copy = investorOverviewCopy[tierOneLocale];
  const roadmap = roadmapTimelineCopy[tierOneLocale];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>LEETGAMING.PRO</Text>
          <Text style={styles.subtitle}>
            {copy.heroTitlePrefix} {copy.heroTitleAccent}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.heroLabel}</Text>
          <Text style={styles.body}>{copy.heroDescription}</Text>
        </View>

        <View style={[styles.section, styles.row]}>
          {copy.heroStats.map((stat) => (
            <View key={stat.label} style={[styles.col, styles.statCard]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, styles.row]}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>
              {copy.sections.opportunityTitle}
            </Text>
            {copy.marketSegments.slice(0, 4).map((segment) => (
              <View key={segment.label} style={styles.card}>
                <Text style={styles.cardTitle}>{segment.label}</Text>
                <Text style={styles.body}>
                  {segment.value} · {segment.growth}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>{copy.sections.whyNowTitle}</Text>
            {copy.whyNowReasons.map((reason) => (
              <Bullet key={reason}>{reason}</Bullet>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.row]}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>{copy.sections.moatTitle}</Text>
            <Text style={styles.body}>{copy.sections.moatBody}</Text>
            {copy.scoreInfrastructurePillars.map((pillar) => (
              <View key={pillar.title} style={styles.card}>
                <Text style={styles.cardTitle}>{pillar.title}</Text>
                <Text style={styles.body}>{pillar.description}</Text>
                <Text style={styles.chip}>{pillar.chips.join(" · ")}</Text>
              </View>
            ))}
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>
              {copy.sections.revenueTitle}
            </Text>
            {copy.revenueStreams.map((stream) => (
              <View key={stream.title} style={styles.card}>
                <Text style={styles.cardTitle}>{stream.title}</Text>
                <Text style={styles.body}>{stream.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.row]}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>
              {copy.sections.unitEconomics}
            </Text>
            {copy.unitEconomics.map((item) => (
              <Bullet key={item.label}>{`${item.label}: ${item.value}`}</Bullet>
            ))}
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>
              {copy.sections.milestonesTitle}
            </Text>
            {roadmap.phases.slice(0, 3).map((phase) => (
              <View key={phase.phase} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {phase.phase} · {phase.title}
                </Text>
                <Text style={styles.body}>{phase.period}</Text>
                <Text style={styles.body}>{phase.items[0]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {copy.sections.leadershipTitle}
          </Text>
          <Text style={styles.body}>{copy.founderDescription}</Text>
          <Text style={styles.chip}>{copy.founderSkills.join(" · ")}</Text>
        </View>

        <View style={styles.footer}>
          <Link src={CALENDLY_URL} style={styles.link}>
            {copy.ctas.meeting}
          </Link>
          <Link src={`mailto:${CONTACT_EMAIL}`} style={styles.link}>
            {CONTACT_EMAIL}
          </Link>
        </View>
      </Page>
    </Document>
  );
}
