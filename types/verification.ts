/**
 * Age Verification & KYC Types
 * Per PRD E.8.2 - Regulatory Compliance & Legal Requirements
 */

// Age verification methods
export type VerificationMethod =
  | "date-of-birth" // Basic DOB input
  | "document-scan" // ID document verification
  | "third-party" // Third party service (e.g., Jumio, Onfido)
  | "payment-method" // Credit card verification (18+ required)
  | "parental-consent"; // For minors with parental approval

// Document types for verification
export type DocumentType =
  | "passport"
  | "drivers-license"
  | "national-id"
  | "residence-permit";

// KYC verification levels
export type KYCLevel =
  | "none" // No verification
  | "basic" // Email + phone verified
  | "intermediate" // Basic + identity verified
  | "full"; // All verifications including address

// Verification status
export type VerificationStatus =
  | "not-started"
  | "pending"
  | "in-review"
  | "approved"
  | "rejected"
  | "expired";

// Age requirements by region/game
export interface AgeRequirement {
  region: string;
  minimumAge: number;
  requiresParentalConsent?: {
    underAge: number;
    consentRequired: boolean;
  };
  restrictedFeatures?: string[]; // Features blocked for minors
  gamblingRestricted?: boolean;
}

// Default age requirements per PRD E.8.2
export const REGION_AGE_REQUIREMENTS: Record<string, AgeRequirement> = {
  US: {
    region: "United States",
    minimumAge: 13,
    requiresParentalConsent: { underAge: 18, consentRequired: true },
    restrictedFeatures: ["real-money-tournaments", "trading", "crypto-wallet"],
    gamblingRestricted: true,
  },
  BR: {
    region: "Brazil",
    minimumAge: 13,
    requiresParentalConsent: { underAge: 18, consentRequired: true },
    restrictedFeatures: ["real-money-tournaments", "trading"],
    gamblingRestricted: false,
  },
  EU: {
    region: "European Union",
    minimumAge: 16, // GDPR
    requiresParentalConsent: { underAge: 18, consentRequired: true },
    restrictedFeatures: ["real-money-tournaments"],
    gamblingRestricted: true,
  },
  KR: {
    region: "South Korea",
    minimumAge: 14,
    requiresParentalConsent: { underAge: 18, consentRequired: true },
    restrictedFeatures: ["real-money-tournaments", "trading", "extended-play"],
    gamblingRestricted: true,
  },
  CN: {
    region: "China",
    minimumAge: 8,
    requiresParentalConsent: { underAge: 18, consentRequired: true },
    restrictedFeatures: ["real-money-transactions", "trading", "extended-play"],
    gamblingRestricted: true,
  },
};

// User verification data
export interface UserVerification {
  userId: string;

  // Age verification
  ageVerified: boolean;
  dateOfBirth?: string;
  ageVerificationMethod?: VerificationMethod;
  ageVerifiedAt?: string;

  // KYC data
  kycLevel: KYCLevel;
  kycStatus: VerificationStatus;

  // Identity verification
  identityVerified: boolean;
  identityDocument?: {
    type: DocumentType;
    number: string; // Encrypted/masked
    country: string;
    expiresAt?: string;
  };

  // Address verification
  addressVerified: boolean;
  verifiedAddress?: {
    country: string;
    region: string;
    city: string;
    postalCode: string;
    // Full address stored securely, not exposed
  };

  // Additional checks
  sanctionsChecked: boolean;
  pepChecked: boolean; // Politically Exposed Person

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastVerifiedAt?: string;
  expiresAt?: string;
}

// Verification request/submission
export interface VerificationRequest {
  type: "age" | "identity" | "address";
  method: VerificationMethod;

  // For DOB verification
  dateOfBirth?: string;

  // For document verification
  document?: {
    type: DocumentType;
    frontImage?: File;
    backImage?: File;
    selfieImage?: File; // For face match
  };

  // For address verification
  address?: {
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };

  // Proof document (utility bill, etc)
  proofDocument?: File;

  // Parental consent
  parentalConsent?: {
    parentEmail: string;
    parentName: string;
    consentDocuments?: File[];
  };
}

// Verification result
export interface VerificationResult {
  success: boolean;
  status: VerificationStatus;
  type: "age" | "identity" | "address";

  // Details
  verifiedAt?: string;
  expiresAt?: string;

  // Errors
  errors?: {
    code: string;
    message: string;
    field?: string;
  }[];

  // Required actions
  requiredActions?: string[];

  // New KYC level after verification
  newKycLevel?: KYCLevel;
}

// Feature access based on verification
export interface FeatureAccess {
  feature: string;
  accessible: boolean;
  requiresVerification?: {
    kycLevel: KYCLevel;
    ageVerification?: boolean;
    region?: string[];
  };
  blockedReason?: string;
}

// Features requiring verification per PRD E.8.2
export const FEATURE_REQUIREMENTS: Record<
  string,
  { kycLevel: KYCLevel; minAge?: number }
> = {
  "free-tournaments": { kycLevel: "none", minAge: 13 },
  "basic-matchmaking": { kycLevel: "none", minAge: 13 },
  "replay-upload": { kycLevel: "basic", minAge: 13 },
  "coaching-booking": { kycLevel: "basic", minAge: 13 },
  "store-purchase": { kycLevel: "basic", minAge: 13 },
  "wallet-deposit": { kycLevel: "intermediate", minAge: 18 },
  "wallet-withdraw": { kycLevel: "full", minAge: 18 },
  "real-money-tournaments": { kycLevel: "intermediate", minAge: 18 },
  "crypto-transactions": { kycLevel: "full", minAge: 18 },
  "nft-trading": { kycLevel: "intermediate", minAge: 18 },
  "p2p-trading": { kycLevel: "full", minAge: 18 },
  "high-value-transactions": { kycLevel: "full", minAge: 18 }, // >$10,000
};

// Helper functions
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export function isAgeVerified(verification: UserVerification | null): boolean {
  return verification?.ageVerified ?? false;
}

export function getKYCLevelLabel(level: KYCLevel): string {
  const labels: Record<KYCLevel, string> = {
    none: "No Verification",
    basic: "Basic Verified",
    intermediate: "Identity Verified",
    full: "Fully Verified",
  };
  return labels[level];
}

export function getVerificationStatusLabel(status: VerificationStatus): string {
  const labels: Record<VerificationStatus, string> = {
    "not-started": "Not Started",
    pending: "Pending",
    "in-review": "In Review",
    approved: "Approved",
    rejected: "Rejected",
    expired: "Expired",
  };
  return labels[status];
}

export function canAccessFeature(
  feature: string,
  verification: UserVerification | null,
  userRegion: string
): FeatureAccess {
  const requirement = FEATURE_REQUIREMENTS[feature];
  const regionRequirement = REGION_AGE_REQUIREMENTS[userRegion];

  if (!requirement) {
    return { feature, accessible: true };
  }

  // Check KYC level
  const kycLevelOrder: KYCLevel[] = ["none", "basic", "intermediate", "full"];
  const requiredLevelIndex = kycLevelOrder.indexOf(requirement.kycLevel);
  const userLevelIndex = verification
    ? kycLevelOrder.indexOf(verification.kycLevel)
    : 0;

  if (userLevelIndex < requiredLevelIndex) {
    return {
      feature,
      accessible: false,
      requiresVerification: { kycLevel: requirement.kycLevel },
      blockedReason: `This feature requires ${getKYCLevelLabel(
        requirement.kycLevel
      )} status`,
    };
  }

  // Check age requirement
  if (requirement.minAge && verification?.dateOfBirth) {
    const age = calculateAge(verification.dateOfBirth);
    if (age < requirement.minAge) {
      return {
        feature,
        accessible: false,
        blockedReason: `You must be at least ${requirement.minAge} years old to access this feature`,
      };
    }
  }

  // Check region restrictions
  if (regionRequirement?.restrictedFeatures?.includes(feature)) {
    const age = verification?.dateOfBirth
      ? calculateAge(verification.dateOfBirth)
      : 0;
    if (age < (regionRequirement.requiresParentalConsent?.underAge ?? 18)) {
      return {
        feature,
        accessible: false,
        blockedReason: `This feature is restricted in your region for users under ${
          regionRequirement.requiresParentalConsent?.underAge ?? 18
        }`,
      };
    }
  }

  return { feature, accessible: true };
}
