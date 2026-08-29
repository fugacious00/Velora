import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Droplets,
  Moon,
  Zap,
  Smile,
  Activity,
  Check,
  ChevronDown,
  X,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import { DailyHealthLog, LifeStage, MoodType } from "../types";

interface TopQuickAddSectionProps {
  todayLog: DailyHealthLog;
  onSaveDailyLog: (updatedLog: Partial<DailyHealthLog>) => void;
  activeLifeStage: LifeStage;
  onOpenTrack: () => void;
  className?: string;
}

export const TopQuickAddSection: React.FC<TopQuickAddSectionProps> = ({
  todayLog,
  onSaveDailyLog,
  activeLifeStage,
  onOpenTrack,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "water" | "sleep" | "mood" | "symptoms">("all");
  const [justSavedToast, setJustSavedToast] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const triggerToast = (msg: string) => {
    setJustSavedToast(msg);
    setTimeout(() => {
      setJustSavedToast((current) => (current === msg ? null : current));
    }, 2200);
  };

  // Quick Action Handlers
  const handleAddWater = (increment: number = 1) => {
    const current = todayLog.hydrationGlasses || 0;
    const next = Math.max(0, current + increment);
    onSaveDailyLog({ hydrationGlasses: next });
    triggerToast(`Hydration: ${next} glasses logged (${next * 250} ml)`);
  };

  const handleSetEnergy = (level: number) => {
    onSaveDailyLog({ energyLevel: level });
    triggerToast(`Energy level updated to ${level}/5`);
  };

  const handleSetMood = (mood: MoodType) => {
    onSaveDailyLog({ mood });
    triggerToast(`Mood recorded as ${mood.charAt(0).toUpperCase() + mood.slice(1)}`);
  };

  const handleSetSleep = (hours: number) => {
    onSaveDailyLog({ sleepHours: hours });
    triggerToast(`Sleep updated to ${hours} hours`);
  };

  const handleToggleSymptom = (key: "acne" | "bloating" | "breastTenderness") => {
    const next = !todayLog[key];
    onSaveDailyLog({ [key]: next });
    const label =
      key === "acne" ? "Skin/Acne" : key === "bloating" ? "Bloating" : "Breast Tenderness";
    triggerToast(`${label} ${next ? "marked active" : "cleared"}`);
  };

  const handleSetCramps = (severity: number) => {
    onSaveDailyLog({ crampsSeverity: severity });
    triggerToast(`Cramps severity set to ${severity}/5`);
  };

  const handleSetHeadache = (severity: number) => {
    onSaveDailyLog({ headacheSeverity: severity });
    triggerToast(`Headache severity set to ${severity}/5`);
  };

  const handleAddExercise = (mins: number) => {
    const current = todayLog.exerciseMinutes || 0;
    const next = current + mins;
    onSaveDailyLog({ exerciseMinutes: next });
    triggerToast(`Added ${mins} min activity (${next} min total)`);
  };

  const currentWater = todayLog.hydrationGlasses || 0;
  const currentSleep = todayLog.sleepHours || 7.5;
  const currentEnergy = todayLog.energyLevel || 3;
  const currentMood = todayLog.mood || "calm";

  const moods: { id: MoodType; label: string; emoji: string }[] = [
    { id: "calm", label: "Calm", emoji: "🌿" },
    { id: "joyful", label: "Joyful", emoji: "✨" },
    { id: "focused", label: "Focused", emoji: "🎯" },
    { id: "sensitive", label: "Sensitive", emoji: "🌸" },
    { id: "anxious", label: "Anxious", emoji: "🌧️" },
    { id: "exhausted", label: "Exhausted", emoji: "🌙" },
    { id: "irritable", label: "Irritable", emoji: "⚡" },
  ];

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Top Main Quick-Add Header Pill / Bar */}
      <div className="flex items-center gap-2">
        {/* Fast 1-Click Hydration Quick-Add Pill */}
        <button
          type="button"
          onClick={() => handleAddWater(1)}
          title="1-Tap Quick Add: +1 Glass of Water (250ml)"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#FFF5F7] active:scale-95 text-[#D9455D] border border-[#FFDADA] hover:border-[#FF788D] rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <Droplets className="w-3.5 h-3.5 text-[#FF788D]" />
          <span>+1 Water</span>
          <span className="bg-[#FFF5F7] text-[#D9455D] text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-[#FFDADA]">
            {currentWater} gl
          </span>
        </button>

        {/* Primary "+ Quick Add" Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
            isOpen
              ? "bg-[#2D2226] text-white border border-[#2D2226]"
              : "bg-[#FF788D] hover:bg-[#E85C71] text-white"
          }`}
          aria-expanded={isOpen}
          aria-label="Open Quick Add Panel"
        >
          <Plus className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`} />
          <span>Quick Add</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-white/80" : "text-white/80"
            }`}
          />
        </button>
      </div>

      {/* Floating Instant Feedback Toast */}
      {justSavedToast && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-[#2D2226] text-white px-3.5 py-2 rounded-xl text-xs font-medium shadow-lg border border-[#FF788D]/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150 whitespace-nowrap pointer-events-none">
          <Check className="w-3.5 h-3.5 text-[#FF788D] shrink-0" />
          <span>{justSavedToast}</span>
        </div>
      )}

      {/* Quick Add Expanded Dropdown Tray */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[400px] bg-white rounded-2xl shadow-xl border border-[#FFDADA] p-4 z-40 animate-in fade-in zoom-in-95 duration-150 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#FFDADA]/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFF5F7] text-[#FF788D] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-serif font-bold text-[#2D2226]">
                  Instant Health Quick Add
                </h3>
                <p className="text-[11px] text-[#8E7A81]">
                  1-Tap rapid logging for today
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#8E7A81] hover:text-[#2D2226] hover:bg-[#FFF5F7] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Filter */}
          <div className="flex items-center gap-1 bg-[#FFF5F7] p-1 rounded-xl border border-[#FFDADA] text-xs">
            {(["all", "water", "sleep", "mood", "symptoms"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1 px-1.5 rounded-lg font-medium text-[11px] capitalize transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-white text-[#D9455D] shadow-2xs font-semibold"
                    : "text-[#735E65] hover:text-[#2D2226]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
            {/* 1. Hydration Quick Log */}
            {(activeTab === "all" || activeTab === "water") && (
              <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#FFDADA] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2D2226] flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-[#FF788D]" />
                    Hydration ({currentWater} glasses / {currentWater * 250} ml)
                  </span>
                  <span className="text-[11px] text-[#8E7A81]">Goal: 8 gl</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddWater(-1)}
                    disabled={currentWater <= 0}
                    className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-[#735E65] disabled:opacity-40 rounded-lg text-xs font-semibold border border-[#FFDADA] cursor-pointer active:scale-95"
                  >
                    -1 Glass
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddWater(1)}
                    className="flex-1 py-1.5 bg-[#FF788D] hover:bg-[#E85C71] text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+1 Glass (250ml)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddWater(2)}
                    className="px-2.5 py-1.5 bg-white hover:bg-[#FFF5F7] text-[#D9455D] rounded-lg text-xs font-bold border border-[#FFDADA] cursor-pointer active:scale-95"
                  >
                    +2 (Bottle)
                  </button>
                </div>
              </div>
            )}

            {/* 2. Mood Quick Selector */}
            {(activeTab === "all" || activeTab === "mood") && (
              <div className="p-3 bg-white rounded-xl border border-[#FFDADA] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2D2226] flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-[#FF788D]" />
                    Mood State
                  </span>
                  <span className="text-[11px] text-[#D9455D] capitalize font-medium">
                    Current: {currentMood}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {moods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSetMood(m.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium flex flex-col items-center gap-0.5 border transition-all cursor-pointer ${
                        currentMood === m.id
                          ? "bg-[#FFF5F7] text-[#D9455D] border-[#FF788D] font-bold shadow-2xs"
                          : "bg-[#FFF9FA] text-[#735E65] border-[#FFDADA] hover:bg-white"
                      }`}
                    >
                      <span className="text-sm">{m.emoji}</span>
                      <span className="text-[10px]">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Sleep Quick Log */}
            {(activeTab === "all" || activeTab === "sleep") && (
              <div className="p-3 bg-white rounded-xl border border-[#FFDADA] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2D2226] flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    Sleep Log ({currentSleep}h)
                  </span>
                  <span className="text-[11px] text-[#8E7A81]">Recommended: 7-9h</span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].slice(0, 5).map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => handleSetSleep(hrs)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        currentSleep === hrs
                          ? "bg-indigo-50 text-indigo-700 border-indigo-300 shadow-2xs font-bold"
                          : "bg-[#FFF5F7] text-[#735E65] border-[#FFDADA] hover:bg-white"
                      }`}
                    >
                      {hrs}h
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Energy Index (1-5) */}
            {(activeTab === "all" || activeTab === "symptoms") && (
              <div className="p-3 bg-white rounded-xl border border-[#FFDADA] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2D2226] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Energy Level ({currentEnergy}/5)
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleSetEnergy(lvl)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        currentEnergy === lvl
                          ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                          : "bg-[#FFF5F7] text-[#735E65] border-[#FFDADA] hover:bg-white"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Common Symptoms 1-Click Toggles */}
            {(activeTab === "all" || activeTab === "symptoms") && (
              <div className="p-3 bg-white rounded-xl border border-[#FFDADA] space-y-2">
                <div className="text-xs font-semibold text-[#2D2226] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#FF788D]" />
                  Quick Symptom Flags
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleSymptom("bloating")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      todayLog.bloating
                        ? "bg-[#FF788D] text-white border-[#FF788D]"
                        : "bg-[#FFF5F7] text-[#735E65] border-[#FFDADA] hover:bg-white"
                    }`}
                  >
                    {todayLog.bloating ? "✓ Bloating" : "+ Bloating"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleSymptom("breastTenderness")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      todayLog.breastTenderness
                        ? "bg-[#FF788D] text-white border-[#FF788D]"
                        : "bg-[#FFF5F7] text-[#735E65] border-[#FFDADA] hover:bg-white"
                    }`}
                  >
                    {todayLog.breastTenderness ? "✓ Breast Tender" : "+ Breast Tender"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleSymptom("acne")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      todayLog.acne
                        ? "bg-[#FF788D] text-white border-[#FF788D]"
                        : "bg-[#FFF5F7] text-[#735E65] border-[#FFDADA] hover:bg-white"
                    }`}
                  >
                    {todayLog.acne ? "✓ Skin/Acne" : "+ Skin/Acne"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetCramps(todayLog.crampsSeverity ? 0 : 2)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      (todayLog.crampsSeverity || 0) > 0
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-[#FFF5F7] text-[#735E65] border-[#FFDADA] hover:bg-white"
                    }`}
                  >
                    {(todayLog.crampsSeverity || 0) > 0
                      ? `✓ Cramps (${todayLog.crampsSeverity}/5)`
                      : "+ Cramps"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddExercise(30)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FFF5F7] hover:bg-emerald-50 text-[#735E65] hover:text-emerald-700 border border-[#FFDADA] hover:border-emerald-200 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Flame className="w-3 h-3 text-emerald-500" />
                    <span>+30m Workout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Jump to Full Log */}
          <div className="pt-2 border-t border-[#FFDADA]/60 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenTrack();
              }}
              className="text-xs font-semibold text-[#D9455D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open Detailed Daily Logger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-[#2D2226] text-white rounded-lg text-xs font-medium hover:bg-black cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
