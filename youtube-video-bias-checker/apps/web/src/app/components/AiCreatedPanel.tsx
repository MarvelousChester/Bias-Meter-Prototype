"use client";
import React, { useState } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import BiasMeter from './BiasMeter';

interface BiasPanelProps {
    analysis: object;
    isLoading?: boolean;
    onReanalyze: () => void;
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


const BiasPanel = () => {
    const [isReasoningOpen, setIsReasoningOpen] = useState(false);

    return (
        <div className="w-full bg-bg-light p-5 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl border-t border-border-muted flex flex-col h-auto animate-in slide-in-from-bottom duration-500">

            {/* Header */}
            <div className="flex flex-col gap-1 mb-5">
                <h3 className="text-text-primary text-xl font-bold leading-tight">
                    BiasMate Analysis
                </h3>
                <p className="text-text-secondary text-base font-normal">
                    Leaning: <span className="font-medium text-text-primary">{sampleObject.political_leaning}</span>
                </p>
            </div>

            {/* Meter Component */}
            <div className="mb-6">
                <BiasMeter bias="left-leaning" />
            </div>

            {/* Signals */}
            <div className="mb-5">
                <h4 className="text-text-primary text-base font-medium leading-normal mb-3">
                    Key Signals Found
                </h4>
                <div className="flex flex-wrap gap-2">
                    {sampleObject.political_philosophies.map((philosophy) => (
                        <div
                            key={philosophy}
                            className="flex items-center justify-center px-4 py-1.5 rounded-full bg-gray-200/80 border border-transparent hover:border-border-muted transition-colors"
                        >
                            <p className="text-text-primary text-sm font-medium leading-normal">
                                {philosophy}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reasoning Accordion */}
            <div className="flex flex-col gap-3 mb-6">
                <div
                    className="flex flex-col rounded-lg border border-border-muted bg-white px-4 py-2 cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => setIsReasoningOpen(!isReasoningOpen)}
                >
                    <div className="flex items-center justify-between py-2 select-none">
                        <p className="text-text-primary text-sm font-medium leading-normal">
                            Show reasoning
                        </p>
                        <ChevronDown
                            className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isReasoningOpen ? 'rotate-180' : ''}`}
                        />
                    </div>

                    <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${isReasoningOpen ? 'grid-rows-[1fr] opacity-100 pb-2' : 'grid-rows-[0fr] opacity-0'}`}
                    >
                        <div className="overflow-hidden">
                            <p className="text-text-secondary text-sm font-normal leading-relaxed">
                                {sampleObject.summary_and_analysis}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border-muted">
                <button

                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-text-primary text-white text-sm font-semibold shadow-sm hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
                >
                    <RefreshCw className={`w-4 h-4 animate-spin`} />
                    {'Analyzing...'}
                </button>
                <a
                    href="#"
                    className="text-center text-text-secondary text-sm font-normal underline hover:text-text-primary transition-colors"
                >
                    Learn what this means
                </a>
            </div>

        </div>
    );
};

export default BiasPanel;