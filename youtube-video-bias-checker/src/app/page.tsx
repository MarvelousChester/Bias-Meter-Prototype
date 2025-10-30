"use client";

import { useState } from "react";
import { fetchTranscript } from "./YoutubeHelper";
import { extractVideoID } from "./YoutubeHelper";
import { analyzeTranscript } from "./api/transcript/gemini";
import Markdown from "react-markdown";

export default function Home() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [url, setUrl] = useState("");
  const [markdown, setMarkdown] = useState("");
  const handleSubmit = () => {
    const videoId = extractVideoID(url);
    if (!videoId) {
      alert("Please enter a valid YouTube URL.");
      return;
    } else {
      console.log("Extracted Video ID:", videoId);
      fetchTranscript(videoId)
        .then(async (transcript) => {
          console.log("Transcript:", transcript);
          const analysisResult = await analyzeTranscript(transcript);
          console.log("Analysis Result:", analysisResult);
          setMarkdown(analysisResult || "Failed to get analysis.");
          // Take the analysisResult and update the UI accordingly
          // For Source Information, insert the analysis result
          // For Left Block, insert placeholder text for now, this will be the bias analysis result
          // i.e. Left Leaning or Right Leaning
        })
        .catch((error) => {
          console.error("Error fetching transcript:", error);
        });
    }

    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header>
        <div className="navbar bg-base-100">
          <div className="navbar-start">
            <h1 className="text-xl font-bold">Bias Detector</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="card w-full max-w-4xl bg-base-200 rounded-box p-8 md:p-12">
          {!isSubmitted ? (
            /* Initial State - URL Input */
            <div className="flex flex-col items-center gap-4">
              <input
                type="text"
                placeholder="Enter URL to analyze..."
                className="input input-bordered rounded-full w-3/5"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button className="btn btn-primary mt-4" onClick={handleSubmit}>
                Find Bias
              </button>
            </div>
          ) : (
            /* Results State - Two Blocks Side by Side */
            <div className="flex flex-row gap-4">
              {/* Block 1 */}
              <div className="flex-1 rounded-box border bg-base-100 p-6">
                <h2 className="text-lg font-semibold mb-2">
                  Block 1: Analysis Results
                </h2>
                <p className="text-sm opacity-70">
                  Analysis results will appear here...
                </p>
              </div>

              {/* Divider */}
              <div className="divider divider-horizontal"></div>

              {/* Block 2 */}
              <div className="flex-1 rounded-box border bg-base-100 p-6">
                <h2 className="text-lg font-semibold mb-2">
                  Block 2: Source Information
                </h2>
                <div className="text-sm opacity-70 prose max-w-full">
                  {markdown ? (
                    // react-markdown component will render the markdown safely
                    <Markdown>{markdown}</Markdown>
                  ) : (
                    <p>Source information will appear here...</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-4 bg-base-100">
        <div>
          <p>Prototype</p>
        </div>
      </footer>
    </div>
  );
}
