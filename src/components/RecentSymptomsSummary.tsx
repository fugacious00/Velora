import React, { useMemo } from "react";
import { useHealth } from "../context/HealthContext";
import {
  Activity,
  Heart,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Plus,
  Flame,
  CheckCircle2,
  Smile,
  ShieldAlert,
} from "lucide-react";

interface RecentSymptomsSummaryProps {
  onOpenTrack?: () => void;
  onOpenCopilot?: (initialQuery?: string) => void;
}

export interface ExtractedSymptom {
  id: string;
  name: string;
  severityLabel: string;
  severityScore?: number;
  severityLevel: "mild" | "moderate" | "high" | "info";
  date: string;
  displayDate: string;
  isToday: boolean;
  category: string;
  iconType: "headache" | "cramps" | "bloating" | "breast" | "skin" | "flash" | "pelvic" | "flow" | "general";
  notes?: string;
}

export const RecentSymptomsSummary: React.FC<RecentSymptomsSummaryProps> = ({
  onOpenTrack,
  onOpenCopilot,
}) => {
  const { todayLog, dailyLogs, timeline, activeLifeStage, formatTerm } = useHealth();

  // Extract the chronological list of all logged symptoms and take the top 3
  const recentSymptoms = useMemo<ExtractedSymptom[]>(() => {
    const list: ExtractedSymptom[] = [];

    // 1. Combine today's log and historical dailyLogs
    // Map by date to avoid duplicates, with todayLog taking priority
    const allLogsMap = new Map<string, typeof todayLog>();
    dailyLogs.forEach((log) => {
      if (log.date) allLogsMap.set(log.date, log);
    });
    if (todayLog.date) {
      allLogsMap.set(todayLog.date, todayLog);
    } else {
      allLogsMap.set("2026-08-21", todayLog);
    }

    // Sort descending by date (newest first)
    const sortedLogs = Array.from(allLogsMap.values()).sort((a, b) => {
      const dateA = a.date || "2026-08-21";
      const dateB = b.date || "2026-08-21";
      return dateB.localeCompare(dateA);
    });

    // Reference today date string for labels
    const todayDateStr = todayLog.date || "2026-08-21";

    // Helper to format date label
    const formatDisplayDate = (dateStr: string) => {
      if (dateStr === todayDateStr) return "Today";
      const d = new Date(dateStr + "T12:00:00Z");
      const today = new Date(todayDateStr + "T12:00:00Z");
      const diffDays = Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "Yesterday";
      if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Extract symptoms from logs in order
    sortedLogs.forEach((log) => {
      const dateStr = log.date || "2026-08-21";
      const isToday = dateStr === todayDateStr;
      const displayDate = formatDisplayDate(dateStr);

      // Headache
      if ((log.headacheSeverity || 0) > 0) {
        const sev = log.headacheSeverity;
        list.push({
          id: `headache_${dateStr}`,
          name: "Tension Headache",
          severityLabel: `${sev}/5 ${sev >= 4 ? "Severe" : sev >= 3 ? "Moderate" : "Mild"}`,
          severityScore: sev,
          severityLevel: sev >= 4 ? "high" : sev >= 3 ? "moderate" : "mild",
          date: dateStr,
          displayDate,
          isToday,
          category: "Neurological & Tension",
          iconType: "headache",
          notes: log.notes,
        });
      }

      // Cramps
      if ((log.crampsSeverity || 0) > 0) {
        const sev = log.crampsSeverity;
        list.push({
          id: `cramps_${dateStr}`,
          name: formatTerm("Uterine & Pelvic Cramps", "Abdominal Cramps"),
          severityLabel: `${sev}/5 ${sev >= 4 ? "Intense" : sev >= 3 ? "Moderate" : "Mild"}`,
          severityScore: sev,
          severityLevel: sev >= 4 ? "high" : sev >= 3 ? "moderate" : "mild",
          date: dateStr,
          displayDate,
          isToday,
          category: "Pelvic & Smooth Muscle",
          iconType: "cramps",
          notes: log.notes,
        });
      }

      // Bloating
      if (log.bloating) {
        list.push({
          id: `bloating_${dateStr}`,
          name: "Abdominal Bloating & Water Retention",
          severityLabel: "Logged Present",
          severityScore: 2,
          severityLevel: "mild",
          date: dateStr,
          displayDate,
          isToday,
          category: "Digestive & Fluid Balance",
          iconType: "bloating",
          notes: log.notes,
        });
      }

      // Breast tenderness
      if (log.breastTenderness) {
        list.push({
          id: `breast_${dateStr}`,
          name: "Breast Tenderness & Sensitivity",
          severityLabel: "Logged Present",
          severityScore: 2,
          severityLevel: "mild",
          date: dateStr,
          displayDate,
          isToday,
          category: "Hormonal Sensitivity",
          iconType: "breast",
        });
      }

      // Acne
      if (log.acne) {
        list.push({
          id: `acne_${dateStr}`,
          name: "Hormonal Breakouts & Skin Sensitivity",
          severityLabel: "Logged Present",
          severityScore: 2,
          severityLevel: "mild",
          date: dateStr,
          displayDate,
          isToday,
          category: "Dermatological",
          iconType: "skin",
        });
      }

      // Hot flashes
      if (log.hotFlashesCount && log.hotFlashesCount > 0) {
        list.push({
          id: `flash_${dateStr}`,
          name: "Vasomotor Hot Flashes",
          severityLabel: `${log.hotFlashesCount} episodes logged`,
          severityScore: 3,
          severityLevel: "moderate",
          date: dateStr,
          displayDate,
          isToday,
          category: "Thermoregulation",
          iconType: "flash",
        });
      }

      // Postpartum pain
      if (log.postpartumRecovery && log.postpartumRecovery.painScore > 0) {
        const pScore = log.postpartumRecovery.painScore;
        list.push({
          id: `postpartum_pain_${dateStr}`,
          name: "Postpartum Pelvic / Perineal Discomfort",
          severityLabel: `${pScore}/5 ${pScore >= 4 ? "Severe" : pScore >= 3 ? "Moderate" : "Mild"}`,
          severityScore: pScore,
          severityLevel: pScore >= 4 ? "high" : pScore >= 3 ? "moderate" : "mild",
          date: dateStr,
          displayDate,
          isToday,
          category: "Postpartum Recovery",
          iconType: "pelvic",
        });
      }

      // Flow (if spotting or heavy)
      if (log.flow && log.flow !== "none") {
        list.push({
          id: `flow_${dateStr}`,
          name: `${log.flow.charAt(0).toUpperCase() + log.flow.slice(1)} Flow Bleeding`,
          severityLabel: `${log.flow} flow`,
          severityScore: log.flow === "heavy" ? 4 : log.flow === "medium" ? 3 : 2,
          severityLevel: log.flow === "heavy" ? "high" : "mild",
          date: dateStr,
          displayDate,
          isToday,
          category: "Menstrual Cycle",
          iconType: "flow",
        });
      }
    });

    // 2. Also check timeline events with category === 'symptom' that might not already be captured
    timeline
      .filter((evt) => evt.category === "symptom")
      .forEach((evt) => {
        const dateStr = evt.date;
        const isToday = dateStr === todayDateStr;
        const exists = list.some((s) => s.date === dateStr && s.name.toLowerCase().includes(evt.title.toLowerCase().split(" ")[0]));
        if (!exists) {
          list.push({
            id: `timeline_${evt.id}`,
            name: evt.title,
            severityLabel: evt.subtitle || "Recorded event",
            severityLevel: evt.severity === "urgent" ? "high" : evt.severity === "notable" ? "moderate" : "mild",
            date: dateStr,
            displayDate: formatDisplayDate(dateStr),
            isToday,
            category: "Tracked Symptom",
            iconType: "general",
            notes: evt.details,
          });
        }
      });

    // Take the last 3 symptoms logged
    return list.slice(0, 3);
  }, [todayLog, dailyLogs, timeline, formatTerm]);

  // Color & Badge style mapper
  const getBadgeStyle = (level: "mild" | "moderate" | "high" | "info") => {
    switch (level) {
      case "high":
        return "bg-[#FFF0F3] text-[#D9455D] border-[#FF788D]";
      case "moderate":
        return "bg-[#FFF7ED] text-[#EA580C] border-[#FDBA74]";
      case "mild":
      default:
        return "bg-[#FFF5F7] text-[#D9455D] border-[#FFDADA]";
    }
  };

  return (
    <div
      id="recent-symptoms-card"
      className="bg-white rounded-2xl p-6 border border-[#FFDADA] shadow-xs space-y-4 transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#FFDADA] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FFF0F3] text-[#D9455D] border border-[#FFD3DC]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[#2D2226]">
                Recent Symptoms
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA]">
                Last 3 Logged
              </span>
            </div>
            <p className="text-xs text-[#8E7A81] mt-0.5">
              Symptom trends and intensity history from your daily health records
            </p>
          </div>
        </div>

        {onOpenTrack && (
          <button
            type="button"
            onClick={onOpenTrack}
            className="text-xs font-semibold text-[#D9455D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Log Symptom</span>
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content List */}
      {recentSymptoms.length > 0 ? (
        <div className="space-y-2.5">
          {recentSymptoms.map((symptom, idx) => (
            <div
              key={symptom.id || idx}
              className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] hover:border-[#FFB7C3] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Left Details */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-white border border-[#FFDADA] text-[#FF788D] shrink-0 mt-0.5 group-hover:scale-105 transition-transform shadow-2xs">
                  {symptom.iconType === "flash" ? (
                    <Flame className="w-4 h-4 text-[#EA580C]" />
                  ) : symptom.iconType === "headache" ? (
                    <AlertCircle className="w-4 h-4 text-[#D9455D]" />
                  ) : (
                    <Heart className="w-4 h-4 text-[#FF788D]" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-[#2D2226] truncate">
                      {symptom.name}
                    </h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.2 rounded-md border ${getBadgeStyle(
                        symptom.severityLevel
                      )}`}
                    >
                      {symptom.severityLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#8E7A81] mt-1">
                    <span className="flex items-center gap-1 font-medium text-[#735E65]">
                      <Clock className="w-3 h-3 text-[#FF788D]" />
                      <span>{symptom.displayDate}</span>
                    </span>
                    <span>·</span>
                    <span className="truncate">{symptom.category}</span>
                  </div>

                  {symptom.notes && (
                    <p className="text-[11px] text-[#735E65] italic mt-1 bg-white/70 px-2 py-1 rounded border border-[#FFDADA]/60 line-clamp-1">
                      "{symptom.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Right Quick Action */}
              {onOpenCopilot && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenCopilot(
                      `I recently logged ${symptom.name} (${symptom.severityLabel}) on ${symptom.displayDate}. What gentle physiological insights or non-diagnostic relief practices can you recommend?`
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#FFF0F3] border border-[#FFDADA] hover:border-[#FF788D] text-xs font-semibold text-[#D9455D] transition-colors shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer self-end sm:self-auto"
                  title="Ask Velora Health Copilot about this symptom"
                >
                  <Sparkles className="w-3 h-3 text-[#FF788D]" />
                  <span>Ask Copilot</span>
                  <ChevronRight className="w-3 h-3 text-[#8E7A81]" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-6 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-white border border-[#FFDADA] text-[#16A34A] mx-auto flex items-center justify-center shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-[#2D2226]">
            No Active Symptoms Logged
          </p>
          <p className="text-xs text-[#8E7A81] max-w-sm mx-auto">
            You currently have zero severe or moderate symptoms recorded in your recent daily logs.
          </p>
          {onOpenTrack && (
            <button
              type="button"
              onClick={onOpenTrack}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF788D] hover:bg-[#E85C71] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Daily Symptoms</span>
            </button>
          )}
        </div>
      )}

      {/* Footer Insight */}
      <div className="pt-2 border-t border-[#FFDADA] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#8E7A81]">
          Symptom logs inform your Body Pattern Engine™ & Doctor Brief.
        </span>
        {onOpenTrack && (
          <button
            type="button"
            onClick={onOpenTrack}
            className="text-xs font-bold text-[#D9455D] hover:underline cursor-pointer"
          >
            View All in Tracker →
          </button>
        )}
      </div>
    </div>
  );
};
