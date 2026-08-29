import React, { useState, useEffect } from "react";
import { useHealth } from "../context/HealthContext";
import { LIFE_STAGES } from "../data/initialData";
import { DailyAffirmationCard } from "./DailyAffirmationCard";
import { DailyHealthInsightCard } from "./DailyHealthInsightCard";
import { SevenDayTrendWidget } from "./SevenDayTrendWidget";
import { WeeklyHydrationTrendsChart } from "./WeeklyHydrationTrendsChart";
import { WaterIntakeQuickLog } from "./WaterIntakeQuickLog";
import { RecentSymptomsSummary } from "./RecentSymptomsSummary";
import { SleepDataSummaryCard } from "./SleepDataSummaryCard";
import { PersonalHealthGoalsTracker } from "./PersonalHealthGoalsTracker";
import { DailyReminderNotification } from "./DailyReminderNotification";
import { TopQuickAddSection } from "./TopQuickAddSection";
import { HealthInsightsAlertPill } from "./HealthInsightsAlertPill";
import {
  DashboardLayoutModal,
  DashboardCardItem,
  DEFAULT_DASHBOARD_CARDS,
} from "./DashboardLayoutModal";
import {
  Sparkles,
  Calendar,
  Heart,
  Baby,
  Activity,
  Compass,
  ArrowRight,
  TrendingUp,
  Moon,
  Sun,
  ShieldCheck,
  FileText,
  Plus,
  Utensils,
  Wind,
  CheckCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  AlertCircle,
  Sliders,
  SlidersHorizontal,
  Thermometer,
  Droplets,
  GripVertical,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
} from "lucide-react";

interface DashboardViewProps {
  onOpenLifeMap: () => void;
  onOpenTrack: () => void;
  onOpenCopilot: (prompt?: string) => void;
  onOpenBrief: () => void;
  onOpenVault: () => void;
  onOpenBreathing: () => void;
  onOpenKitchen: () => void;
}

const STORAGE_KEY = "velora_dashboard_layout_cards_v2";

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenLifeMap,
  onOpenTrack,
  onOpenCopilot,
  onOpenBrief,
  onOpenVault,
  onOpenBreathing,
  onOpenKitchen,
}) => {
  const {
    user,
    activeLifeStage,
    dailyLogs,
    todayLog,
    saveDailyLog,
    patterns,
    timeline,
    vaultDocs,
    formatTerm,
  } = useHealth();

  const stageConfig = LIFE_STAGES[activeLifeStage] || LIFE_STAGES.cycle_hormonal;
  const [quickCopilotPrompt, setQuickCopilotPrompt] = useState("");

  // Layout reordering and customization state
  const [dashboardCards, setDashboardCards] = useState<DashboardCardItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all default cards exist in saved list (in case of new cards added)
        const savedIds = new Set(parsed.map((c: DashboardCardItem) => c.id));
        const merged = [...parsed];
        DEFAULT_DASHBOARD_CARDS.forEach((defaultCard) => {
          if (!savedIds.has(defaultCard.id)) {
            merged.push(defaultCard);
          }
        });
        return merged;
      }
    } catch (e) {
      console.warn("Failed to load dashboard layout preference:", e);
    }
    return DEFAULT_DASHBOARD_CARDS;
  });

  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);
  const [dragOverCardIndex, setDragOverCardIndex] = useState<number | null>(null);
  const [showLayoutSavedToast, setShowLayoutSavedToast] = useState(false);

  // Save to localStorage when updated
  const saveCardsPreference = (updated: DashboardCardItem[]) => {
    setDashboardCards(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save layout preference to localStorage", e);
    }
    setShowLayoutSavedToast(true);
    setTimeout(() => setShowLayoutSavedToast(false), 2400);
  };

  const handleResetDefaultLayout = () => {
    saveCardsPreference(DEFAULT_DASHBOARD_CARDS);
  };

  // Live in-dashboard drag and drop
  const handleLiveDragStart = (index: number) => {
    setDraggedCardIndex(index);
  };

  const handleLiveDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverCardIndex !== index) {
      setDragOverCardIndex(index);
    }
  };

  const handleLiveDrop = (dropIndex: number) => {
    if (draggedCardIndex === null || draggedCardIndex === dropIndex) {
      setDraggedCardIndex(null);
      setDragOverCardIndex(null);
      return;
    }

    const updated = [...dashboardCards];
    const [moved] = updated.splice(draggedCardIndex, 1);
    updated.splice(dropIndex, 0, moved);

    saveCardsPreference(updated);
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);
  };

  const handleLiveMoveCard = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= dashboardCards.length) return;

    const updated = [...dashboardCards];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    saveCardsPreference(updated);
  };

  const handleLiveToggleHide = (cardId: string) => {
    const updated = dashboardCards.map((c) =>
      c.id === cardId ? { ...c, visible: !c.visible } : c
    );
    saveCardsPreference(updated);
  };

  // Cycle phase calculation helper
  const cycleDay = todayLog.cycleDay || 18;
  const totalLength = user.cycleLength || 29;
  const daysUntilNext = Math.max(1, totalLength - cycleDay + 1);

  const getCyclePhase = (day: number) => {
    if (day <= 5)
      return {
        name: "Menstrual Phase",
        desc: "Rest, gentle movement, iron-rich warm foods",
        color: "text-rose-600 bg-rose-50 border-rose-200",
      };
    if (day <= 12)
      return {
        name: "Follicular Phase",
        desc: "Rising estrogen, high energy, strength workouts",
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      };
    if (day <= 16)
      return {
        name: "Ovulatory Phase",
        desc: "Peak fertility & communication stamina",
        color: "text-teal-600 bg-teal-50 border-teal-200",
      };
    return {
      name: "Luteal Phase",
      desc: "Progesterone dominance, focus on magnesium & restful sleep",
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    };
  };

  const currentPhase = getCyclePhase(cycleDay);

  const handleQuickCopilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCopilotPrompt.trim()) return;
    onOpenCopilot(quickCopilotPrompt);
    setQuickCopilotPrompt("");
  };

  // Render individual card by ID
  const renderCardContent = (cardId: string) => {
    switch (cardId) {
      case "affirmation":
        return (
          <DailyAffirmationCard
            lifeStage={activeLifeStage}
            onOpenLifeMap={onOpenLifeMap}
          />
        );

      case "metrics_strip":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#FFDADA] shadow-xs">
              <div className="text-xs text-[#8E7A81] uppercase tracking-wider mb-1 font-medium">
                Current Rhythm
              </div>
              <div className="text-2xl font-semibold text-[#2D2226]">
                {activeLifeStage === "pregnant"
                  ? `Week ${user.pregnancyWeek || 16}`
                  : `Day ${cycleDay}`}
              </div>
              <div className="text-xs text-[#D9455D] mt-2 font-medium">
                {activeLifeStage === "pregnant" ? "2nd Trimester" : currentPhase.name}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("sleep-data-summary-card");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else onOpenTrack();
              }}
              className="bg-white p-5 rounded-2xl border border-[#FFDADA] hover:border-[#FF788D] shadow-xs text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs text-[#8E7A81] uppercase tracking-wider mb-1 font-medium">
                <span>Sleep Activity</span>
                <Moon className="w-3.5 h-3.5 text-[#FF788D] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-semibold text-[#2D2226]">
                {todayLog.sleepHours || 7.5}h
              </div>
              <div className="text-xs text-[#735E65] mt-2 font-medium capitalize flex items-center justify-between">
                <span>{todayLog.sleepQuality || "Restful"} quality</span>
                <span className="text-[10px] text-[#D9455D] font-bold group-hover:underline">
                  View →
                </span>
              </div>
            </button>

            <div className="bg-white p-5 rounded-2xl border border-[#FFDADA] shadow-xs">
              <div className="text-xs text-[#8E7A81] uppercase tracking-wider mb-1 font-medium">
                Mood State
              </div>
              <div className="text-2xl font-semibold text-[#2D2226] capitalize truncate">
                {todayLog.mood || "Calm"}
              </div>
              <div className="text-xs text-[#D9455D] mt-2 font-medium">
                Stable baseline
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#FFDADA] shadow-xs">
              <div className="text-xs text-[#8E7A81] uppercase tracking-wider mb-1 font-medium">
                Energy Index
              </div>
              <div className="text-2xl font-semibold text-[#2D2226]">
                {todayLog.energyLevel || 4}/5
              </div>
              <div className="text-xs text-[#735E65] mt-2 font-medium">
                High stamina
              </div>
            </div>
          </div>
        );

      case "daily_insight":
        return (
          <DailyHealthInsightCard
            activeLifeStage={activeLifeStage}
            currentCycleDay={cycleDay}
            recentSymptoms={todayLog.symptoms}
            onOpenCopilot={onOpenCopilot}
          />
        );

      case "seven_day_trend":
        return (
          <SevenDayTrendWidget
            logs={dailyLogs}
            todayLog={todayLog}
            activeLifeStage={activeLifeStage}
            onOpenTrack={onOpenTrack}
            onOpenCopilot={onOpenCopilot}
          />
        );

      case "sleep_summary":
        return (
          <SleepDataSummaryCard
            logs={dailyLogs}
            todayLog={todayLog}
            activeLifeStage={activeLifeStage}
            onSaveDailyLog={saveDailyLog}
            onOpenTrack={onOpenTrack}
            onOpenCopilot={onOpenCopilot}
          />
        );

      case "hydration_trends":
        return (
          <WeeklyHydrationTrendsChart
            logs={dailyLogs}
            todayLog={todayLog}
            activeLifeStage={activeLifeStage}
            onSaveDailyLog={saveDailyLog}
            onOpenTrack={onOpenTrack}
          />
        );

      case "health_goals":
        return (
          <PersonalHealthGoalsTracker
            activeLifeStage={activeLifeStage}
            onOpenTrack={onOpenTrack}
            onOpenBreathing={onOpenBreathing}
            onOpenKitchen={onOpenKitchen}
          />
        );

      case "stage_hero":
        return activeLifeStage === "pregnant" ? (
          <div className="bg-white rounded-2xl p-6 border border-[#FFDADA] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#FFDADA] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#FFF5F7] text-[#FF788D]">
                  <Baby className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#2D2226]">
                    Pregnancy Week {user.pregnancyWeek || 16}
                  </h2>
                  <p className="text-xs text-[#8E7A81]">
                    Second Trimester · 24 Weeks Remaining
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA]">
                Size of an Avocado (~4.5 in)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] text-center">
                <p className="text-xs text-[#8E7A81] font-medium">Baby Heart Rate</p>
                <p className="text-lg font-bold text-[#2D2226] mt-1">146 bpm</p>
                <span className="text-[10px] text-[#D9455D] font-medium">Normal range</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] text-center">
                <p className="text-xs text-[#8E7A81] font-medium">Maternal BP</p>
                <p className="text-lg font-bold text-[#2D2226] mt-1">116/74</p>
                <span className="text-[10px] text-[#D9455D] font-medium">Optimal baseline</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] text-center">
                <p className="text-xs text-[#8E7A81] font-medium">Kick Counter</p>
                <p className="text-lg font-bold text-[#2D2226] mt-1">
                  {todayLog.babyKicksCount || 8} kicks
                </p>
                <span className="text-[10px] text-[#8E7A81]">Logged today</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] text-xs text-[#2D2226] space-y-1">
              <p className="font-semibold text-[#D9455D] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF788D]" />
                <span>Key Developmental Milestones This Week</span>
              </p>
              <p className="text-[#735E65] leading-relaxed">
                Baby's facial muscles are practicing subtle expressions and the tiny bones in the inner ears are formed enough to recognize maternal heartbeat and voice.
              </p>
            </div>
          </div>
        ) : activeLifeStage === "postpartum" ? (
          <div className="bg-white rounded-2xl p-6 border border-[#FFDADA] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#FFDADA] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#FFF5F7] text-[#FF788D]">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#2D2226]">
                    How Am I Doing? (Postpartum Recovery)
                  </h2>
                  <p className="text-xs text-[#8E7A81]">
                    6 Weeks Post-Birth · Fourth Trimester Checkpoint
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenTrack}
                className="text-xs font-semibold text-[#D9455D] hover:underline cursor-pointer"
              >
                Update Vitals →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#FFF5F7] border border-[#FFDADA]">
                <span className="text-[11px] text-[#8E7A81]">Healing Score</span>
                <p className="text-base font-bold text-[#2D2226] mt-1">4.2 / 5.0</p>
                <span className="text-[10px] text-[#D9455D] font-medium">Normal progression</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFF5F7] border border-[#FFDADA]">
                <span className="text-[11px] text-[#8E7A81]">Pelvic Floor</span>
                <p className="text-base font-bold text-[#2D2226] mt-1">Mild tension</p>
                <span className="text-[10px] text-[#8E7A81]">Gentle breathwork</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFF5F7] border border-[#FFDADA]">
                <span className="text-[11px] text-[#8E7A81]">Feedings Logged</span>
                <p className="text-base font-bold text-[#2D2226] mt-1">7 Sessions</p>
                <span className="text-[10px] text-[#D9455D] font-medium">Well hydrated</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFF5F7] border border-[#FFDADA]">
                <span className="text-[11px] text-[#8E7A81]">Support Check</span>
                <p className="text-base font-bold text-[#2D2226] mt-1">Good (4/5)</p>
                <span className="text-[10px] text-[#8E7A81]">Partner & family</span>
              </div>
            </div>
          </div>
        ) : activeLifeStage === "ttc" ? (
          <div className="bg-white rounded-2xl p-6 border border-[#FFDADA] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#FFDADA] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#FFF5F7] text-[#FF788D]">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#2D2226]">
                    Fertility & Ovulation Horizon
                  </h2>
                  <p className="text-xs text-[#8E7A81]">
                    Cycle Day {cycleDay} of {totalLength} · Biphasic BBT Shift Sustained
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA]">
                Post-Ovulatory Window
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] text-center">
                <p className="text-xs text-[#8E7A81]">Basal Body Temp</p>
                <p className="text-lg font-bold text-[#2D2226] mt-1">97.9°F</p>
                <span className="text-[10px] text-[#D9455D] font-medium">+0.4°F Luteal Shift</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] text-center">
                <p className="text-xs text-[#8E7A81]">LH Surge Test</p>
                <p className="text-lg font-bold text-[#2D2226] mt-1">Peak (Day 14)</p>
                <span className="text-[10px] text-[#8E7A81]">4 days ago</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] text-center">
                <p className="text-xs text-[#8E7A81]">Cervical Fluid</p>
                <p className="text-lg font-bold text-[#2D2226] mt-1">Creamy</p>
                <span className="text-[10px] text-[#8E7A81]">Progesterone dominant</span>
              </div>
            </div>
          </div>
        ) : (
          /* General Cycling & Teen Life Stage */
          <div className="bg-white rounded-2xl p-6 border border-[#FFDADA] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#FFDADA] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA]">
                    {formatTerm("Cycle Day " + cycleDay, "Day " + cycleDay)} of {totalLength}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#FFDADA] bg-[#FFF5F7] text-[#D9455D]">
                    {currentPhase.name}
                  </span>
                </div>
                <h2 className="text-lg font-serif font-bold text-[#2D2226] mt-2">
                  {formatTerm("Biological Rhythm Status", "Daily Wellness Rhythm")}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-serif text-[#FF788D]">
                  ~{daysUntilNext}
                </span>
                <p className="text-[11px] text-[#8E7A81] font-medium">Days to Next Cycle</p>
              </div>
            </div>

            {/* Visual Cycle Progress Track */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#8E7A81] font-medium">
                <span>{formatTerm("Menstrual (1-5)", "Phase 1")}</span>
                <span>{formatTerm("Follicular (6-12)", "Phase 2")}</span>
                <span>{formatTerm("Ovulation (13-16)", "Phase 3")}</span>
                <span className="font-semibold text-[#D9455D]">
                  {formatTerm("Luteal (17-29)", "Phase 4")}
                </span>
              </div>
              <div className="w-full bg-[#FFF5F7] rounded-full h-3 flex overflow-hidden p-0.5 border border-[#FFDADA]">
                <div
                  className="bg-[#FFDADA] h-full rounded-l-full"
                  style={{ width: "17%" }}
                  title="Menstrual"
                />
                <div
                  className="bg-[#FFB7C3] h-full"
                  style={{ width: "24%" }}
                  title="Follicular"
                />
                <div
                  className="bg-[#FF94A4] h-full"
                  style={{ width: "14%" }}
                  title="Ovulation"
                />
                <div
                  className="bg-[#FF788D] h-full rounded-r-full"
                  style={{ width: "45%" }}
                  title="Luteal"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#FF788D] mt-0.5 shrink-0" />
              <div className="text-xs text-[#2D2226]">
                <span className="font-semibold text-[#D9455D]">Phase Physiology Guidance: </span>
                {currentPhase.desc}. Progesterone is preparing the uterine lining and metabolic baseline is slightly elevated (+100–150 kcal/day).
              </div>
            </div>
          </div>
        );

      case "body_pattern":
        return (
          <div className="bg-[#FF788D] rounded-2xl p-6 text-white shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-white/25 pb-3">
              <div>
                <h3 className="text-xs uppercase tracking-widest opacity-90 font-semibold">
                  Body Pattern Engine™
                </h3>
                <p className="text-xs text-white/90 mt-0.5">
                  Observed biological relationships across your longitudinal logs
                </p>
              </div>
              <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded">
                Non-Diagnostic AI
              </span>
            </div>

            <div className="space-y-3">
              {patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="p-4 rounded-xl bg-white/15 border border-white/20 space-y-2.5 backdrop-blur-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">
                          {pattern.title}
                        </h4>
                        <span className="text-[10px] font-medium bg-white/25 text-white px-1.5 py-0.5 rounded">
                          {pattern.occurrenceFrequency}
                        </span>
                      </div>
                      <p className="text-xs text-white/95 mt-1 leading-relaxed font-light">
                        "{pattern.description}"
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-white/90 shrink-0">
                      {pattern.confidenceScore}% match
                    </span>
                  </div>

                  <div className="text-xs text-white/95 bg-white/20 p-2.5 rounded-lg border border-white/25 font-light">
                    💡 <span className="font-medium text-white">Lifestyle Observation:</span>{" "}
                    {pattern.nonDiagnosticAdvice}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() =>
                        onOpenCopilot(
                          `Can you explain why "${pattern.title}" happens and what to discuss with my doctor?`
                        )
                      }
                      className="text-xs font-medium text-[#2D2226] bg-white hover:bg-white/90 px-3 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      Ask Copilot →
                    </button>
                    <button
                      onClick={onOpenBrief}
                      className="text-xs font-medium text-white hover:text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Add to Doctor Brief
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[10px] italic opacity-80 border-t border-white/20 pt-3">
              This pattern is an observation of user-provided data, not a clinical diagnosis.
            </div>
          </div>
        );

      case "copilot_prompt":
        return (
          <div className="bg-white rounded-2xl p-5 border border-[#FFDADA] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF788D]" />
                <span className="text-xs font-semibold tracking-wide text-[#D9455D]">
                  Velora Health Copilot (8-Step Safety Guard)
                </span>
              </div>
              <span className="text-[10px] text-[#8E7A81]">Zero-Knowledge Private</span>
            </div>

            <form onSubmit={handleQuickCopilotSubmit} className="flex gap-2">
              <input
                type="text"
                value={quickCopilotPrompt}
                onChange={(e) => setQuickCopilotPrompt(e.target.value)}
                placeholder="Ask about symptoms, cycle shifts, doctor questions, nutrition..."
                className="flex-1 bg-[#FFF5F7] border border-[#FFDADA] rounded-xl px-4 py-2.5 text-sm text-[#2D2226] placeholder-[#8E7A81] focus:outline-none focus:ring-1 focus:ring-[#FF788D]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#FF788D] hover:bg-[#E85C71] text-white font-semibold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
              >
                Ask
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-1">
              {stageConfig.suggestedPrompts.slice(0, 2).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onOpenCopilot(prompt)}
                  className="text-[11px] text-[#735E65] hover:text-[#2D2226] bg-[#FFF5F7] hover:bg-[#FFEDF1] px-2.5 py-1 rounded-lg border border-[#FFDADA] transition-colors text-left truncate max-w-xs cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        );

      case "day_glance":
        return (
          <div className="bg-white rounded-2xl p-6 border border-[#FFDADA] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#FFDADA] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[#2D2226]">Your Day</h3>
                <p className="text-xs text-[#8E7A81]">Friday, August 21</p>
              </div>
              <button
                onClick={onOpenTrack}
                className="text-xs font-semibold text-[#D9455D] hover:opacity-80 bg-[#FFF5F7] px-2.5 py-1 rounded-lg border border-[#FFDADA] cursor-pointer"
              >
                Open Full Log →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#FFF5F7] border border-[#FFDADA]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8E7A81] flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-[#FF788D]" />
                    <span>Energy</span>
                  </span>
                  <span className="text-xs font-bold text-[#2D2226]">
                    {todayLog.energyLevel || 4}/5
                  </span>
                </div>
                <div className="w-full bg-[#FFDADA] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#FF788D] h-full rounded-full"
                    style={{ width: `${((todayLog.energyLevel || 4) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF5F7] border border-[#FFDADA]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8E7A81] flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-[#FF788D]" />
                    <span>Sleep</span>
                  </span>
                  <span className="text-xs font-bold text-[#2D2226]">
                    {todayLog.sleepHours || 7.6}h
                  </span>
                </div>
                <p className="text-[10px] text-[#8E7A81] mt-1 capitalize">
                  {todayLog.sleepQuality || "Restful"} quality
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF5F7] border border-[#FFDADA]">
                <span className="text-xs text-[#8E7A81]">Current Mood</span>
                <p className="text-sm font-semibold text-[#2D2226] mt-1 capitalize">
                  {todayLog.mood || "Calm & Focused"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF5F7] border border-[#FFDADA]">
                <span className="text-xs text-[#8E7A81]">Medications Logged</span>
                <p className="text-sm font-semibold text-[#2D2226] mt-1 truncate">
                  {todayLog.medicationsTaken?.length || 2} Active
                </p>
              </div>
            </div>

            {/* Quick 1-Tap Symptom Toggles */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-medium text-[#8E7A81]">Quick Log Check-in:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() =>
                    saveDailyLog({
                      hydrationGlasses: (todayLog.hydrationGlasses || 0) + 1,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F0F9FF] border border-[#BAE6FD] text-[#0284C7] hover:bg-[#E0F2FE] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>+ Water ({todayLog.hydrationGlasses || 0}/8)</span>
                </button>
                <button
                  onClick={() =>
                    saveDailyLog({
                      crampsSeverity: todayLog.crampsSeverity > 0 ? 0 : 2,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    todayLog.crampsSeverity > 0
                      ? "bg-[#FFDADA] border-[#FF788D] text-[#D9455D] font-semibold"
                      : "bg-[#FFF5F7] border-[#FFDADA] text-[#735E65] hover:bg-[#FFEDF1]"
                  }`}
                >
                  {todayLog.crampsSeverity > 0
                    ? `✓ Cramps (${todayLog.crampsSeverity}/5)`
                    : "+ Cramps"}
                </button>
                <button
                  onClick={() =>
                    saveDailyLog({
                      headacheSeverity: todayLog.headacheSeverity > 0 ? 0 : 2,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    todayLog.headacheSeverity > 0
                      ? "bg-[#FFDADA] border-[#FF788D] text-[#D9455D] font-semibold"
                      : "bg-[#FFF5F7] border-[#FFDADA] text-[#735E65] hover:bg-[#FFEDF1]"
                  }`}
                >
                  {todayLog.headacheSeverity > 0
                    ? `✓ Headache (${todayLog.headacheSeverity}/5)`
                    : "+ Headache"}
                </button>
                <button
                  onClick={() => saveDailyLog({ bloating: !todayLog.bloating })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    todayLog.bloating
                      ? "bg-[#FFDADA] border-[#FF788D] text-[#D9455D] font-semibold"
                      : "bg-[#FFF5F7] border-[#FFDADA] text-[#735E65] hover:bg-[#FFEDF1]"
                  }`}
                >
                  {todayLog.bloating ? "✓ Bloating" : "+ Bloating"}
                </button>
              </div>
            </div>
          </div>
        );

      case "recent_symptoms":
        return (
          <RecentSymptomsSummary
            onOpenTrack={onOpenTrack}
            onOpenCopilot={onOpenCopilot}
          />
        );

      case "water_quick_log":
        return (
          <WaterIntakeQuickLog
            currentGlasses={todayLog.hydrationGlasses || 0}
            onUpdateGlasses={(count) =>
              saveDailyLog({ hydrationGlasses: count })
            }
            activeLifeStage={activeLifeStage}
          />
        );

      case "wellbeing_tools":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={onOpenKitchen}
              className="p-4 rounded-2xl bg-white border border-[#FFDADA] hover:border-[#FF788D] hover:shadow-xs transition-all text-left space-y-2 group cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-[#FFF5F7] text-[#FF788D] w-fit group-hover:scale-105 transition-transform">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#2D2226]">
                  What's in My Kitchen?
                </h4>
                <p className="text-[11px] text-[#8E7A81] mt-0.5">
                  Life-stage recipes & nutrient planning
                </p>
              </div>
            </button>

            <button
              onClick={onOpenBreathing}
              className="p-4 rounded-2xl bg-white border border-[#FFDADA] hover:border-[#FF788D] hover:shadow-xs transition-all text-left space-y-2 group cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-[#FFF5F7] text-[#FF788D] w-fit group-hover:scale-105 transition-transform">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#2D2226]">
                  Nervous System Reset
                </h4>
                <p className="text-[11px] text-[#8E7A81] mt-0.5">
                  4-7-8 & Box Breathing for vagus tone
                </p>
              </div>
            </button>
          </div>
        );

      case "vault_summary":
        return (
          <div className="bg-white rounded-2xl p-6 border border-[#FFDADA] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FFF5F7] text-[#FF788D]">
                  <ShieldCheck className="w-5 h-5 text-[#FF788D]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#2D2226]">
                    Health Vault Storage
                  </h3>
                  <p className="text-xs text-[#8E7A81]">
                    {vaultDocs.length} Encrypted Documents Indexed
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenVault}
                className="text-xs font-semibold text-[#D9455D] hover:underline cursor-pointer"
              >
                View Vault →
              </button>
            </div>

            <div className="space-y-2.5">
              {vaultDocs.slice(0, 2).map((doc) => (
                <div
                  key={doc.id}
                  onClick={onOpenVault}
                  className="p-3 rounded-xl bg-[#FFF5F7] hover:bg-[#FFEDF1] border border-[#FFDADA] transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-semibold text-[#2D2226] truncate">
                      {doc.title}
                    </p>
                    <p className="text-[11px] text-[#8E7A81] truncate">
                      {doc.facilityOrProvider} · {doc.uploadDate}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold bg-white text-[#D9455D] px-2 py-0.5 rounded border border-[#FFDADA] shrink-0">
                    {doc.category.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case "timeline_preview":
        return (
          <div className="bg-white rounded-2xl p-6 border border-[#FFDADA] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#2D2226]">
                Timeline Highlights
              </h3>
              <span className="text-xs text-[#8E7A81]">Chronological</span>
            </div>

            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#FFDADA]">
              {timeline.slice(0, 3).map((event) => (
                <div key={event.id} className="relative pl-7 space-y-0.5">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-[#FF788D] border-2 border-white ring-2 ring-[#FFDADA]" />
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#2D2226]">
                      {event.title}
                    </p>
                    <span className="text-[10px] text-[#8E7A81]">{event.date}</span>
                  </div>
                  {event.subtitle && (
                    <p className="text-[11px] text-[#735E65]">{event.subtitle}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const visibleCards = dashboardCards.filter((c) => c.visible);

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12">
      {/* Layout Saved Toast Notification */}
      {showLayoutSavedToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#2D2226] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-[#FF788D]/40 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="w-5 h-5 rounded-full bg-[#FF788D] flex items-center justify-center text-white shrink-0">
            <Check className="w-3 h-3" />
          </div>
          <span>Dashboard layout preference saved</span>
        </div>
      )}

      {/* Top Utility Header Bar (Outside Card) - Stage, Date, Status & Quick Add */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenLifeMap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA] transition-all cursor-pointer shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5 text-[#FF788D]" />
            <span>{stageConfig.name}</span>
            <span className="text-[#8E7A81]">· Change Stage</span>
          </button>
          <span className="text-xs text-[#8E7A81] font-medium hidden sm:inline">
            Friday, August 21, 2026
          </span>
          <DailyReminderNotification
            todayLog={todayLog}
            onSaveDailyLog={saveDailyLog}
            onOpenTrack={onOpenTrack}
            activeLifeStage={activeLifeStage}
          />
        </div>

        <TopQuickAddSection
          todayLog={todayLog}
          onSaveDailyLog={saveDailyLog}
          activeLifeStage={activeLifeStage}
          onOpenTrack={onOpenTrack}
        />
      </div>

      {/* 1. Header Banner in #FF788D & #FFDADA aesthetic */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-[#2D2226] border border-[#FFDADA] shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#2D2226]">
              Good morning, {user.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-[#735E65] max-w-xl leading-relaxed">
              {activeLifeStage === "pregnant"
                ? `Week ${user.pregnancyWeek || 16} · Baby is the size of an avocado (~4.5 in). Maternal vitals & hydration are steady.`
                : activeLifeStage === "postpartum"
                ? `6 Weeks Postpartum · Fourth-trimester recovery, pelvic tone, and hormonal transition baseline.`
                : activeLifeStage === "perimenopause"
                ? `Cycle rhythm & vasomotor observation active. 28-day baseline window.`
                : activeLifeStage === "ttc"
                ? `Day ${cycleDay} of ${totalLength} · Ovulatory window passed. Basal temp sustained at 97.9°F.`
                : `${formatTerm("Cycle Day " + cycleDay, "Day " + cycleDay)} (${currentPhase.name}) · Next cycle expected in ~${daysUntilNext} days.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs border transition-all flex items-center gap-2 cursor-pointer ${
                isEditMode
                  ? "bg-[#2D2226] text-white border-[#2D2226] shadow-xs"
                  : "bg-white text-[#735E65] hover:text-[#2D2226] border-[#FFDADA] hover:bg-[#FFF5F7]"
              }`}
              title="Toggle in-dashboard drag & drop reorder mode"
            >
              <GripVertical className="w-4 h-4 text-[#FF788D]" />
              <span>{isEditMode ? "Exit Reorder" : "Reorder Cards"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLayoutModalOpen(true)}
              className="px-3.5 py-2.5 bg-[#FFF5F7] hover:bg-[#FFEDF1] active:scale-98 text-[#D9455D] rounded-xl font-semibold text-xs border border-[#FFDADA] transition-all flex items-center gap-2 cursor-pointer"
              title="Open full layout customization panel"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#FF788D]" />
              <span className="hidden sm:inline">Customize Layout</span>
            </button>

            <button
              onClick={onOpenTrack}
              className="px-4 py-2.5 bg-[#FF788D] hover:bg-[#E85C71] active:scale-98 text-white rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Your Day</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Health Insights 7-Day Trend Alert Banner */}
      <HealthInsightsAlertPill
        variant="banner-card"
        onOpenCopilot={onOpenCopilot}
        onOpenBrief={onOpenBrief}
        onOpenTrack={onOpenTrack}
      />

      {/* Interactive Edit Mode Sticky Control Banner */}
      {isEditMode && (
        <div className="sticky top-4 z-30 bg-[#2D2226] text-white rounded-2xl p-4 shadow-xl border border-[#FF788D]/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF788D] flex items-center justify-center text-white shrink-0">
              <GripVertical className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">
                Drag-and-Drop Reorder Mode Active
              </p>
              <p className="text-[11px] text-[#FFDADA]">
                Drag any card by its header bar or use Up/Down buttons to customize card order
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaultLayout}
              className="px-3 py-1.5 text-xs font-semibold text-[#FFDADA] hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLayoutModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-[#FF788D] bg-white hover:bg-[#FFF5F7] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Presets</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#FF788D] hover:bg-[#E85C71] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

      {/* DYNAMIC CARD ORDER RENDERING WITH DRAG AND DROP */}
      <div className="space-y-6">
        {visibleCards.map((card, index) => {
          const isDragging = draggedCardIndex === index;
          const isOver = dragOverCardIndex === index;

          return (
            <div
              key={card.id}
              draggable={isEditMode}
              onDragStart={() => handleLiveDragStart(index)}
              onDragOver={(e) => handleLiveDragOver(e, index)}
              onDrop={() => handleLiveDrop(index)}
              onDragEnd={() => {
                setDraggedCardIndex(null);
                setDragOverCardIndex(null);
              }}
              className={`transition-all rounded-3xl ${
                isDragging
                  ? "opacity-35 scale-[0.98] border-2 border-dashed border-[#FF788D] p-2 bg-[#FFF5F7]"
                  : isOver
                  ? "ring-2 ring-[#FF788D] ring-offset-4 rounded-3xl"
                  : ""
              }`}
            >
              {/* Optional Edit Bar on Top of each Card when in Reorder Mode */}
              {isEditMode && (
                <div className="mb-2 px-4 py-2 bg-gradient-to-r from-[#FFF5F7] via-white to-[#FFF9FA] rounded-2xl border border-[#FFDADA] shadow-2xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-[#FF788D]" />
                    <span className="w-5 h-5 rounded-full bg-[#FF788D] text-white text-[10px] font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-[#2D2226]">
                      {card.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleLiveMoveCard(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg text-[#735E65] hover:text-[#2D2226] hover:bg-[#FFE5E9] disabled:opacity-20 cursor-pointer"
                      title="Move card up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLiveMoveCard(index, "down")}
                      disabled={index === visibleCards.length - 1}
                      className="p-1.5 rounded-lg text-[#735E65] hover:text-[#2D2226] hover:bg-[#FFE5E9] disabled:opacity-20 cursor-pointer"
                      title="Move card down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLiveToggleHide(card.id)}
                      className="p-1.5 rounded-lg text-[#735E65] hover:text-[#D9455D] hover:bg-[#FFE5E9] cursor-pointer"
                      title="Hide card"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Actual Card Content Component */}
              <div>{renderCardContent(card.id)}</div>
            </div>
          );
        })}
      </div>

      {/* Layout Customizer Modal Dialog */}
      <DashboardLayoutModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        cards={dashboardCards}
        onSaveCards={saveCardsPreference}
        onResetDefault={handleResetDefaultLayout}
      />
    </div>
  );
};
