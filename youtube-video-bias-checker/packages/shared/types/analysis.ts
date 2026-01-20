/**
 * Political analysis types for bias detection
 */

export type PoliticalLeaning =
  | 'Left'
  | 'Left-leaning'
  | 'Center'
  | 'Right-leaning'
  | 'Right';

export interface PoliticalAnalysis {
  political_leaning: PoliticalLeaning;
  political_philosophies: string[];
  summary_and_analysis: string;
}

/**
 * Political detection result from the guard rail step
 */
export type DetectionConfidence = 'High' | 'Medium' | 'Low';

export interface PoliticalDetection {
  is_political: boolean;
  confidence: DetectionConfidence;
  reasoning: string;
}

/**
 * Full analysis response from the edge function
 */
export interface AnalysisResponse {
  is_political: boolean;
  detection: PoliticalDetection;
  analysis: PoliticalAnalysis | null;
}
