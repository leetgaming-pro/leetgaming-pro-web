/**
 * Animation System - Premium Motion Design
 * Award-winning animations with spring physics and gesture support
 */

import { Variants, Transition } from 'framer-motion';

// Spring Physics Configurations
export const springs = {
  // Subtle, professional springs
  gentle: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },

  // Snappy, responsive springs
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
  },

  // Bouncy, playful springs
  bouncy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 20,
  },

  // Smooth, flowing springs
  smooth: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 35,
  },

  // Elastic, rubber-band effect
  elastic: {
    type: 'spring' as const,
    stiffness: 600,
    damping: 15,
  },

  // Modal-specific spring (iOS-like)
  modal: {
    type: 'spring' as const,
    stiffness: 350,
    damping: 30,
    mass: 0.8,
  },
} as const;

// Easing Curves (for non-spring animations)
export const easings = {
  // Standard curves
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],

  // Premium curves
  smooth: [0.4, 0.0, 0.2, 1],
  snappy: [0.2, 0.8, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  anticipate: [0.22, 1, 0.36, 1],
  overshoot: [0.175, 0.885, 0.32, 1.275],
} as const;

// Duration Presets
export const durations = {
  instant: 0,
  fast: 0.15,
  base: 0.25,
  slow: 0.35,
  slower: 0.5,
  slowest: 0.75,
} as const;

// Page Transitions
export const pageTransitions: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  },

  slideDown: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  },

  slideLeft: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  },

  slideRight: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
  },

  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  },

  scaleUp: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
  },
};

// Modal Animations
export const modalAnimations: Record<string, Variants> = {
  // Backdrop
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Center modal (scale + fade)
  center: {
    initial: { scale: 0.9, opacity: 0, y: 20 },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: springs.modal,
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      y: 10,
      transition: { duration: durations.fast },
    },
  },

  // Bottom sheet (mobile)
  bottomSheet: {
    initial: { y: '100%', opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: springs.modal,
    },
    exit: {
      y: '100%',
      opacity: 0,
      transition: { duration: durations.base },
    },
  },

  // Side panel
  sidePanel: {
    initial: { x: '100%', opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: springs.modal,
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: { duration: durations.base },
    },
  },

  // Glass modal (blur effect)
  glass: {
    initial: { scale: 0.95, opacity: 0, backdropFilter: 'blur(0px)' },
    animate: {
      scale: 1,
      opacity: 1,
      backdropFilter: 'blur(12px)',
      transition: springs.smooth,
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      backdropFilter: 'blur(0px)',
      transition: { duration: durations.base },
    },
  },
};

// Component Animations
export const componentAnimations: Record<string, Variants> = {
  // Card hover
  cardHover: {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.02,
      y: -4,
      transition: springs.snappy,
    },
    tap: { scale: 0.98 },
  },

  // Button press
  buttonPress: {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: springs.snappy },
    tap: { scale: 0.95, transition: springs.snappy },
  },

  // Float effect
  float: {
    initial: { y: 0 },
    animate: {
      y: [-4, 4],
      transition: {
        y: {
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse' as const,
          ease: 'easeInOut',
        },
      },
    },
  },

  // Pulse effect
  pulse: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },

  // Glow pulse
  glowPulse: {
    initial: { boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)' },
    animate: {
      boxShadow: [
        '0 0 20px rgba(14, 165, 233, 0.3)',
        '0 0 40px rgba(14, 165, 233, 0.6)',
        '0 0 20px rgba(14, 165, 233, 0.3)',
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },

  // Shimmer loading
  shimmer: {
    initial: { x: '-100%' },
    animate: {
      x: '100%',
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },
};

// List/Stagger Animations
export const staggerAnimations = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },

  item: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: springs.gentle,
    },
  },

  // Fast stagger (for lists)
  fastContainer: {
    animate: {
      transition: {
        staggerChildren: 0.03,
      },
    },
  },

  // Slow stagger (for hero elements)
  slowContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
};

// Scroll Animations (Intersection Observer)
export const scrollAnimations: Record<string, Variants> = {
  fadeInUp: {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: springs.gentle,
    },
  },

  fadeInDown: {
    offscreen: { y: -50, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: springs.gentle,
    },
  },

  fadeInLeft: {
    offscreen: { x: -50, opacity: 0 },
    onscreen: {
      x: 0,
      opacity: 1,
      transition: springs.gentle,
    },
  },

  fadeInRight: {
    offscreen: { x: 50, opacity: 0 },
    onscreen: {
      x: 0,
      opacity: 1,
      transition: springs.gentle,
    },
  },

  scaleIn: {
    offscreen: { scale: 0.8, opacity: 0 },
    onscreen: {
      scale: 1,
      opacity: 1,
      transition: springs.bouncy,
    },
  },
};

// Gesture Configurations
export const gestures = {
  // Swipe to dismiss
  swipeToDismiss: {
    drag: 'y' as const,
    dragConstraints: { top: 0, bottom: 600 },
    dragElastic: { top: 0, bottom: 0.7 },
    onDragEnd: (event: any, info: { offset: { y: number } }) => {
      if (info.offset.y > 100) {
        // Trigger dismiss
        return true;
      }
      return false;
    },
  },

  // Horizontal swipe
  swipeHorizontal: {
    drag: 'x' as const,
    dragConstraints: { left: -300, right: 300 },
    dragElastic: 0.2,
  },

  // Pull to refresh
  pullToRefresh: {
    drag: 'y' as const,
    dragConstraints: { top: -100, bottom: 0 },
    dragElastic: 0.5,
  },

  // 3D tilt on hover
  tilt3D: {
    whileHover: {
      rotateX: 5,
      rotateY: 5,
      transition: springs.snappy,
    },
  },

  // Magnetic hover
  magnetic: {
    whileHover: {
      scale: 1.1,
      transition: springs.elastic,
    },
  },
};

// Number counter animation
export const numberCounterTransition: Transition = {
  duration: 0.8,
  ease: easings.easeOut as any,
};

// Loading animations
export const loadingAnimations: Record<string, Variants> = {
  dots: {
    initial: { y: 0 },
    animate: {
      y: [-10, 0, -10],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
  },

  spinner: {
    initial: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },

  pulse: {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
};

// Success/Error animations
export const feedbackAnimations: Record<string, Variants> = {
  // Checkmark draw
  checkmark: {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.5, ease: easings.easeOut as any },
        opacity: { duration: 0.2 },
      },
    },
  },

  // Error shake
  shake: {
    initial: { x: 0 },
    animate: {
      x: [-10, 10, -10, 10, -5, 5, 0],
      transition: {
        duration: 0.5,
        ease: easings.easeInOut as any,
      },
    },
  },

  // Success scale
  successScale: {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: springs.bouncy,
    },
  },
};

// Export viewport config for scroll animations
export const scrollViewport = {
  once: true,
  amount: 0.3,
  margin: '0px 0px -100px 0px',
};

// Export combined animation config
export const animations = {
  springs,
  easings,
  durations,
  pageTransitions,
  modalAnimations,
  componentAnimations,
  staggerAnimations,
  scrollAnimations,
  gestures,
  loadingAnimations,
  feedbackAnimations,
  scrollViewport,
} as const;

export default animations;
