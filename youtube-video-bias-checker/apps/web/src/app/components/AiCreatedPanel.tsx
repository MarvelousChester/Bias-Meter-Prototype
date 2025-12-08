"use client";
import React, { useState } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import BiasMeter from './BiasMeter';
import { politicalAnalysisProp } from '../../types/response_schema';

interface BiasPanelProps {
    analysis: politicalAnalysisProp;
    isLoading?: boolean;
    onReanalyze: () => void;
}

const BiasPanel: React.FC<BiasPanelProps> = ({ analysis, isLoading, onReanalyze }) => {
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
                            <p className="text-text-secondary text-sm font-normal leading-relaxed">
                                {analysis.summary_and_analysis}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border-muted">
                <button
                    onClick={onReanalyze}
                    disabled={isLoading}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-text-primary text-white text-sm font-semibold shadow-sm hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Analyzing...' : 'Re-analyze'}
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