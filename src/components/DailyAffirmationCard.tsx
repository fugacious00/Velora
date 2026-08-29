import React, { useState, useEffect } from "react";
import { LifeStage } from "../types";
import { LIFE_STAGES } from "../data/initialData";
import { STAGE_AFFIRMATIONS, getDailyAffirmation, Affirmation } from "../data/affirmations";
import {
  Sparkles,
  Quote,
  RefreshCw,
  Heart,
  Check,
  Compass,
} from "lucide-react";

interface DailyAffirmationCardProps {
  lifeStage: LifeStage;
  onOpenLifeMap?: () => void;
  className?: string;
}

export const DailyAffirmationCard: React.FC<DailyAffirmationCardProps> = ({
  lifeStage,
  onOpenLifeMap,
  className = "",
}) => {
  const [offset, setOffset] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Reset offset and like status when the life stage changes
  useEffect(() => {
    setOffset(0);
    setIsLiked(false);
  }, [lifeStage]);

  const currentAffirmation: Affirmation = getDailyAffirmation(lifeStage, offset);
  const stageConfig = LIFE_STAGES[lifeStage] || LIFE_STAGES.cycle_hormonal;

  const handleNextAffirmation = () => {
    setIsSpinning(true);
    setOffset((prev) => prev + 1);
    setIsLiked(false);
    setTimeout(() => setIsSpinning(false), 400);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${currentAffirmation.text}" — Velora Daily Affirmation (${stageConfig.name})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF5F7] via-[#FFF9FA] to-[#FFF0F3] border border-[#FFDADA] p-4 sm:p-4.5 transition-all shadow-2xs ${className}`}
    >
      {/* Decorative ambient background accents */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#FF788D]/10 blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-[#FF788D]/8 blur-lg pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Left: Icon & Text content */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-xl bg-white text-[#FF788D] border border-[#FFDADA] shrink-0 shadow-2xs mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            {/* Header context tags */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="font-semibold text-[#D9455D] uppercase tracking-wider text-[10px]">
                Daily Affirmation
              </span>
              <span className="text-[#8E7A81]">·</span>
              <button
                type="button"
                onClick={onOpenLifeMap}
                className="inline-flex items-center gap-1 font-medium text-[#735E65] hover:text-[#D9455D] transition-colors cursor-pointer"
                title="Change Life Stage in Life Map"
              >
                <Compass className="w-3 h-3 text-[#FF788D]" />
                <span>{stageConfig.name}</span>
              </button>
              <span className="text-[#8E7A81]">·</span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#FFDADA] text-[#735E65] font-medium text-[10px]">
                {currentAffirmation.focusTag}
              </span>
            </div>

            {/* The Affirmation Quote */}
            <div className="flex items-start gap-1.5 pt-0.5">
              <Quote className="w-3.5 h-3.5 text-[#FF788D]/60 shrink-0 rotate-180 mt-0.5" />
              <p className="text-xs sm:text-sm font-serif italic text-[#2D2226] font-medium leading-relaxed">
                {currentAffirmation.text}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions (Shuffle, Like, Copy) */}
        <div className="flex items-center justify-end gap-1.5 shrink-0 self-end sm:self-center pt-1 sm:pt-0 border-t sm:border-t-0 border-[#FFDADA]/60 sm:border-transparent w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsLiked(!isLiked)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer text-xs flex items-center gap-1 ${
              isLiked
                ? "bg-rose-50 border-rose-300 text-rose-600 shadow-2xs"
                : "bg-white hover:bg-[#FFF5F7] border-[#FFDADA] text-[#8E7A81] hover:text-[#D9455D]"
            }`}
            title={isLiked ? "Saved to your favorites" : "Favorite this affirmation"}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white hover:bg-[#FFF5F7] border border-[#FFDADA] text-[#8E7A81] hover:text-[#D9455D] transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Copy affirmation"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] text-emerald-700 font-semibold pr-1">Copied</span>
              </>
            ) : (
              <Quote className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleNextAffirmation}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#FFF5F7] active:scale-95 border border-[#FFDADA] text-[#735E65] hover:text-[#D9455D] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Show another encouraging message"
          >
            <RefreshCw className={`w-3 h-3 text-[#FF788D] ${isSpinning ? "animate-spin" : ""}`} />
            <span className="text-[11px]">New</span>
          </button>
        </div>
      </div>
    </div>
  );
};
