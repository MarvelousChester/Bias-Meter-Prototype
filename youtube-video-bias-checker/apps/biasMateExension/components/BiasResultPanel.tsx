import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import BiasMeter from './BiasMeter';
import type { PoliticalAnalysis } from '@bias-mate/shared';
import AnalysisActions from './AnalysisActions';
import Markdown from 'react-markdown';

interface BiasResultPanelProps {
    analysis: PoliticalAnalysis;
    isLoading?: boolean;
    onReanalyze: () => void;
}

const BiasResultPanel: React.FC<BiasResultPanelProps> = ({ analysis, isLoading, onReanalyze }) => {
    const [isReasoningOpen, setIsReasoningOpen] = useState(false);
    const biasValue = analysis.political_leaning;

    return (
        <div className="w-full bg-bg-light p-5 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl border-t border-border-muted flex flex-col h-auto animate-in slide-in-from-bottom duration-500">

            {/* Header */}
            <div className="flex flex-col gap-1 mb-5">
                <h3 className="text-text-primary text-xl font-bold leading-tight">
                    BiasMate Analysis
                </h3>
                <p className="text-text-secondary text-base font-normal">
                    Leaning: <span className="font-medium text-text-primary">{analysis.political_leaning}</span>
                </p>
            </div>

            {/* Meter Component */}
            <div className="mb-6">
                <BiasMeter bias={biasValue} />
            </div>

            {/* Signals */}
            <div className="mb-5">
                <h4 className="text-text-primary text-base font-medium leading-normal mb-3">
                    Key Signals Found
                </h4>
                <div className="flex flex-wrap gap-2">
                    {analysis.political_philosophies.map((philosophy) => (
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
                            <div className="text-text-secondary text-sm font-normal leading-relaxed prose prose-sm max-w-none">
                                <Markdown>{analysis.summary_and_analysis}</Markdown>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <AnalysisActions
                isLoading={isLoading || false}
                onAnalyze={onReanalyze}
            />

        </div>
    );
};

export default BiasResultPanel;
