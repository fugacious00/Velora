import React, { useState } from "react";
import { Droplets, Droplet, Plus, Minus, Check, Sparkles, Trophy } from "lucide-react";
import { LifeStage } from "../types";

interface WaterIntakeQuickLogProps {
  currentGlasses: number;
  onUpdateGlasses: (count: number) => void;
  activeLifeStage: LifeStage;
}

const TARGET_GLASSES = 8;
const ML_PER_GLASS = 250;

export const WaterIntakeQuickLog: React.FC<WaterIntakeQuickLogProps> = ({
  currentGlasses = 0,
  onUpdateGlasses,
  activeLifeStage,
}) => {
  const [justLogged, setJustLogged] = useState(false);

  const safeCount = Math.max(0, currentGlasses || 0);
  const target = activeLifeStage === "pregnant" || activeLifeStage === "postpartum" ? 10 : TARGET_GLASSES;
  const percentage = Math.min(100, Math.round((safeCount / target) * 100));
  const totalMl = safeCount * ML_PER_GLASS;
  const targetMl = target * ML_PER_GLASS;
  const isGoalReached = safeCount >= target;

  // Circular progress ring calculations
  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - (percentage / 100) * ringCircumference;

  const handleAddOne = () => {
    onUpdateGlasses(safeCount + 1);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1400);
  };

  const handleSubtractOne = () => {
    if (safeCount > 0) {
      onUpdateGlasses(safeCount - 1);
    }
  };

  // Life-stage specific hydration insights
  const getHydrationTip = () => {
    switch (activeLifeStage) {
      case "pregnant":
        return "Increased hydration supports expanded blood volume, amniotic fluid, and fetal circulation.";
      case "postpartum":
        return "Staying well-hydrated is essential for tissue healing, energy renewal, and milk production.";
      case "perimenopause":
      case "menopause":
        return "Consistent hydration helps temper thermal flushes, supports joint elasticity, and combats dry skin.";
      case "ttc":
        return "Electrolyte-balanced hydration supports healthy cervical mucus quality and cellular energy.";
      default:
        return "Optimal hydration reduces luteal bloating, prevents tension headaches, and stabilizes energy.";
    }
  };

  return (
    <div
      id="water-intake-quick-log-card"
      className="bg-white rounded-2xl p-5 border border-[#FFDADA] shadow-xs space-y-4 transition-all relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#FFDADA] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#EBF5FF] text-[#0284C7] border border-[#BAE6FD]">
            <Droplets className="w-5 h-5 text-[#0284C7]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#2D2226]">
                Hydration Tracker
              </h3>
              {isGoalReached && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] animate-bounce">
                  <Trophy className="w-3 h-3 text-[#059669]" />
                  Goal Met!
                </span>
              )}
            </div>
            <p className="text-xs text-[#8E7A81]">
              Daily target: {target} glasses ({targetMl.toLocaleString()} ml)
            </p>
          </div>
        </div>

        {/* Quick Stepper */}
        <div className="flex items-center gap-1.5 bg-[#F0F9FF] p-1 rounded-xl border border-[#BAE6FD]">
          <button
            onClick={handleSubtractOne}
            disabled={safeCount === 0}
            title="Remove 1 glass"
            className="w-7 h-7 rounded-lg bg-white text-[#735E65] hover:text-[#2D2226] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed border border-[#E0F2FE] shadow-2xs transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-bold text-[#0369A1] px-1.5 min-w-[24px] text-center">
            {safeCount}
          </span>
          <button
            onClick={handleAddOne}
            title="Log 1 glass"
            className="w-7 h-7 rounded-lg bg-[#0284C7] text-white hover:bg-[#0369A1] flex items-center justify-center border border-[#0284C7] shadow-2xs transition-all active:scale-90 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Showcase with Animated Circular Ring & Stats */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#F0F9FF] via-[#E6F4FE] to-[#F5FAFF] border border-[#BAE6FD] flex items-center gap-4">
        {/* Animated Progress Ring */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 96 96">
            <defs>
              <linearGradient id="waterRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
              <linearGradient id="waterRingSuccessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            {/* Background Track Circle */}
            <circle
              cx="48"
              cy="48"
              r={ringRadius}
              stroke="#D7EDFC"
              strokeWidth="7"
              fill="transparent"
            />

            {/* Animated Progress Stroke */}
            <circle
              cx="48"
              cy="48"
              r={ringRadius}
              stroke={isGoalReached ? "url(#waterRingSuccessGrad)" : "url(#waterRingGrad)"}
              strokeWidth="7"
              strokeDasharray={ringCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: "stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease",
              }}
            />
          </svg>

          {/* Center Ring Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {isGoalReached ? (
              <div className="flex flex-col items-center animate-in zoom-in-75 duration-300">
                <Check className="w-5 h-5 text-[#059669] stroke-[2.5]" />
                <span className="text-[11px] font-bold text-[#059669] leading-none mt-0.5">
                  100%
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-base font-bold text-[#0369A1] leading-none">
                  {percentage}%
                </span>
                <span className="text-[9px] font-semibold text-[#0284C7]/80 mt-0.5">
                  {safeCount}/{target} gl
                </span>
              </div>
            )}
          </div>

          {/* Active ripple glow when logged */}
          {justLogged && (
            <div className="absolute inset-0 rounded-full border-2 border-[#38BDF8] animate-ping pointer-events-none opacity-60" />
          )}
        </div>

        {/* Stats Grid alongside the Ring */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-white/80 border border-[#BAE6FD]/80 shadow-2xs">
            <span className="text-[10px] text-[#0284C7] font-medium block">Total Intake</span>
            <span className="text-sm font-bold text-[#2D2226]">
              {totalMl.toLocaleString()}{" "}
              <span className="text-[10px] font-normal text-[#8E7A81]">ml</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/80 border border-[#BAE6FD]/80 shadow-2xs">
            <span className="text-[10px] text-[#0284C7] font-medium block">Remaining</span>
            <span className="text-sm font-bold text-[#0369A1]">
              {isGoalReached ? "0 ml" : `${Math.max(0, target - safeCount) * ML_PER_GLASS} ml`}
            </span>
          </div>

          <div className="col-span-2 p-2 rounded-xl bg-white/60 border border-[#BAE6FD]/60 flex items-center justify-between text-[11px]">
            <span className="text-[#0369A1] font-medium flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-[#0284C7]" />
              {isGoalReached ? "Target Completed!" : `${target - safeCount} glasses to target`}
            </span>
            <span className="font-bold text-[#0284C7]">
              {safeCount} / {target}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Glass Icons (Tap directly to fill up to that glass) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-[#8E7A81]">
          <span>Tap any glass to set count:</span>
          <span>1 glass = 250 ml (8.5 oz)</span>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {Array.from({ length: target }).map((_, index) => {
            const glassNumber = index + 1;
            const isFilled = glassNumber <= safeCount;
            return (
              <button
                key={index}
                onClick={() => onUpdateGlasses(glassNumber === safeCount ? glassNumber - 1 : glassNumber)}
                title={`Glass ${glassNumber} (${glassNumber * ML_PER_GLASS} ml)`}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                  isFilled
                    ? "bg-[#E0F2FE] border-[#38BDF8] text-[#0284C7] shadow-2xs scale-100"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] hover:bg-[#F0F9FF] hover:border-[#BAE6FD]"
                }`}
              >
                <Droplet
                  className={`w-4 h-4 transition-transform ${
                    isFilled ? "fill-[#0284C7] text-[#0284C7] scale-110" : "text-[#CBD5E1]"
                  }`}
                />
                <span className="text-[9px] font-bold leading-none">{glassNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Tap-to-Log Action Button */}
      <div className="pt-1">
        <button
          onClick={handleAddOne}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tap to Log 1 Glass of Water (250 ml)</span>
          {justLogged && (
            <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-medium animate-in fade-in">
              +250 ml Logged!
            </span>
          )}
        </button>
      </div>

      {/* Life-Stage Biological Note */}
      <div className="p-3 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-start gap-2.5 text-[11px] text-[#0369A1]">
        <Sparkles className="w-3.5 h-3.5 text-[#0284C7] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-[#0369A1]">Physiological Hydration Note:</span>
          <p className="text-[#0c4a6e] leading-relaxed">
            {getHydrationTip()}
          </p>
        </div>
      </div>
    </div>
  );
};
