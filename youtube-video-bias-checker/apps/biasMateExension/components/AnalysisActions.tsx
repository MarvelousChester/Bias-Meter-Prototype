import React from 'react';
import { RefreshCw } from 'lucide-react';

interface AnalysisActionsProps {
    isLoading: boolean;
    onAnalyze: () => void;
    loadingText?: string;
    buttonText?: string;
}

const AnalysisActions: React.FC<AnalysisActionsProps> = ({
    isLoading,
    onAnalyze,
    loadingText = 'Analyzing...',
    buttonText = 'Analyze'
}) => {
    return (
        <div className="flex flex-col gap-3 pt-4 border-t border-border-muted">
            <button
                onClick={onAnalyze}
                disabled={isLoading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-text-primary text-white text-sm font-semibold shadow-sm hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
            >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? loadingText : buttonText}
            </button>
            <button
                type="button"
                className="text-center text-text-secondary text-sm font-normal underline hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
                onClick={() => window.open('https://biasmate.io/learn', '_blank')}
            >
                Learn what this means
            </button>
        </div>
    );
};

export default AnalysisActions;
