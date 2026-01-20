import { Type } from "npm:@google/genai";
import { politicalAnalysisSchema } from "./responseSchema.ts";

// ============================================================================
// Types
// ============================================================================

interface AnalysisToolConfig {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface PromptConfig {
  systemInstruction: string;
  analysisTool: AnalysisToolConfig;
  modelId?: string;
}

export interface ModelConfig {
  modelId: string;
  config: {
    systemInstruction: string;
    tools: Array<{
      functionDeclarations: Array<{
        name: string;
        description: string;
        parameters: Record<string, unknown>;
      }>;
    }>;
  };
}

// ============================================================================
// Factory Function
// ============================================================================

export function createModelConfig(promptConfig: PromptConfig): ModelConfig {
  const { systemInstruction, analysisTool, modelId = "gemini-3-flash-preview" } = promptConfig;

  return {
    modelId,
    config: {
      systemInstruction,
      tools: [
        {
          functionDeclarations: [
            {
              name: analysisTool.name,
              description: analysisTool.description,
              parameters: analysisTool.parameters,
            },
          ],
        },
      ],
    },
  };
}

// ============================================================================
// Schema: Political Detection
// ============================================================================

const politicalDetectionSchema = {
  type: Type.OBJECT,
  properties: {
    is_political: {
      type: Type.BOOLEAN,
      description:
        "True if the video contains political content, opinions, or discussions about politics, government, policy, elections, or political figures. False otherwise.",
    },
    confidence: {
      type: Type.STRING,
      description: "How confident the analysis is.",
      enum: ["High", "Medium", "Low"],
    },
    reasoning: {
      type: Type.STRING,
      description:
        "Brief explanation of why the content is or is not considered political.",
    },
  },
  required: ["is_political", "confidence", "reasoning"],
};

// ============================================================================
// Prompt Configurations
// ============================================================================

export const politicalDetectionConfig: PromptConfig = {
  systemInstruction:
    "You are a content classifier. Your sole task is to determine whether the provided transcript contains political content. Political content includes discussions of government, policy, elections, political parties, political figures, legislation, or politically charged social issues.",
  analysisTool: {
    name: "record_political_detection",
    description:
      "Records whether the transcript contains political content or not.",
    parameters: politicalDetectionSchema,
  },
};

export const politicalAnalysisConfig: PromptConfig = {
  systemInstruction:
    "You are a neutral, objective political analyst. Your sole task is to analyze the provided transcript for political bias and underlying ideology.",
  analysisTool: {
    name: "record_political_analysis",
    description: "Records the political bias analysis of a given transcript.",
    parameters: politicalAnalysisSchema,
  },
};
