export type MatchType = "full" | "partial" | "page" | "similar";

export type TrustedGovernmentSource = {
  category: string;
  nameBn: string;
  nameEn: string;
  url: string;
  domain: string;
  source: string;
  checked: string;
  [key: string]: unknown;
};

export type GovernmentTrust = {
  level: "trusted_registry" | "gov_bd_unlisted";
  label: string;
  domain: string;
  registryChecked: string;
  source?: TrustedGovernmentSource;
};

export type WebMatch = {
  url: string;
  title?: string;
  type: MatchType;
  score?: number;
  governmentTrust?: GovernmentTrust;
};

export type VisionResult = {
  text: string;
  labels: Array<{ description: string; score?: number }>;
  logos: Array<{ description: string; score?: number }>;
  landmarks: Array<{ description: string; score?: number }>;
  webEntities: Array<{ description: string; score?: number }>;
  matches: WebMatch[];
};

export type SafeExif = {
  make?: string;
  model?: string;
  software?: string;
  capturedAt?: string;
  artist?: string;
  copyright?: string;
  orientation?: string | number;
  preciseGpsProcessed: false;
};

export type PresenceCategory =
  | "government"
  | "facebook"
  | "instagram"
  | "wikipedia"
  | "official_website"
  | "company_or_org"
  | "news"
  | "other";

export type PresenceMatch = {
  category: PresenceCategory;
  title: string;
  url: string;
  snippet?: string;
  provider: string;
  confidence: number;
  confidenceLabel: string;
  governmentTrust?: GovernmentTrust;
};

export type GovernmentVerificationSummary = {
  registryVersion: string;
  sourceCount: number;
  uniqueDomains: number;
  trustedWebMatches: number;
  unlistedGovBdMatches: number;
  coverageNote: string;
};

export type AnalysisReport = {
  id?: string;
  image: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    sha256: string;
  };
  confirmedPublicName?: string;
  metadata: SafeExif;
  vision: VisionResult | null;
  presence: PresenceMatch[];
  governmentVerification: GovernmentVerificationSummary;
  providerStatus: Record<string, string>;
  warnings: string[];
  createdAt: string;
};
