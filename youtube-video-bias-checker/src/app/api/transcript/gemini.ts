"use server";

import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";

// NOTE: Your API key should be securely managed,
// potentially via environment variables.
// For this example, it's assumed to be set up in the environment.
const ai: GoogleGenAI = new GoogleGenAI({
  apiKey: process.env.GEN_AI_API_KEY,
});

export async function analyzeTranscript(transcript: string) {
  try {
    const model = "gemini-2.5-flash";
    // Get the response

    const prompt: string =
      `Determine the political Bias from the transcript. Act as a neutral investigator and provide unbiased analysis. 
      Analyze the transcript for any signs of political bias, including language use, framing of issues, and representation of different perspectives.
      Provide specific examples from the transcript to support your findings. Conclude with a summary of the overall bias detected and on first line indicate keyword bias such as left, far-left, middle, right, far-right, if any.
      ` + `Transcript: ${transcript}`;

    // You can also type the contents array if it's more complex
    const contents: Content[] = [{ parts: [{ text: prompt }] }];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: contents,
    });

    // Accessing the text response
    // Note: It's good practice to check if the response and text exist
    // TODO, have one return so easier to read
    if (response.candidates && response.candidates.length > 0) {
      const responseText = response.candidates[0].content?.parts?.[0]?.text;
      return responseText || "No text response received.";
    }

    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (responseText) {
      console.log(responseText);
    } else {
      console.log("No text response received.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Call the main function
