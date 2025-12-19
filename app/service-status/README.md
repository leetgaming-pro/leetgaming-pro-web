# Service Status Page - Maintenance Guide

> **Purpose:** This page showcases LeetGaming.PRO's platform engineering work to non-technical users.
>
> **Location:** `/service-status`
>
> **Last Updated:** December 19, 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Data Sources](#data-sources)
3. [Updating Statistics](#updating-statistics)
4. [Automation Scripts](#automation-scripts)
5. [Adding New Services](#adding-new-services)
6. [Adding Milestones](#adding-milestones)
7. [Updating the Roadmap](#updating-the-roadmap)
8. [Styling Guidelines](#styling-guidelines)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Service Status page consists of three main tabs:

| Tab | Purpose | Update Frequency |
|-----|---------|------------------|
| **Service Status** | Shows real-time service health | Real-time (future) / Manual |
| **Work History** | Displays development progress | Weekly or after major releases |
| **Roadmap** | Shows product roadmap phases | After sprint planning |

### File Structure

```
app/service-status/
├── page.tsx          # Main page component (~1,400 lines)
├── layout.tsx        # SEO metadata
├── README.md         # This file
└── data/
    └── status-data.ts  # Centralized data (to be created)

scripts/
├── update-status-metrics.sh  # Automation script
└── collect-codebase-stats.sh # Stats collection
```

---

## Data Sources

### Current Data Location

All data is currently defined in `page.tsx`. For easier maintenance, data is organized in these sections:

| Data Type | Line Range (approx) | Description |
|-----------|---------------------|-------------|
| `services` | ~50-120 | Service configurations |
| `implementationStats` | ~125-145 | Codebase metrics |
| `workHistory` | ~160-170 | Progress over time |
| `sprintVelocity` | ~150-158 | Sprint metrics |
| `categoryBreakdown` | ~185-195 | Feature categories |
| `milestones` | ~220-290 | Key achievements |
| `roadmapPhases` | ~295-380 | Product roadmap |

### Data Update Process

1. **Manual Updates:** Edit the data arrays in `page.tsx`
2. **Automated Updates:** Run `scripts/update-status-metrics.sh` (see below)
3. **CI Integration:** Add to GitHub Actions for automatic updates

---

## Updating Statistics

### Implementation Stats

Update the `implementationStats` object with current metrics:

```typescript
const implementationStats = {
  totalFeatures: 147,      // From MASTER-ITERATION.md or GitHub issues
  completed: 118,          // Count of completed features
  inProgress: 21,          // Count of in-progress features
  planned: 8,              // Count of planned features
  linesOfCode: {
    frontend: 80720,       // Run: find leetgaming-pro-web -name "*.tsx" -o -name "*.ts" | xargs wc -l
    backend: 45300,        // Run: find replay-api -name "*.go" | xargs wc -l
    infrastructure: 12500, // Run: find k8s infra -name "*.yaml" -o -name "*.tf" | xargs wc -l
    tests: 8900,           // Run: find . -name "*_test.go" -o -name "*.spec.ts" | xargs wc -l
  },
  components: 279,         // Run: find leetgaming-pro-web/components -name "*.tsx" | wc -l
  pages: 62,               // Run: find leetgaming-pro-web/app -name "page.tsx" | wc -l
  apiEndpoints: 68,        // Count from replay-api/cmd/rest-api/routing/router.go
  testCoverage: 85,        // From: make test-coverage
};
```

### Work History Timeline

Add new entries to track progress over time:

```typescript
const workHistory = [
  // ... existing entries
  { date: "Jan 5", completed: 125, inProgress: 18, velocity: 30 },
];
```

---

## Automation Scripts

### Script: `scripts/update-status-metrics.sh`

Create this script to automate data collection:

```bash
#!/bin/bash
# scripts/update-status-metrics.sh
# Collects codebase metrics and outputs JSON for the status page

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "📊 Collecting LeetGaming.PRO metrics..."

# Frontend metrics
FRONTEND_LOC=$(find "$PROJECT_ROOT/leetgaming-pro-web" \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
COMPONENTS=$(find "$PROJECT_ROOT/leetgaming-pro-web/components" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
PAGES=$(find "$PROJECT_ROOT/leetgaming-pro-web/app" -name "page.tsx" 2>/dev/null | wc -l | tr -d ' ')

# Backend metrics
BACKEND_LOC=$(find "$PROJECT_ROOT/replay-api" -name "*.go" -not -path "*/vendor/*" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
API_ENDPOINTS=$(grep -c "router\." "$PROJECT_ROOT/replay-api/cmd/rest-api/routing/router.go" 2>/dev/null || echo "0")

# Infrastructure metrics
INFRA_LOC=$(find "$PROJECT_ROOT/k8s" "$PROJECT_ROOT/infra" \( -name "*.yaml" -o -name "*.tf" \) 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')

# Test metrics
E2E_TESTS=$(find "$PROJECT_ROOT/leetgaming-pro-web/e2e" -name "*.spec.ts" -o -name "*.test.ts" 2>/dev/null | wc -l | tr -d ' ')
UNIT_TESTS=$(find "$PROJECT_ROOT/replay-api" -name "*_test.go" -not -path "*/vendor/*" 2>/dev/null | wc -l | tr -d ' ')

# Output JSON
cat << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "linesOfCode": {
    "frontend": ${FRONTEND_LOC:-0},
    "backend": ${BACKEND_LOC:-0},
    "infrastructure": ${INFRA_LOC:-0}
  },
  "components": ${COMPONENTS:-0},
  "pages": ${PAGES:-0},
  "apiEndpoints": ${API_ENDPOINTS:-0},
  "e2eTests": ${E2E_TESTS:-0},
  "unitTests": ${UNIT_TESTS:-0}
}
EOF

echo ""
echo "✅ Metrics collected successfully!"
echo ""
echo "📋 Summary:"
echo "   Frontend LoC:    ${FRONTEND_LOC:-0}"
echo "   Backend LoC:     ${BACKEND_LOC:-0}"
echo "   Components:      ${COMPONENTS:-0}"
echo "   Pages:           ${PAGES:-0}"
echo "   API Endpoints:   ${API_ENDPOINTS:-0}"
echo "   E2E Tests:       ${E2E_TESTS:-0}"
echo "   Unit Tests:      ${UNIT_TESTS:-0}"
```

### Running the Script

```bash
# Make executable
chmod +x scripts/update-status-metrics.sh

# Run and save output
./scripts/update-status-metrics.sh > metrics.json

# Or add to Makefile
make status-metrics
```

---

## Adding New Services

To add a new service to the status page:

```typescript
// In page.tsx, add to the `services` array:
{
  name: "New Service Name",
  status: "operational", // operational | degraded | outage | maintenance
  latency: 25,           // Average latency in ms
  uptime: 99.95,         // Uptime percentage
  description: "Brief description of the service",
  icon: "solar:icon-name-bold", // From Iconify Solar icons
  region: "US-East",     // Deployment region
  metrics: [             // Optional: For sparkline chart
    { timestamp: "00:00", value: 20 },
    { timestamp: "Now", value: 25 },
  ],
}
```

### Available Status Values

| Status | Color | Icon | Use When |
|--------|-------|------|----------|
| `operational` | Green | ✓ | Service is fully functional |
| `degraded` | Yellow | ⚠ | Slower than normal but working |
| `outage` | Red | ✗ | Service is down |
| `maintenance` | Purple | ⚙ | Planned maintenance window |

---

## Adding Milestones

Add new milestones when completing significant features:

```typescript
// In page.tsx, add to the `milestones` array:
{
  id: "m11",
  title: "Feature Name",
  date: "Jan 5, 2026",
  description: "Brief description of the achievement",
  category: "backend", // backend | frontend | security | feature | infrastructure
  impact: "high",      // high | medium | low
}
```

### Category Icons

| Category | Icon | Color |
|----------|------|-------|
| `backend` | `solar:server-2-bold` | Cyan |
| `frontend` | `solar:monitor-smartphone-bold` | Orange |
| `security` | `solar:shield-keyhole-bold` | Lime |
| `feature` | `solar:star-shine-bold` | Purple |
| `infrastructure` | `solar:cloud-bolt-bold` | Gold |

---

## Updating the Roadmap

### Modifying Phase Progress

```typescript
// Update an existing phase:
{
  id: "phase4",
  title: "Phase 4: Test Coverage & DX",
  status: "in-progress", // completed | in-progress | planned
  progress: 90,          // Percentage complete
  targetDate: "Dec 2025",
  items: [
    { name: "Entity tests (90%+)", status: "completed" },
    { name: "E2E test expansion", status: "completed" }, // Changed from in-progress
    // ...
  ],
}
```

### Adding a New Phase

```typescript
// Add a new phase:
{
  id: "phase6",
  title: "Phase 6: AI & ML Features",
  status: "planned",
  progress: 0,
  targetDate: "Q2 2026",
  items: [
    { name: "AI highlight detection", status: "planned" },
    { name: "Player skill prediction", status: "planned" },
  ],
}
```

---

## Styling Guidelines

### Brand Colors (MUST USE)

```css
--leet-navy: #34445C;    /* Primary navy */
--leet-lime: #DCFF37;    /* Signature lime (dark mode accent) */
--leet-orange: #FF4654;  /* Battle orange (light mode accent) */
--leet-gold: #FFC700;    /* Gold accent */
--leet-cream: #F5F0E1;   /* Warm cream (replaces white) */
```

### Component Classes

| Class | Purpose |
|-------|---------|
| `esports-card` | Angular card styling |
| `leet-icon-box` | Gradient icon container |
| `leet-icon-box-sm/md/lg/xl` | Icon box sizes |

### Chart Colors

```typescript
const BRAND_COLORS = {
  lime: "#DCFF37",
  orange: "#FF4654",
  gold: "#FFC700",
  success: "#10B981",
  // ... use these for all charts
};
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Charts not rendering | Ensure `recharts` is installed: `npm install recharts` |
| Icons missing | Check Iconify icon names at https://icon-sets.iconify.design/solar/ |
| Animations janky | Reduce `framer-motion` animation complexity |
| Build fails | Run `npm run build` to check for TypeScript errors |

### Verifying Changes

```bash
# Type check
npx tsc --noEmit

# Build test
npm run build

# Dev server
npm run dev
# Visit http://localhost:3000/service-status
```

---

## CI/CD Integration

### GitHub Actions Workflow

Add to `.github/workflows/update-status.yml`:

```yaml
name: Update Status Metrics

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:      # Manual trigger

jobs:
  update-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Collect Metrics
        run: |
          chmod +x scripts/update-status-metrics.sh
          ./scripts/update-status-metrics.sh > metrics.json
          
      - name: Commit Changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add metrics.json
          git commit -m "chore: update status metrics" || exit 0
          git push
```

---

## Future Enhancements

### Planned Improvements

- [ ] Real-time service health checks via API
- [ ] Automatic incident detection and reporting
- [ ] Integration with Prometheus/Grafana metrics
- [ ] GitHub API integration for live commit activity
- [ ] Automated milestone creation from GitHub releases

### Data API (Future)

```typescript
// Future: Fetch data from API
const { data: services } = useSWR('/api/status/services');
const { data: metrics } = useSWR('/api/status/metrics');
```

---

## Contact

For questions about this page:

- **Documentation:** `/docs/ai-agents/ITERATION-GUIDE.md`
- **Design System:** `/leetgaming-pro-web/styles/globals.css`
- **Brand Guidelines:** See CSS comments in globals.css

---

**Maintained by:** LeetGaming Platform Team  
**Last Review:** December 19, 2025


