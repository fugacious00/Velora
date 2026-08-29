import React, { useState, useEffect } from "react";
import { LifeStage } from "../types";
import {
  Sparkles,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Bookmark,
  Share2,
  Activity,
  Heart,
  Moon,
  Utensils,
  Wind,
  ShieldCheck,
} from "lucide-react";

export interface DailyInsightData {
  title: string;
  category: string;
  tip: string;
  scienceContext: string;
  actionItem: string;
  lifeStageTag: string;
  aiGenerated?: boolean;
  modelUsed?: string;
}

interface DailyHealthInsightCardProps {
  activeLifeStage: LifeStage;
  currentCycleDay?: number;
  recentSymptoms?: string[];
  onOpenCopilot?: (initialPrompt?: string) => void;
}

const STORAGE_KEY_PREFIX = "velora_daily_insight_";

export const DailyHealthInsightCard: React.FC<DailyHealthInsightCardProps> = ({
  activeLifeStage,
  currentCycleDay = 14,
  recentSymptoms = ["Mild fatigue", "Luteal tension"],
  onOpenCopilot,
}) => {
  const [insight, setInsight] = useState<DailyInsightData | null>(() => {
    const cached = localStorage.getItem(`${STORAGE_KEY_PREFIX}${activeLifeStage}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fall back to fetch
      }
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(!insight);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const fetchDailyInsight = async (forceRefresh = false) => {
    if (!forceRefresh && insight) return;

    setLoading(true);
    try {
      const response = await fetch("/api/daily-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lifeStage: activeLifeStage,
          userContext: {
            currentCycleDay: `Day ${currentCycleDay}`,
            recentSymptoms,
            energyLevel: "Moderate",
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to generate insight");

      const data: DailyInsightData = await response.json();
      setInsight(data);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${activeLifeStage}`, JSON.stringify(data));
    } catch (err) {
      console.warn("Using fallback daily insight:", err);
      // Fallback if network or server error
      const fallback: DailyInsightData = {
        title: "Support Hormonal Balance with Targeted Rest",
        category: "Hormonal Health",
        tip: "Consistent rest intervals and balanced magnesium-rich nutrition help optimize endocrine stability during your current biological window.",
        scienceContext: "Cortisol regulation directly supports progesterone and estrogen equilibrium.",
        actionItem: "Take 10 minutes for slow diaphragmatic breathing and enjoy a handful of almonds or leafy greens.",
        lifeStageTag: "Daily Biological Guidance",
        aiGenerated: true,
      };
      setInsight(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch or load cached insight whenever lifeStage changes
  useEffect(() => {
    const cached = localStorage.getItem(`${STORAGE_KEY_PREFIX}${activeLifeStage}`);
    if (cached) {
      try {
        setInsight(JSON.parse(cached));
        setLoading(false);
        return;
      } catch (e) {
        // ignore
      }
    }
    fetchDailyInsight();
  }, [activeLifeStage]);

  const handleCopy = () => {
    if (!insight) return;
    const text = `${insight.title}\n\n${insight.tip}\n\nAction Step: ${insight.actionItem} — Velora Health OS`;
    navigator.clipboard?.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
  };

  const getCategoryIcon = (category: string) => {
    const lower = (category || "").toLowerCase();
    if (lower.includes("nutrition") || lower.includes("food")) {
      return <Utensils className="w-3.5 h-3.5 text-[#16A34A]" />;
    }
    if (lower.includes("sleep") || lower.includes("recovery")) {
      return <Moon className="w-3.5 h-3.5 text-[#7E60CD]" />;
    }
    if (lower.includes("nervous") || lower.includes("mind")) {
      return <Wind className="w-3.5 h-3.5 text-[#0D9488]" />;
    }
    if (lower.includes("movement") || lower.includes("activity")) {
      return <Activity className="w-3.5 h-3.5 text-[#E11D48]" />;
    }
    return <Sparkles className="w-3.5 h-3.5 text-[#FF788D]" />;
  };

  return (
    <div
      id="daily-health-insight-card"
      className="bg-white rounded-3xl p-6 sm:p-7 border border-[#FFDADA] shadow-xs relative overflow-hidden space-y-5 transition-all"
    >
      {/* Decorative Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FFF0F3]/80 via-[#FFF8F9]/40 to-transparent rounded-bl-full pointer-events-none -z-0" />

      {/* Header Row */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FFDADA] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F3] border border-[#FFD3DC] text-[#FF788D] flex items-center justify-center shrink-0 shadow-2xs">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D2226] tracking-tight">
                Daily Health Insight
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#D9455D] border border-[#FFD3DC]">
                <Sparkles className="w-2.5 h-2.5" />
                AI Personalized
              </span>
            </div>
            <p className="text-xs text-[#8E7A81] mt-0.5">
              Evidence-based guidance tailored to your active life stage
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => fetchDailyInsight(true)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-[#FFF5F7] hover:bg-[#FFE5E9] text-[#735E65] hover:text-[#2D2226] border border-[#FFDADA] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Generate a fresh daily health tip"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FF788D]" : "text-[#735E65]"}`} />
            <span className="hidden sm:inline">Refresh Tip</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSave}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isSaved
                ? "bg-[#FFF0F3] border-[#FF788D] text-[#D9455D]"
                : "bg-[#FFF5F7] hover:bg-[#FFE5E9] border-[#FFDADA] text-[#735E65]"
            }`}
            title={isSaved ? "Saved to your bookmarks" : "Bookmark this tip"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-[#FF788D] text-[#FF788D]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-xl bg-[#FFF5F7] hover:bg-[#FFE5E9] border border-[#FFDADA] text-[#735E65] text-xs font-semibold transition-all cursor-pointer"
            title="Copy insight"
          >
            {isCopied ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#FFD3DC] border-t-[#FF788D] animate-spin" />
          <p className="text-xs font-medium text-[#8E7A81] animate-pulse">
            Synthesizing contextual insights from your physiological markers...
          </p>
        </div>
      ) : insight ? (
        <div className="relative z-10 space-y-4">
          {/* Badge & Title */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#735E65] bg-[#FFF5F7] border border-[#FFDADA] px-2.5 py-1 rounded-lg">
                {getCategoryIcon(insight.category)}
                <span>{insight.category}</span>
              </span>

              {insight.lifeStageTag && (
                <span className="text-[11px] font-bold text-[#D9455D] bg-[#FFF0F3] border border-[#FFD3DC] px-2.5 py-1 rounded-lg">
                  {insight.lifeStageTag}
                </span>
              )}
            </div>

            <h4 className="text-base sm:text-lg font-bold text-[#2D2226] leading-snug">
              {insight.title}
            </h4>
          </div>

          {/* Primary Tip Body */}
          <p className="text-xs sm:text-sm text-[#4E3942] leading-relaxed">
            {insight.tip}
          </p>

          {/* Physiological Mechanism Banner */}
          {insight.scienceContext && (
            <div className="p-3.5 rounded-2xl bg-[#FFF9FA] border border-[#FFDADA]/80 flex items-start gap-2.5 text-xs text-[#735E65] leading-normal">
              <ShieldCheck className="w-4 h-4 text-[#FF788D] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#2D2226]">The Science: </span>
                {insight.scienceContext}
              </div>
            </div>
          )}

          {/* Action Step & Copilot Bridge */}
          <div className="pt-2 border-t border-[#F5E6E9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-bold text-xs">
                ✓
              </div>
              <div className="text-xs text-[#2D2226]">
                <span className="font-bold text-[#D9455D]">Today's Action: </span>
                <span className="text-[#4E3942]">{insight.actionItem}</span>
              </div>
            </div>

            {onOpenCopilot && (
              <button
                type="button"
                onClick={() =>
                  onOpenCopilot(
                    `Can you tell me more about today's insight: "${insight.title}"? What foods, routines, or questions should I consider for this?`
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-[#FFF0F3] hover:bg-[#FFE5E9] text-[#D9455D] border border-[#FFD3DC] text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer self-stretch sm:self-auto"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#FF788D]" />
                <span>Discuss with Copilot</span>
                <ArrowRight className="w-3 h-3 text-[#FF788D]" />
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
