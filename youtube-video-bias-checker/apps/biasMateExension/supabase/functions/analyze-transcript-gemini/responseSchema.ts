import { Type } from "npm:@google/genai";
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

export const politicalAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    political_leaning: {
      type: Type.STRING,
      description:
        "The definitive political classification, selected from one of five specific options.",
      enum: ["left", "left-leaning", "center", "right-leaning", "right"],
    },
    political_philosophies: {
      type: Type.ARRAY,
      description:
        "A list of the primary political philosophies or ideologies (e.g., Conservatism, Progressivism) identified in the text.",
      items: {
        type: Type.STRING,
      },
    },
    summary_and_analysis: {
      type: Type.STRING,
      description:
        "A detailed analysis explaining the classifications, supported by specific examples and quoted evidence from the transcript.",
    },
  },
  required: [
    "political_leaning",
    "political_philosophies",
    "summary_and_analysis",
  ],
};

export default politicalAnalysisSchema;
