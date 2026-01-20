"use client";

import { useState } from "react";
import { analyzeTranscript } from "../utils/analyzeTranscript";
import AnalysisActions from "./AnalysisActions";
import BiasResultPanel from "./BiasResultPanel";
import { getTranscript } from "../utils/transcript";
import { extractVideoMetadata } from "../utils/videoMetadata";
import { useAuth } from "../lib/useAuth";
import type { AnalysisResponse } from "@bias-mate/shared";

export default function BiasDetector() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState<AnalysisResponse | null>(null);

  const handleSubmit = async () => {
    // Check authentication before proceeding
    if (!isAuthenticated) {
      alert("Please log in via the extension popup (click the Bias Mate icon) to analyze videos.");
      return;
    }

    setIsLoading(true);
    try {
      const videoMetadata = extractVideoMetadata();
      if (!videoMetadata) {
        alert("Please navigate to a valid YouTube video.");
        setIsLoading(false);
        return;
      }

      const transcript = await getTranscript(videoMetadata.videoId);
      if (!transcript) {
        alert("No transcript available for this video.");
        setIsLoading(false);
        return;
      }

      // Convert transcript items to plain text for analysis
      const transcriptText = transcript.map(item => item.text).join(" ");
      console.log("Transcript fetched, analyzing...");
      
      const result = await analyzeTranscript(transcriptText);
      console.log("Analysis Result:", result);

      setAnalysisResponse(result);
      
      // Handle non-political content
      if (!result.is_political) {
        alert(`This video doesn't appear to contain political content.\n\nReason: ${result.detection.reasoning}`);
        setIsLoading(false);
        return;
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error during analysis:", error);
      alert("An error occurred during analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show auth status in header
  const authStatusText = authLoading 
    ? "Checking login..." 
    : isAuthenticated 
      ? `Logged in as ${user?.email}` 
      : "Not logged in - click extension icon to sign in";

  if (isSubmitted && analysisResponse?.is_political && analysisResponse.analysis) {
    return (
      <BiasResultPanel
        analysis={analysisResponse.analysis}
        isLoading={isLoading}
        onReanalyze={handleSubmit}
      />
    );
  }

  return (
    <div className="w-full bg-bg-light p-5 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-2xl border border-border-muted flex flex-col h-auto animate-in slide-in-from-bottom duration-500">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-5">
        <h3 className="text-text-primary text-xl font-bold leading-tight">
          BiasMate
        </h3>
        <p className="text-text-secondary text-sm font-normal">
          Check this video's political leanings and framing
        </p>
        <p className="text-text-muted text-xs font-normal mt-1">
          {authStatusText}
        </p>
      </div>
      {/* Actions */}
      <AnalysisActions
        isLoading={isLoading || authLoading}
        onAnalyze={handleSubmit}
        loadingText={authLoading ? "Checking auth..." : "Analyzing..."}
        buttonText={isAuthenticated ? "Analyze" : "Sign in to Analyze"}
      />
    </div>
  );
}