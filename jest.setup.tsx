/**
 * Jest Setup File
 * Runs before all tests to configure the testing environment
 */

import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: "/",
      query: {},
      asPath: "/",
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession() {
    return {
      data: null,
      status: "unauthenticated",
    };
  },
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
interface MockMotionProps {
  children?: React.ReactNode;
  [key: string]: unknown;
}

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: MockMotionProps) => (
      <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
    ),
    span: ({ children, ...props }: MockMotionProps) => (
      <span {...(props as React.HTMLAttributes<HTMLSpanElement>)}>
        {children}
      </span>
    ),
    button: ({ children, ...props }: MockMotionProps) => (
      <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void {}
}
global.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}
global.ResizeObserver = MockResizeObserver;

// Suppress console errors/warnings in tests (optional)
global.console = {
  ...console,
  // Uncomment to suppress specific console methods
  // error: jest.fn(),
  // warn: jest.fn(),
};

// Set up global test timeout
jest.setTimeout(10000);
