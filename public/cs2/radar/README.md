# CS2 Radar Images - Licensing & Setup Guide

This directory contains 2D radar/overview images for Counter-Strike 2 maps used in the Premium Heatmap visualization.

## 📋 Current Status

| Map | File | Status | Source |
|-----|------|--------|--------|
| de_inferno | `de_inferno.webp` | ✅ Available | Community |
| de_dust2 | `de_dust2.webp` | ❌ Missing | - |
| de_mirage | `de_mirage.webp` | ❌ Missing | - |
| de_nuke | `de_nuke.webp` | ❌ Missing | - |
| de_overpass | `de_overpass.webp` | ❌ Missing | - |
| de_ancient | `de_ancient.webp` | ❌ Missing | - |
| de_anubis | `de_anubis.webp` | ❌ Missing | - |
| de_vertigo | `de_vertigo.webp` | ❌ Missing | - |

## ⚖️ Licensing Considerations

### Valve's Content Policy

CS2 map radar images are derived from Valve Corporation's game assets. According to [Valve's Video Policy](https://store.steampowered.com/video_policy):

> "We encourage our community to make videos using Valve game content... You are free to monetize your videos via ad revenue."

However, **static game assets** (like radar images) have different considerations:

1. **Extracted Game Files**: Directly extracting `.dds` or `.vtf` files from CS2's VPK archives is **not recommended** for redistribution without explicit permission.

2. **Community-Created Radars**: Many community projects create simplified or stylized radar images that are independently licensed (often MIT, CC-BY, or similar).

3. **API/CDN Sources**: Some services provide radar images through official or semi-official channels.

### Recommended Approach

For commercial or production use, we recommend:

1. ✅ **Use community-licensed radar packs** with permissive licenses
2. ✅ **Create original simplified radar designs** inspired by map layouts
3. ✅ **Use official Steam Web API** if available
4. ❌ **Avoid direct extraction** from game files without permission

---

## 🔧 How to Add Radar Images

### Option 1: Community Radar Packs (Recommended)

Several community projects provide CS2 radar images under permissive licenses:

#### SimpleRadar
- **Repository**: https://github.com/simpleradar/simpleradar
- **License**: Custom (free for personal use)
- **Format**: PNG/DDS
- **Notes**: High-quality, clean radar designs

```bash
# Example: Download and convert from SimpleRadar
curl -L "https://example.com/simpleradar/de_dust2.png" -o de_dust2.png
# Convert to WebP for better compression
magick de_dust2.png -quality 85 de_dust2.webp
```

#### CS2 Demo Manager
- **Repository**: https://github.com/akiver/cs-demo-manager
- **License**: MIT
- **Notes**: May include radar resources

### Option 2: Extract from Game Files (Personal Use Only)

If you own CS2, you can extract radar images for **personal/development use**:

```bash
# 1. Locate CS2 game files
# Default: ~/.steam/steam/steamapps/common/Counter-Strike Global Offensive/

# 2. Extract VPK files using VPKTool or similar
# Radar files are typically in: resource/overviews/

# 3. Convert DDS to WebP
magick de_dust2_radar.dds -quality 85 de_dust2.webp
```

**⚠️ Warning**: Do not redistribute extracted game files in public repositories.

### Option 3: Create Original Radar Designs

For full licensing freedom, create original radar designs:

1. Use map layout references from the [CS2 Wiki](https://counterstrike.fandom.com/wiki/)
2. Create simplified vector designs in Figma/Illustrator
3. Export as WebP (512x512 or 1024x1024 recommended)

#### Design Guidelines

```
- Background: Dark gray (#1a1a2e) or transparent
- Walls/Obstacles: Light gray (#4a4a5a)
- Bombsites: Red tint (#ff4654) at 20% opacity
- CT Spawn: Blue marker (#00a8ff)
- T Spawn: Yellow/Orange marker (#ffb800)
- Mid: Neutral highlight
```

### Option 4: Use External CDN (Runtime)

Configure the heatmap to load radars from an external CDN:

```typescript
// In premium-heatmap.tsx, update MAP_CONFIG:
const MAP_CONFIG = {
  de_dust2: {
    displayName: "Dust 2",
    radarUrl: "https://your-cdn.com/cs2/radars/de_dust2.webp",
    // ... other config
  }
};
```

---

## 📁 File Specifications

### Required Format

| Property | Value |
|----------|-------|
| Format | WebP (preferred) or PNG |
| Dimensions | 1024x1024 px (recommended) |
| Color Space | sRGB |
| Compression | Lossy WebP @ 85% quality |
| Max File Size | ~100KB |

### Naming Convention

```
de_{mapname}.webp
```

Examples:
- `de_dust2.webp`
- `de_mirage.webp`
- `de_inferno.webp`

### Directory Structure

```
public/cs2/radar/
├── README.md          # This file
├── LICENSE            # License file for radar images
├── de_inferno.webp    # ✅ Available
├── de_dust2.webp      # ❌ Add this
├── de_mirage.webp     # ❌ Add this
├── de_nuke.webp       # ❌ Add this
├── de_overpass.webp   # ❌ Add this
├── de_ancient.webp    # ❌ Add this
├── de_anubis.webp     # ❌ Add this
└── de_vertigo.webp    # ❌ Add this
```

---

## 🖼️ Image Conversion Scripts

### Convert PNG to WebP (macOS/Linux)

```bash
#!/bin/bash
# convert-radars.sh

for png in *.png; do
  name="${png%.png}"
  magick "$png" -resize 1024x1024 -quality 85 "${name}.webp"
  echo "Converted: ${name}.webp"
done
```

### Convert DDS to WebP

```bash
#!/bin/bash
# convert-dds.sh

for dds in *.dds; do
  name="${dds%.dds}"
  magick "$dds" -resize 1024x1024 -quality 85 "${name}.webp"
  echo "Converted: ${name}.webp"
done
```

### Batch Download from CDN

```bash
#!/bin/bash
# download-radars.sh

MAPS=("de_dust2" "de_mirage" "de_nuke" "de_overpass" "de_ancient" "de_anubis" "de_vertigo")
CDN_URL="https://your-cdn.com/cs2/radars"

for map in "${MAPS[@]}"; do
  curl -L "${CDN_URL}/${map}.webp" -o "${map}.webp"
  echo "Downloaded: ${map}.webp"
done
```

---

## ✅ Verification Checklist

After adding radar images, verify:

- [ ] File exists in `/public/cs2/radar/`
- [ ] File format is WebP or PNG
- [ ] File size is under 100KB
- [ ] Dimensions are 1024x1024 (or 512x512 minimum)
- [ ] Map name matches `de_{mapname}.webp` convention
- [ ] Image displays correctly in Premium Heatmap
- [ ] License file updated with attribution

---

## 📄 License Attribution Template

If using community-sourced radars, add attribution to `LICENSE`:

```
CS2 Radar Images Attribution
============================

de_inferno.webp
  Source: [Source Name]
  License: [License Type]
  URL: [Source URL]

de_dust2.webp
  Source: [Source Name]  
  License: [License Type]
  URL: [Source URL]

[... additional maps ...]
```

---

## 🔗 Resources

- [Valve Video Policy](https://store.steampowered.com/video_policy)
- [CS2 Workshop Tools](https://developer.valvesoftware.com/wiki/Counter-Strike_2/Workshop_Tools)
- [ImageMagick Documentation](https://imagemagick.org/script/convert.php)
- [WebP Compression Guide](https://developers.google.com/speed/webp)

---

## 🤝 Contributing

To contribute radar images:

1. Ensure you have proper licensing rights
2. Follow the file specifications above
3. Add attribution to the LICENSE file
4. Submit a pull request with the new images

---

*Last updated: January 2026*
