import { Type } from "npm:@google/genai";

// Note: PoliticalAnalysis interface is defined in @bias-mate/shared
// For Deno edge functions, we only need the schema object for Gemini API

export const politicalAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    political_leaning: {
      type: Type.STRING,
      description:
        "The definitive political classification, selected from one of five specific options.",
      enum: ["Left", "Left-leaning", "Center", "Right-leaning", "Right"],
    },
    political_philosophies: {
      type: Type.ARRAY,
      description:
        "A list of the primary political philosophies or ideologies (e.g., Conservatism, Progressivism) identified in the text.",
      items: {
        type: Type.OBJECT,
        properties: {
          term: {
            type: Type.STRING,
            description: "The root political philosophy or ideology (e.g., 'Neoliberalism')."
          },
          modifier: {
            type: Type.STRING,
            enum: ['pro', 'anti', 'neo', 'post', 'proto'],
            description: "Optional modifier for the philosophy. Leave empty if none."
          }
        },
        required: ["term"]
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
