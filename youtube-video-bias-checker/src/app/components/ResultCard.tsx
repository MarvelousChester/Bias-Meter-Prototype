"use client";

import React from "react";
import Markdown from "react-markdown";
import { politicalAnalysisProp } from "../api/transcript/response_schema";

export function ResultCard() {
  return (
    <div className="card w-96 bg-base-100 card-md shadow-sm">
      <div className="card-body">
        <h2 className="card-title">Bias Detection</h2>
        <div className="collapse collapse-arrow collapse-arrow-right">
          <input type="checkbox" />
          <div className="collapse-title font-semibold">
            Summary and Analysis
          </div>
          <div className="collapse-content text-sm">
            <Markdown>{sampleObject.summary_and_analysis}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}

const sampleObject = {
  political_leaning: "Left",
  political_philosophies: [
    "Anti-Neoliberalism",
    "Progressivism",
    "Collectivism",
  ],
  summary_and_analysis:
    'The transcript presents a clear left-leaning political analysis, primarily focused on a critique of neoliberalism and its philosophical underpinnings. The central argument is that the rise of economic-style thinking, particularly game theory and rational choice theory, has had a detrimental effect on society by promoting a hyper-individualistic and selfish worldview.\n\nThe analysis identifies the following key points:\n1.  **Critique of Market-Based Metaphors:** The video begins by deconstructing the "marketplace of ideas," calling it a "myth" and stating that "the idea that truth always comes out on top is laughable." It further suggests the phrase is used "almost exclusively to say bigoted stuff." This sets the stage for a broader critique of applying market logic to social and political spheres.\n\n2.  **Rejection of Neoliberal Rationality:** The core of the argument is a rejection of the model of human behavior popularized by game theory, exemplified by the Prisoner\'s Dilemma. The speaker argues that this model presents a "normative claim" that equates rationality with maximizing "expected individual gain" and "complete violent selfishness." This is directly contrasted with real-world human behavior, which the speaker praises as often being "collaboratively, selflessly, with different goals in mind," describing this as "capital G good."\n\n3.  **Identification of Neoliberalism as the Target:** The speaker explicitly names the ideology being criticized, stating, "This is how we were left with neoliberalism." The transcript blames this ideology for specific policy outcomes, such as "gutting public housing, education, child care, and healthcare so that middlemen could get richer" and opposing wealth redistribution for the sake of "our great selfish billionaires."\n\n4.  **Advocacy for the "Common Good":** The analysis consistently frames the individualistic, market-based approach as being in opposition to the "common good." It argues that this way of thinking "makes the very idea of the common good seem like an irrational choice" and critiques its architects for arguing "that there\'s no such thing as the common good in the first place."\n\nThe transcript\'s consistent critique of market-based individualism, its explicit condemnation of neoliberal policies, and its championing of collectivist values like community, selflessness, and the "common good" firmly place its ideology on the left of the political spectrum.',
};
