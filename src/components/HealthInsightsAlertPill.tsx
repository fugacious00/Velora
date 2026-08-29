import React, { useState, useMemo } from "react";
import { useHealth } from "../context/HealthContext";
import { parseHealthInsights } from "../utils/healthInsightsEngine";
import { HealthInsightAlert, DailyHealthLog, HealthInsightSeverity } from "../types";
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Moon,
  Droplets,
  AlertTriangle,
  Activity,
  ChevronRight,
  X,
  ArrowRight,
  Info,
  CheckCircle2,
  Share2,
  FileText,
  Sliders,
  RotateCcw,
  Zap,
  HelpCircle,
  Clock,
  ShieldCheck,
  Flame,
  Check,
} from "lucide-react";

interface HealthInsightsAlertPillProps {
  onOpenCopilot?: (initialPrompt?: string) => void;
  onOpenBrief?: () => void;
  onOpenTrack?: () => void;
  className?: string;
  variant?: "header-pill" | "banner-card" | "compact";
}

const SNOOZED_KEY_PREFIX = "velora_health_insights_snoozed_";

export const HealthInsightsAlertPill: React.FC<HealthInsightsAlertPillProps> = ({
  onOpenCopilot,
  onOpenBrief,
  onOpenTrack,
  className = "",
  variant = "header-pill",
}) => {
  const { dailyLogs, todayLog, activeLifeStage, saveDailyLog, addTimelineEvent, logAudit } = useHealth();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlertIndex, setSelectedAlertIndex] = useState(0);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [isBriefAdded, setIsBriefAdded] = useState(false);
  const [simulationPreset, setSimulationPreset] = useState<string | null>(null);

  const todayStr = todayLog.date || "2026-08-21";

  // Check if snoozed for the current session/day
  const [isSnoozed, setIsSnoozed] = useState<boolean>(() => {
    return localStorage.getItem(`${SNOOZED_KEY_PREFIX}${todayStr}`) === "true";
  });

  // Effective logs: use live logs or simulated preset if user is testing scenarios
  const effectiveLogs = useMemo(() => {
    if (!simulationPreset) return dailyLogs;

    // Simulated test scenarios
    if (simulationPreset === "sleep_drop") {
      return [
        { ...todayLog, date: "2026-08-21", sleepHours: 5.8, sleepQuality: "poor" as const },
        { ...todayLog, date: "2026-08-20", sleepHours: 6.4, sleepQuality: "disturbed" as const },
        { ...todayLog, date: "2026-08-19", sleepHours: 7.0, sleepQuality: "average" as const },
        { ...todayLog, date: "2026-08-18", sleepHours: 7.5, sleepQuality: "restful" as const },
        { ...todayLog, date: "2026-08-17", sleepHours: 8.0, sleepQuality: "restful" as const },
        { ...todayLog, date: "2026-08-16", sleepHours: 8.2, sleepQuality: "restful" as const },
        { ...todayLog, date: "2026-08-15", sleepHours: 8.4, sleepQuality: "restful" as const },
      ];
    }

    if (simulationPreset === "hydration_deficit") {
      return [
        { ...todayLog, date: "2026-08-21", hydrationGlasses: 3 },
        { ...todayLog, date: "2026-08-20", hydrationGlasses: 4 },
        { ...todayLog, date: "2026-08-19", hydrationGlasses: 4 },
        { ...todayLog, date: "2026-08-18", hydrationGlasses: 5 },
        { ...todayLog, date: "2026-08-17", hydrationGlasses: 7 },
        { ...todayLog, date: "2026-08-16", hydrationGlasses: 8 },
        { ...todayLog, date: "2026-08-15", hydrationGlasses: 8 },
      ];
    }

    if (simulationPreset === "headache_cluster") {
      return [
        { ...todayLog, date: "2026-08-21", headacheSeverity: 3 },
        { ...todayLog, date: "2026-08-20", headacheSeverity: 2 },
        { ...todayLog, date: "2026-08-19", headacheSeverity: 1 },
        { ...todayLog, date: "2026-08-18", headacheSeverity: 0 },
        { ...todayLog, date: "2026-08-17", headacheSeverity: 0 },
        { ...todayLog, date: "2026-08-16", headacheSeverity: 0 },
        { ...todayLog, date: "2026-08-15", headacheSeverity: 0 },
      ];
    }

    if (simulationPreset === "optimal_vitality") {
      return [
        { ...todayLog, date: "2026-08-21", sleepHours: 8.0, hydrationGlasses: 8, energyLevel: 5, headacheSeverity: 0, crampsSeverity: 0 },
        { ...todayLog, date: "2026-08-20", sleepHours: 8.1, hydrationGlasses: 8, energyLevel: 5, headacheSeverity: 0, crampsSeverity: 0 },
        { ...todayLog, date: "2026-08-19", sleepHours: 7.9, hydrationGlasses: 8, energyLevel: 4, headacheSeverity: 0, crampsSeverity: 0 },
        { ...todayLog, date: "2026-08-18", sleepHours: 8.0, hydrationGlasses: 7, energyLevel: 5, headacheSeverity: 0, crampsSeverity: 0 },
        { ...todayLog, date: "2026-08-17", sleepHours: 8.2, hydrationGlasses: 8, energyLevel: 5, headacheSeverity: 0, crampsSeverity: 0 },
        { ...todayLog, date: "2026-08-16", sleepHours: 8.0, hydrationGlasses: 8, energyLevel: 4, headacheSeverity: 0, crampsSeverity: 0 },
        { ...todayLog, date: "2026-08-15", sleepHours: 8.1, hydrationGlasses: 8, energyLevel: 5, headacheSeverity: 0, crampsSeverity: 0 },
      ];
    }

    return dailyLogs;
  }, [dailyLogs, todayLog, simulationPreset]);

  // Real-time calculation of detected insights
  const alerts = useMemo(() => {
    return parseHealthInsights(effectiveLogs, todayLog, activeLifeStage);
  }, [effectiveLogs, todayLog, activeLifeStage]);

  const activeAlert = alerts[selectedAlertIndex] || alerts[0];

  // Snooze handler
  const handleSnooze = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSnoozed(true);
    localStorage.setItem(`${SNOOZED_KEY_PREFIX}${todayStr}`, "true");
  };

  // Restore handler
  const handleRestore = () => {
    setIsSnoozed(false);
    localStorage.removeItem(`${SNOOZED_KEY_PREFIX}${todayStr}`);
  };

  // Action toggle
  const toggleAction = (actionKey: string) => {
    setCheckedActions((prev) => ({ ...prev, [actionKey]: !prev[actionKey] }));
  };

  // Send prompt to Copilot
  const handleAskCopilot = () => {
    if (!activeAlert) return;
    setIsOpen(false);
    if (onOpenCopilot) {
      onOpenCopilot(activeAlert.copilotPromptSuggestion);
    }
  };

  // Add to Doctor Brief
  const handleAddToBrief = () => {
    if (!activeAlert) return;
    setIsBriefAdded(true);
    logAudit(
      "Health Trend Tagged to Doctor Brief",
      "Export",
      `Tagged 7-Day Trend "${activeAlert.title}" (${activeAlert.changeMetric.description}) for clinical consultation.`
    );
    addTimelineEvent({
      date: todayStr,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category: "milestone",
      title: `Clinical Insight Tagged: ${activeAlert.title}`,
      subtitle: activeAlert.summary,
      details: `7-Day confidence score ${activeAlert.confidenceScore}%. Included in next Doctor Brief export.`,
      severity: "notable",
      tags: ["7-Day Insight", activeAlert.category],
    });
    setTimeout(() => setIsBriefAdded(false), 3500);
  };

  // If snoozed and not simulated, show a tiny minimal restore icon or null
  if (isSnoozed && !simulationPreset && variant === "header-pill") {
    return (
      <button
        onClick={handleRestore}
        title="Show 7-Day Health Insights Alert"
        className="text-[11px] font-medium text-[#8E7A81] hover:text-[#D9455D] bg-[#FFF5F7] hover:bg-[#FFEDF1] border border-[#FFDADA] px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
      >
        <Sparkles className="w-3 h-3 text-[#FF788D]" />
        <span className="hidden sm:inline">Insights</span>
      </button>
    );
  }

  if (!activeAlert) return null;

  // Icon selector based on alert type
  const getAlertIcon = (type: string, severity: HealthInsightSeverity) => {
    switch (type) {
      case "sleep_drop":
      case "sleep_disruption":
        return <Moon className={`w-3.5 h-3.5 ${severity === "elevated" ? "text-amber-600" : "text-[#FF788D]"}`} />;
      case "hydration_deficit":
        return <Droplets className="w-3.5 h-3.5 text-sky-600" />;
      case "headache_cluster":
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      case "energy_dip":
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case "hot_flashes_surge":
        return <Flame className="w-3.5 h-3.5 text-rose-500" />;
      case "vitality_optimal":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <TrendingDown className="w-3.5 h-3.5 text-[#FF788D]" />;
    }
  };

  // Severity color badge
  const getSeverityBadge = (severity: HealthInsightSeverity) => {
    switch (severity) {
      case "elevated":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "notable":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "subtle":
      default:
        return "bg-[#FFDADA]/60 text-[#D9455D] border-[#FF788D]/30";
    }
  };

  return (
    <>
      {/* 1. SUBTLE NON-INTRUSIVE HEADER PILL VARIANT */}
      {variant === "header-pill" && (
        <div className={`flex items-center gap-1 ${className}`}>
          <button
            onClick={() => setIsOpen(true)}
            className={`group flex items-center gap-2 pl-2.5 pr-2 py-1 sm:py-1.5 rounded-full border transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] ${
              activeAlert.severity === "elevated"
                ? "bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-900"
                : activeAlert.severity === "notable"
                ? "bg-[#FFF5F7] hover:bg-[#FFEDF1] border-[#FFDADA] text-[#2D2226]"
                : "bg-white hover:bg-[#FFF5F7] border-[#FFDADA] text-[#2D2226]"
            }`}
            title="Click to view 7-day health trend insight and recommendations"
          >
            {/* Pulsing indicator */}
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  activeAlert.severity === "elevated"
                    ? "bg-rose-400"
                    : activeAlert.severity === "notable"
                    ? "bg-[#FF788D]"
                    : "bg-emerald-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  activeAlert.severity === "elevated"
                    ? "bg-rose-500"
                    : activeAlert.severity === "notable"
                    ? "bg-[#FF788D]"
                    : "bg-emerald-500"
                }`}
              />
            </span>

            {/* Icon */}
            <span className="shrink-0">{getAlertIcon(activeAlert.type, activeAlert.severity)}</span>

            {/* Summary Label */}
            <div className="flex items-center gap-1 text-xs font-semibold">
              <span className="text-[#FF788D] hidden md:inline font-bold">Insight:</span>
              <span className="truncate max-w-[130px] sm:max-w-[210px] lg:max-w-[260px] text-[#2D2226]">
                {activeAlert.type === "sleep_drop"
                  ? `Sleep dropping (${activeAlert.changeMetric.description})`
                  : activeAlert.title}
              </span>
            </div>

            {/* View Pill Badge */}
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/90 text-[#D9455D] border border-[#FFDADA] shrink-0 group-hover:bg-[#FF788D] group-hover:text-white transition-colors">
              View
            </span>
          </button>

          {/* Quick Snooze Button */}
          <button
            onClick={handleSnooze}
            title="Dismiss trend alert for today"
            className="p-1 text-[#8E7A81] hover:text-[#2D2226] hover:bg-[#FFF5F7] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. BANNER CARD VARIANT (For Dashboard View Integration) */}
      {variant === "banner-card" && (
        <div
          onClick={() => setIsOpen(true)}
          className={`w-full p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs group ${
            activeAlert.severity === "elevated"
              ? "bg-gradient-to-r from-rose-50/90 via-white to-[#FFF5F7] border-rose-200 hover:border-rose-300"
              : "bg-gradient-to-r from-[#FFF5F7] via-white to-[#FFF9FA] border-[#FFDADA] hover:border-[#FF788D]/40"
          } ${className}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  activeAlert.severity === "elevated"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-[#FFDADA] text-[#D9455D]"
                }`}
              >
                {getAlertIcon(activeAlert.type, activeAlert.severity)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF788D]">
                    Real-Time 7-Day Trend
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                      activeAlert.severity
                    )}`}
                  >
                    {activeAlert.severity.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-[#8E7A81] font-medium hidden sm:inline">
                    {activeAlert.confidenceScore}% confidence
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#2D2226] mt-0.5 group-hover:text-[#D9455D] transition-colors">
                  {activeAlert.title}
                </h4>
                <p className="text-xs text-[#735E65] mt-0.5 line-clamp-1">{activeAlert.summary}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              <div className="text-right hidden md:block">
                <span className="text-xs font-bold text-[#2D2226]">
                  {activeAlert.changeMetric.description}
                </span>
                <p className="text-[10px] text-[#8E7A81]">7-Day Trajectory</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#FF788D] text-white text-xs font-bold flex items-center gap-1 shadow-2xs group-hover:bg-[#E85C71] transition-all">
                <span>Analyze</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE 7-DAY HEALTH INSIGHTS MODAL / DETAIL DRAWER */}
      {isOpen && activeAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#FFDADA] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#FFDADA] bg-gradient-to-b from-[#FFF5F7] to-white flex items-start justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs shrink-0 ${
                    activeAlert.severity === "elevated"
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : "bg-[#FFDADA] text-[#D9455D] border border-[#FF788D]/30"
                  }`}
                >
                  {getAlertIcon(activeAlert.type, activeAlert.severity)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF788D] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      7-Day Health Insights Engine
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                        activeAlert.severity
                      )}`}
                    >
                      {activeAlert.severity.toUpperCase()} ALERT
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-[#2D2226] mt-0.5">
                    {activeAlert.title}
                  </h3>
                  <p className="text-xs text-[#735E65]">{activeAlert.subtitle}</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-[#8E7A81] hover:text-[#2D2226] hover:bg-[#FFF5F7] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alert Switcher if multiple trends exist */}
            {alerts.length > 1 && (
              <div className="px-6 py-2.5 bg-[#FFF9FA] border-b border-[#FFDADA] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[11px] font-bold text-[#8E7A81] uppercase tracking-wider shrink-0">
                  Detected ({alerts.length}):
                </span>
                {alerts.map((alt, idx) => (
                  <button
                    key={alt.id}
                    onClick={() => setSelectedAlertIndex(idx)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      selectedAlertIndex === idx
                        ? "bg-[#FF788D] text-white border-[#FF788D] shadow-2xs font-bold"
                        : "bg-white text-[#735E65] border-[#FFDADA] hover:bg-[#FFF5F7]"
                    }`}
                  >
                    <span>{alt.title}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 no-scrollbar">
              {/* 1. VISUAL 7-DAY SPARKLINE / BAR TREND GRAPH */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF9FA] border border-[#FFDADA] space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E7A81]">
                      7-Day Longitudinal Trajectory
                    </span>
                    <div className="text-sm font-bold text-[#2D2226]">
                      {activeAlert.detectedMetric}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        activeAlert.changeMetric.direction === "down"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : activeAlert.changeMetric.direction === "up"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {activeAlert.changeMetric.description}
                    </span>
                  </div>
                </div>

                {/* Day-by-Day Visual Bar Columns */}
                <div className="pt-2">
                  <div className="grid grid-cols-7 gap-2 items-end h-28 border-b border-[#FFDADA] pb-2">
                    {activeAlert.history7Days.map((point, i) => {
                      // Normalize bar height based on metric
                      let maxVal = 10;
                      if (activeAlert.type === "sleep_drop") maxVal = 9.0;
                      if (activeAlert.type === "hydration_deficit") maxVal = 10;
                      if (activeAlert.type === "headache_cluster") maxVal = 5;

                      const heightPercent = Math.min(100, Math.max(15, (point.value / maxVal) * 100));

                      const isDropping =
                        i > 0 && point.value < activeAlert.history7Days[i - 1].value;

                      return (
                        <div key={point.date} className="flex flex-col items-center gap-1 h-full justify-end group">
                          {/* Value Tag on Hover/Active */}
                          <span
                            className={`text-[10px] font-bold transition-all ${
                              point.isToday
                                ? "text-[#D9455D] scale-105"
                                : "text-[#8E7A81] group-hover:text-[#2D2226]"
                            }`}
                          >
                            {point.value}
                            <span className="text-[9px] font-normal">{point.unit || ""}</span>
                          </span>

                          {/* Bar */}
                          <div className="w-full bg-[#FFDADA]/40 rounded-t-lg overflow-hidden h-full flex items-end">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full rounded-t-lg transition-all duration-500 ${
                                point.isToday
                                  ? "bg-gradient-to-t from-[#E85C71] to-[#FF788D] shadow-2xs"
                                  : isDropping
                                  ? "bg-gradient-to-t from-rose-300 to-rose-200"
                                  : "bg-gradient-to-t from-[#FFDADA] to-[#FFEDF1]"
                              }`}
                            />
                          </div>

                          {/* Day Label */}
                          <span
                            className={`text-[10px] ${
                              point.isToday
                                ? "font-bold text-[#D9455D]"
                                : "font-medium text-[#8E7A81]"
                            }`}
                          >
                            {point.isToday ? "Today" : point.dayLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-1.5 text-[10px] text-[#8E7A81]">
                    <span>7 Days Ago</span>
                    <span className="font-semibold text-[#D9455D]">Real-Time Active Baseline</span>
                  </div>
                </div>
              </div>

              {/* 2. DETAILED ANALYSIS & BIOLOGICAL ROOT CAUSE */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-[#FFDADA] shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2D2226]">
                    <Activity className="w-4 h-4 text-[#FF788D]" />
                    <span>Clinical Pattern Analysis</span>
                  </div>
                  <p className="text-xs text-[#735E65] leading-relaxed">
                    {activeAlert.detailedAnalysis}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF5F7] border border-[#FFDADA] space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#D9455D]">
                    <ShieldCheck className="w-4 h-4 text-[#FF788D]" />
                    <span>Biological & Hormonal Context</span>
                  </div>
                  <p className="text-xs text-[#735E65] leading-relaxed">
                    {activeAlert.biologicalContext}
                  </p>
                </div>
              </div>

              {/* 3. EVIDENCE-BASED ACTION ITEMS */}
              <div className="p-4 rounded-2xl bg-white border border-[#FFDADA] shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2D2226]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Recommended Support Protocol</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#8E7A81]">
                    Tap to check off
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {activeAlert.actionItems.map((item, idx) => {
                    const isChecked = checkedActions[`${activeAlert.id}_${idx}`] || false;
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleAction(`${activeAlert.id}_${idx}`)}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isChecked
                            ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                            : "bg-[#FFF9FA] hover:bg-[#FFF5F7] border-[#FFDADA] text-[#2D2226]"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-[#FFDADA] bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-xs leading-snug ${
                            isChecked ? "line-through opacity-75 font-normal" : "font-medium"
                          }`}
                        >
                          {item}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. INTERACTIVE SCENARIO SIMULATOR (To test trends) */}
              <div className="p-3.5 rounded-2xl bg-[#FFF5F7]/80 border border-[#FFDADA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E7A81] flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-[#FF788D]" />
                    Test 7-Day Trend Scenarios:
                  </span>
                  {simulationPreset && (
                    <button
                      onClick={() => setSimulationPreset(null)}
                      className="text-[10px] font-bold text-[#D9455D] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Reset to Live Logs
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                  <button
                    onClick={() => setSimulationPreset("sleep_drop")}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer truncate ${
                      simulationPreset === "sleep_drop"
                        ? "bg-[#FF788D] text-white border-[#FF788D] shadow-2xs font-bold"
                        : "bg-white text-[#735E65] border-[#FFDADA] hover:bg-[#FFF5F7]"
                    }`}
                  >
                    🌙 Sleep Drop (-2.6h)
                  </button>

                  <button
                    onClick={() => setSimulationPreset("hydration_deficit")}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer truncate ${
                      simulationPreset === "hydration_deficit"
                        ? "bg-sky-600 text-white border-sky-600 shadow-2xs font-bold"
                        : "bg-white text-[#735E65] border-[#FFDADA] hover:bg-[#FFF5F7]"
                    }`}
                  >
                    💧 Hydration Deficit
                  </button>

                  <button
                    onClick={() => setSimulationPreset("headache_cluster")}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer truncate ${
                      simulationPreset === "headache_cluster"
                        ? "bg-rose-600 text-white border-rose-600 shadow-2xs font-bold"
                        : "bg-white text-[#735E65] border-[#FFDADA] hover:bg-[#FFF5F7]"
                    }`}
                  >
                    ⚡ Headache Surge
                  </button>

                  <button
                    onClick={() => setSimulationPreset("optimal_vitality")}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer truncate ${
                      simulationPreset === "optimal_vitality"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold"
                        : "bg-white text-[#735E65] border-[#FFDADA] hover:bg-[#FFF5F7]"
                    }`}
                  >
                    ✨ Optimal Vitality
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-[#FFDADA] bg-[#FFF9FA] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                onClick={handleAddToBrief}
                disabled={isBriefAdded}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                {isBriefAdded ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Added to Doctor Brief!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-[#FF788D]" />
                    <span>Include in Doctor Brief</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onOpenTrack) onOpenTrack();
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white hover:bg-[#FFF5F7] text-[#735E65] border border-[#FFDADA] text-xs font-medium transition-colors cursor-pointer text-center"
                >
                  Log Daily Data
                </button>

                <button
                  onClick={handleAskCopilot}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#FF788D] hover:bg-[#E85C71] active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Copilot</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
