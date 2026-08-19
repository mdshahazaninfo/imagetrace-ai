export type MatchType = "full" | "partial" | "page" | "similar";

export type WebMatch = {
  url: string;
  title?: string;
  type: MatchType;
  score?: number;
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
  providerStatus: Record<string, string>;
  warnings: string[];
  createdAt: string;
};
