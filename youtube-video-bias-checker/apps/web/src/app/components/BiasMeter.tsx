import React from 'react';

interface BiasMeterProps {
  score: number; // 0 to 100
}

const BiasMeter: React.FC<BiasMeterProps> = ({ score }) => {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex gap-6 justify-between items-center">
        <p className="text-text-primary text-base font-medium leading-normal">Bias Meter</p>
      </div>

      <div className="relative pt-2 pb-1">
        {/* The Bar */}
        <div className="relative w-full h-2 rounded-full overflow-hidden flex">
          <div className="w-1/5 h-full bg-bias-left transition-opacity hover:opacity-90" />
          <div className="w-1/5 h-full bg-bias-left-leaning transition-opacity hover:opacity-90" />
          <div className="w-1/5 h-full bg-bias-center transition-opacity hover:opacity-90" />
          <div className="w-1/5 h-full bg-bias-right-leaning transition-opacity hover:opacity-90" />
          <div className="w-1/5 h-full bg-bias-right transition-opacity hover:opacity-90" />
        </div>

        {/* The Diamond Marker */}
        <div
          className="absolute top-0.5 h-4 w-4 transition-all duration-500 ease-out"
          style={{
            left: `calc(${clampedScore}% - 8px)` // -8px is half the width of the marker
          }}
        >
          <div className="h-full w-full rotate-45 transform bg-text-primary shadow-sm border border-white/20"></div>
        </div>

        {/* Labels */}
        <div className="mt-2 flex w-full justify-between px-1 text-xs text-text-secondary font-medium">
          <span className="w-1/5 text-left">Left</span>
          <span className="w-1/5 text-center">Center</span>
          <span className="w-1/5 text-right">Right</span>
        </div>
      </div>
    </div>
  );
};

export default BiasMeter;