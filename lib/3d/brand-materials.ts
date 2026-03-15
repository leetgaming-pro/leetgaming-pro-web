/**
 * Brand Materials - Three.js material presets for LeetGaming brand identity
 * Consistent 3D material system matching the brand's angular, premium esports aesthetic
 */

export const BRAND_COLORS_3D = {
  lime: '#DCFF37',
  orange: '#FF4654',
  gold: '#FFC700',
  navy: '#34445C',
  navyDark: '#1e2a38',
  cream: '#F5F0E1',
  black: '#0a0a0a',
  white: '#ffffff',
} as const;

export const BRAND_MATERIALS = {
  // Glowing lime for dark mode accents
  limeEmissive: {
    color: BRAND_COLORS_3D.lime,
    emissive: BRAND_COLORS_3D.lime,
    emissiveIntensity: 0.6,
    metalness: 0.3,
    roughness: 0.4,
    toneMapped: false,
  },

  // Battle orange for light mode accents
  orangeEmissive: {
    color: BRAND_COLORS_3D.orange,
    emissive: BRAND_COLORS_3D.orange,
    emissiveIntensity: 0.5,
    metalness: 0.3,
    roughness: 0.4,
    toneMapped: false,
  },

  // Gold metallic for trophies and prizes
  goldMetallic: {
    color: BRAND_COLORS_3D.gold,
    emissive: BRAND_COLORS_3D.gold,
    emissiveIntensity: 0.3,
    metalness: 0.9,
    roughness: 0.15,
  },

  // Navy matte for structural elements
  navyMatte: {
    color: BRAND_COLORS_3D.navy,
    metalness: 0.1,
    roughness: 0.8,
  },

  // Dark surfaces
  darkSurface: {
    color: BRAND_COLORS_3D.navyDark,
    metalness: 0.2,
    roughness: 0.7,
  },

  // Glass-like translucent
  glassLight: {
    color: BRAND_COLORS_3D.cream,
    transparent: true,
    opacity: 0.15,
    metalness: 0.1,
    roughness: 0.0,
  },

  // Wireframe accent
  wireframeAccent: {
    color: BRAND_COLORS_3D.lime,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  },
} as const;

// Particle system colors
export const PARTICLE_COLORS = {
  lime: [0.86, 1.0, 0.22] as [number, number, number],
  orange: [1.0, 0.27, 0.33] as [number, number, number],
  gold: [1.0, 0.78, 0.0] as [number, number, number],
  cream: [0.96, 0.94, 0.88] as [number, number, number],
  navy: [0.2, 0.27, 0.36] as [number, number, number],
} as const;
