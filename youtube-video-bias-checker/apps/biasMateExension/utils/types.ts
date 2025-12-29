export interface politicalAnalysisProp {
  political_leaning:
  | "left"
  | "left-leaning"
  | "center"
  | "right-leaning"
  | "right";
  political_philosophies: string[];
  summary_and_analysis: string;
}
