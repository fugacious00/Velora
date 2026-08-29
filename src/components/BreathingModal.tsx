import React, { useState, useEffect } from "react";
import { Wind, X, Play, Pause, RotateCcw, Heart, Sparkles } from "lucide-react";

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Technique = "478" | "box";
type Phase = "Inhale" | "Hold" | "Exhale" | "Pause";

export const BreathingModal: React.FC<BreathingModalProps> = ({ isOpen, onClose }) => {
  const [technique, setTechnique] = useState<Technique>("478");
  const [isActive, setIsActive] = useState(true);
  const [phase, setPhase] = useState<Phase>("Inhale");
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  useEffect(() => {
    if (!isOpen || !isActive) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Transition to next phase
        if (technique === "478") {
          if (phase === "Inhale") {
            setPhase("Hold");
            return 7;
          } else if (phase === "Hold") {
            setPhase("Exhale");
            return 8;
          } else {
            setPhase("Inhale");
            setRoundsCompleted((r) => r + 1);
            return 4;
          }
        } else {
          // Box Breathing (4-4-4-4)
          if (phase === "Inhale") {
            setPhase("Hold");
            return 4;
          } else if (phase === "Hold") {
            setPhase("Exhale");
            return 4;
          } else if (phase === "Exhale") {
            setPhase("Pause");
            return 4;
          } else {
            setPhase("Inhale");
            setRoundsCompleted((r) => r + 1);
            return 4;
          }
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isActive, phase, technique]);

  if (!isOpen) return null;

  const getPhaseInstruction = () => {
    switch (phase) {
      case "Inhale":
        return "Breathe in deeply and quietly through your nose, expanding your lower belly...";
      case "Hold":
        return "Gently hold the breath with soft shoulders and relaxed jaw...";
      case "Exhale":
        return "Audibly whoosh the breath out slowly through gently parted lips...";
      case "Pause":
        return "Rest in still emptiness before the next gentle breath...";
    }
  };

  const getScaleClass = () => {
    if (phase === "Inhale") return "scale-125 duration-[4000ms]";
    if (phase === "Hold") return "scale-125 duration-300";
    if (phase === "Exhale") return "scale-75 duration-[8000ms]";
    return "scale-75 duration-300";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#261E21] text-[#FFF5F7] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#43353A] space-y-6 flex flex-col items-center text-center relative overflow-hidden animate-in fade-in zoom-in-95">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#FF788D]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[#FF788D]/15 blur-3xl pointer-events-none" />

        {/* Top Bar */}
        <div className="w-full flex items-center justify-between border-b border-[#43353A] pb-4">
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-[#FF788D]" />
            <span className="text-sm font-semibold tracking-wide text-[#FFF5F7]">
              Nervous System Regulation
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#BBA5AC] hover:text-white rounded-lg hover:bg-[#43353A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Technique Switcher */}
        <div className="flex gap-2 p-1 bg-[#1E171A] rounded-xl border border-[#43353A]">
          <button
            onClick={() => {
              setTechnique("478");
              setPhase("Inhale");
              setSecondsLeft(4);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              technique === "478"
                ? "bg-[#FF788D] text-white shadow-xs"
                : "text-[#BBA5AC] hover:text-[#FFF5F7]"
            }`}
          >
            4-7-8 Deep Vagal Tone
          </button>
          <button
            onClick={() => {
              setTechnique("box");
              setPhase("Inhale");
              setSecondsLeft(4);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              technique === "box"
                ? "bg-[#FF788D] text-white shadow-xs"
                : "text-[#BBA5AC] hover:text-[#FFF5F7]"
            }`}
          >
            Box Breathing (4-4-4-4)
          </button>
        </div>

        {/* Dynamic Pulsing Circle Visual */}
        <div className="relative w-56 h-56 flex items-center justify-center my-4">
          {/* Animated expansion ring */}
          <div
            className={`absolute inset-0 rounded-full bg-[#FF788D]/25 border border-[#FFDADA]/40 transition-all ease-in-out ${getScaleClass()}`}
          />
          <div className="relative z-10 space-y-1 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FFDADA]">
              {phase}
            </span>
            <div className="text-4xl font-serif font-bold text-white tracking-tighter">
              {secondsLeft}s
            </div>
            <span className="text-[11px] text-[#BBA5AC] block">
              Round {roundsCompleted + 1}
            </span>
          </div>
        </div>

        {/* Instruction Message */}
        <div className="space-y-2 max-w-sm">
          <p className="text-sm font-medium text-[#FFF5F7] leading-relaxed min-h-[44px]">
            {getPhaseInstruction()}
          </p>
          <p className="text-[11px] text-[#BBA5AC] flex items-center justify-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#FF788D]" />
            <span>Down-regulates sympathetic cortisol and activates parasympathetic rest</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className="px-5 py-2.5 bg-[#FF788D] hover:bg-[#E85C71] active:scale-98 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? "Pause" : "Resume"}</span>
          </button>
          <button
            onClick={() => {
              setPhase("Inhale");
              setSecondsLeft(technique === "478" ? 4 : 4);
              setRoundsCompleted(0);
            }}
            className="p-2.5 bg-[#43353A] hover:bg-[#57444B] text-[#FFF5F7] rounded-xl transition-colors cursor-pointer"
            title="Reset Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
