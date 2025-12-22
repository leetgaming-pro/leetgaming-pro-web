# LeetGaming.PRO Brand Guidelines

**Last Updated**: December 22, 2025

---

## 🦊 Logo Usage

### Primary Logos

| Logo | File | Usage |
|------|------|-------|
| **Text Only** | `/logo-red-only-text.png` | Navbar, auth pages, mobile headers |
| **Full Logo** | `/logo-red-full.png` | Footer, about pages, marketing |
| **Fox Only** | `/logo-fox-mini.png` | Favicons, small icons |

### Logo Guidelines

- ✅ **Use `/logo-red-only-text.png`** for:
  - Sign-in / Sign-up pages
  - Onboarding flow header
  - Navbar (desktop and mobile)
  - Loading states
  - Password reset / email verification pages

- ✅ **Use `/logo-red-full.png`** for:
  - Footer (larger format with fox)
  - About/landing pages
  - Marketing materials

- ❌ **Never**:
  - Add glow/shadow effects to logos
  - Use separate fox + text combinations (use the combined logos)
  - Combine logo text with "LeetGaming" or "LeetGaming.PRO" text

### Logo Components

```tsx
import { DefaultLogo } from '@/components/logo/logo-default';    // For navbar
import { LogoGrayscale } from '@/components/logo/logo-grayscale'; // For footer
import { FullLogo } from '@/components/logo/logo-full';           // For full display
```

---

## 🎨 Color Palette

### Primary Colors
| Color | Hex | RGB | CSS Variable | Usage |
|-------|-----|-----|--------------|-------|
| **Navy** | `#34445C` | `rgb(52, 68, 92)` | `--leet-navy` | Primary backgrounds, headers, buttons (light mode) |
| **Dark Navy** | `#1e2a38` | `rgb(30, 42, 56)` | `--leet-navy-dark` | Darker variants, gradients |
| **Lime** | `#DCFF37` | `rgb(220, 255, 55)` | `--leet-lime` | Signature accent, buttons (dark mode) |
| **Battle Orange** | `#FF4654` | `rgb(255, 70, 84)` | `--leet-orange` | CTAs, highlights, accents (light mode) |
| **Gold** | `#FFC700` | `rgb(255, 199, 0)` | `--leet-gold` | Gradient end, premium features |

### Neutral Colors
| Color | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| **Cream** | `#F5F0E1` | `--leet-cream` | **BRAND WHITE** - Use instead of pure white everywhere |
| **Rich Black** | `#0a0a0a` | `--leet-black` | Dark mode backgrounds |

### ⚠️ IMPORTANT: Cream Instead of White
**NEVER use pure white (`#FFFFFF`) in this brand.** Always use **Cream (`#F5F0E1`)** for:
- Text on dark backgrounds
- Card backgrounds in light mode
- Icons on dark backgrounds
- Any element that would normally be white

```css
/* ❌ WRONG */
color: white;
color: #FFFFFF;
background: white;

/* ✅ CORRECT */
color: rgb(var(--leet-cream));
color: #F5F0E1;
background: rgb(var(--leet-cream));

/* Tailwind classes */
className="text-leet-cream bg-leet-cream"
```

To revert to pure white in the future, change ONE line in `globals.css`:
```css
--leet-cream: 255, 255, 255; /* Change from 245, 240, 225 */
```

---

## ⚠️ CONTRAST RULES (CRITICAL)

### 1. Navy Background (`#34445C`)
```
✅ DO: Use CREAM text (#F5F0E1)
✅ DO: Use rgba(245,240,225,0.7) for muted/secondary text
❌ DON'T: Use black or dark text - UNREADABLE!
```

### 2. Lime Background (`#DCFF37`)
```
✅ DO: Use NAVY text (#34445C) - excellent contrast
✅ DO: Use dark icons
❌ DON'T: Use cream/white text - POOR CONTRAST!
```

### 3. Orange/Gold Gradient (`#FF4654 → #FFC700`)
```
✅ DO: Use CREAM text (#F5F0E1)
✅ DO: Use for primary CTAs and highlights
```

---

## 🔲 Shape Language

### Edgy Corners (Signature Style)
- **Never use `rounded-full`** for branded elements
- Use `rounded-none` with `clip-path` for the signature cut corner:

```css
clip-path: polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%);
```

### Standard Cut Sizes
| Size | Cut Amount | Usage |
|------|------------|-------|
| Small | `8px` | Buttons, chips |
| Medium | `10px` | Cards, icons |
| Large | `12px` | Headers, hero elements |
| XL | `16px` | Page headers, modals |

---

## 📦 Icon Containers

### ❌ WRONG (Don't do this)
```html
<!-- BAD: Generic gradient, rounded, wrong colors -->
<div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary">
  <Icon class="text-white" />
</div>
```

### ✅ CORRECT (Use this)
```html
<!-- GOOD: Brand gradient, edgy corners, correct contrast -->
<div class="leet-hero-icon">
  <Icon width={40} />
</div>

<!-- Or with explicit classes -->
<div class="w-12 h-12 flex items-center justify-center 
            bg-gradient-to-br from-[#FF4654] to-[#FFC700] 
            dark:from-[#DCFF37] dark:to-[#34445C]
            text-white dark:text-[#34445C]"
     style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)">
  <Icon width={24} />
</div>
```

---

## 🎯 CSS Utility Classes

### Background Classes
| Class | Light Mode | Dark Mode |
|-------|------------|-----------|
| `.leet-navy-bg` | Navy bg, white text | Navy bg, white text |
| `.leet-lime-bg` | Lime bg, navy text | Lime bg, navy text |
| `.leet-orange-gradient-bg` | Orange→Gold, white text | Orange→Gold, white text |

### Icon Box Classes
| Class | Size |
|-------|------|
| `.leet-icon-box` | Base styling |
| `.leet-icon-box-sm` | 2rem (32px) |
| `.leet-icon-box-md` | 3rem (48px) |
| `.leet-icon-box-lg` | 4rem (64px) |
| `.leet-icon-box-xl` | 5rem (80px) |
| `.leet-hero-icon` | 5rem, centered, for empty states |

### Text Classes
| Class | Usage |
|-------|-------|
| `.text-on-navy` | White text for navy backgrounds |
| `.text-on-navy-muted` | 70% white for secondary text on navy |
| `.text-on-lime` | Navy text for lime backgrounds |
| `.text-on-lime-muted` | 70% navy for secondary text on lime |
| `.leet-text-accent` | Orange (light) / Lime (dark) |

### Component Classes
| Class | Usage |
|-------|-------|
| `.leet-card` | Standard card with edgy corners |
| `.leet-card-on-navy` | Card nested on navy background |
| `.leet-stats-card` | Stats/metrics card |
| `.leet-page-header` | Page header container |
| `.leet-page-header-icon` | Page header icon box |
| `.leet-btn-primary` | Primary action button |
| `.leet-btn-secondary` | Secondary action button |

---

## 🚫 Common Mistakes to Avoid

### 1. Wrong Icon Container
```html
<!-- ❌ BAD -->
<div class="rounded-full bg-gradient-to-br from-primary to-secondary">
  <Icon class="text-white" />
</div>

<!-- ✅ GOOD -->
<div class="leet-icon-box leet-icon-box-lg">
  <Icon width={32} />
</div>
```

### 2. Wrong Text on Dark Background
```html
<!-- ❌ BAD: Black text on navy -->
<div class="bg-[#34445C]">
  <p class="text-black">Hard to read!</p>
</div>

<!-- ✅ GOOD: White text on navy -->
<div class="leet-navy-bg">
  <p>Easy to read!</p>
</div>
```

### 3. Wrong Text on Lime Background
```html
<!-- ❌ BAD: White text on lime -->
<div class="bg-[#DCFF37]">
  <p class="text-white">Hard to read!</p>
</div>

<!-- ✅ GOOD: Navy text on lime -->
<div class="leet-lime-bg">
  <p>Easy to read!</p>
</div>
```

### 4. Using `rounded-full` for Branded Elements
```html
<!-- ❌ BAD -->
<button class="rounded-full">Click</button>

<!-- ✅ GOOD -->
<button class="rounded-none esports-btn">Click</button>
```

### 5. Using Default Theme Colors
```html
<!-- ❌ BAD: Generic NextUI colors -->
<div class="bg-primary text-primary-foreground">

<!-- ✅ GOOD: Brand colors -->
<div class="bg-[#34445C] text-white dark:bg-[#DCFF37] dark:text-[#34445C]">
```

---

## 📋 Pre-Commit Checklist

Before committing UI changes, verify:

- [ ] No `rounded-full` on branded elements (use clip-path instead)
- [ ] No white text on lime background
- [ ] No black/dark text on navy background
- [ ] Icon containers use `leet-icon-box` or explicit brand gradients
- [ ] Buttons use edgy corners (`rounded-none` with clip-path)
- [ ] Cards use `leet-card` or explicit brand styling
- [ ] Theme adapts properly (lime for dark mode, orange for light mode)

---

## 🎨 Quick Reference

### Light Mode
- Primary BG: Navy (`#34445C`)
- Accent: Orange→Gold gradient
- Text on dark: White
- Cards: White with orange border

### Dark Mode
- Primary BG: Rich Black (`#0a0a0a`)
- Accent: Lime (`#DCFF37`)
- Text on accent: Navy (`#34445C`)
- Cards: Black with lime border

