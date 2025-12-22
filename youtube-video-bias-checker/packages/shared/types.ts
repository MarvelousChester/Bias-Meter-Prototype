export type PoliticalLeaning =
  | 'left'
  | 'left-leaning'
  | 'center'
  | 'right-leaning'
  | 'right';

export interface PoliticalAnalysis {
  political_leaning: PoliticalLeaning;
  political_philosophies: string[];
  summary_and_analysis: string;
}

export interface EbscoDefinition {
  Term: string;
  Definition: string;
  Link: string;
}
