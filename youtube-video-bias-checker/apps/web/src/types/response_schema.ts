import { Type } from "@google/genai";

export interface politicalAnalysisProp {
  political_leaning:
    | "Extreme Left"
    | "Left"
    | "Center"
    | "Right"
    | "Extreme Right";
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
      enum: ["Extreme Left", "Left", "Center", "Right", "Extreme Right"],
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
