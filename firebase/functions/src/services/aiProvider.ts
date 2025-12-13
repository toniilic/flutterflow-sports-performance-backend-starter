export type AnalyzeMediaInput = {
  teamId: string;
  mediaAssetId: string;
  analysisVersion: string;
};

export type AnalyzeMediaResult = {
  summary: string;
  tags: string[];
  // Optional time-based events/annotations
  events?: Array<{
    t: number; // seconds
    label: string;
    confidence?: number;
  }>;
  raw?: unknown;
};

export interface AiProvider {
  name: string;
  analyzeMedia(input: AnalyzeMediaInput): Promise<AnalyzeMediaResult>;
}
