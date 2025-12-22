"use client";

import { useState } from "react";
import { fetchTranscript } from "../YoutubeHelper";
import { extractVideoID } from "../YoutubeHelper";
import Markdown from "react-markdown";
import { analyzeTranscript } from "../api/transcript/gemini";
import AnalysisActions from "./AnalysisActions";
import BiasResultPanel from "./BiasResultPanel";

export default function BiasDetector() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [analysis, setAnalysis] = useState<any>(null); // Using any temporarily to avoid import loops or precise typing if not imported, but preferably import types.

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const videoId = extractVideoID(url);
      if (!videoId) {
        alert("Please enter a valid YouTube URL.");
        return;
      }
      const transcript = await fetchTranscript(videoId);
      console.log("Transcript:", transcript);

      const analysisResult = await analyzeTranscript(transcript);
      console.log("Analysis Result:", analysisResult);

      const text =
        typeof analysisResult === "string"
          ? analysisResult
          : JSON.stringify(analysisResult, null, 2);

      setMarkdown(text || "Failed to get analysis.");

      if (typeof analysisResult !== 'string') {
        setAnalysis(analysisResult);
        setIsSubmitted(true);
      } else {
        console.warn("Analysis returned string, expected object:", analysisResult);
        alert("Analysis did not return structured data. Please try again.");
      }

    } catch (error) {
      console.error("Error during analysis:", error);
      setMarkdown("Error occurred during analysis.");
      alert("An error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-bg-light p-5 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl border-t border-border-muted flex flex-col h-auto animate-in slide-in-from-bottom duration-500">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-5">
        <h3 className="text-text-primary text-xl font-bold leading-tight">
          BiasMate
        </h3>
        {!isSubmitted && (
          <p className="text-text-secondary text-sm font-normal">
            Check this video's political leanings and framing
          </p>
        )}
      </div>
      {/* Actions */}
      <AnalysisActions
        isLoading={isLoading}
        onAnalyze={handleSubmit}
        loadingText="Analyzing..."
        buttonText="Analyze"
      />
    </div>
  )
}
