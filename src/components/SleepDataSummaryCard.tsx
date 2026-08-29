import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  Moon,
  Sparkles,
  Bed,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  ChevronRight,
  Info,
  Star,
  Zap,
} from "lucide-react";
import { DailyHealthLog, LifeStage } from "../types";

interface SleepDataSummaryCardProps {
  logs: DailyHealthLog[];
  todayLog: DailyHealthLog;
  activeLifeStage: LifeStage;
  onSaveDailyLog?: (log: Partial<DailyHealthLog>) => void;
  onOpenTrack?: () => void;
  onOpenCopilot?: (initialQuery?: string) => void;
}

export const SleepDataSummaryCard: React.FC<SleepDataSummaryCardProps> = ({
  logs,
  todayLog,
  activeLifeStage,
  onSaveDailyLog,
  onOpenTrack,
  onOpenCopilot,
}) => {
  const [showQuickLog, setShowQuickLog] = useState(false);

  // Recommended sleep target based on life stage
  const targetHours =
    activeLifeStage === "pregnant" || activeLifeStage === "postpartum"
      ? 8.5
      : activeLifeStage === "teen"
      ? 9.0
      : 8.0;

  // Build sequential 7-day sleep dataset
  const weekSleepData = useMemo(() => {
    const baseDate = new Date("2026-08-21T12:00:00Z");
    const logsByDate = new Map<string, DailyHealthLog>();

    logs.forEach((l) => {
      if (l.date) logsByDate.set(l.date, l);
    });
    if (todayLog.date) {
      logsByDate.set(todayLog.date, todayLog);
    } else {
      logsByDate.set("2026-08-21", todayLog);
    }

    const fallbackHours = [7.8, 8.0, 7.5, 6.5, 6.0, 7.2, todayLog.sleepHours || 7.5];
    const fallbackQualities: ("restful" | "average" | "disturbed")[] = [
      "restful",
      "restful",
      "restful",
      "average",
      "disturbed",
      "average",
      (todayLog.sleepQuality as any) || "restful",
    ];

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const isToday = i === 0;

      const log = logsByDate.get(dateStr);
      const hours = isToday
        ? todayLog.sleepHours ?? fallbackHours[6]
        : log?.sleepHours ?? fallbackHours[6 - i];

      const quality = isToday
        ? todayLog.sleepQuality ?? fallbackQualities[6]
        : (log?.sleepQuality as any) ?? fallbackQualities[6 - i];

      const rating = isToday
        ? todayLog.sleepRating ?? (quality === "restful" ? 5 : quality === "average" ? 3 : 2)
        : log?.sleepRating ?? (quality === "restful" ? 5 : quality === "average" ? 3 : 2);

      const metTarget = hours >= targetHours - 0.5; // within 30 min of target

      result.push({
        date: dateStr,
        weekday,
        monthDay,
        isToday,
        hours: Number(hours.toFixed(1)),
        quality,
        rating,
        metTarget,
        targetHours,
      });
    }

    return result;
  }, [logs, todayLog, targetHours]);

  // Aggregate Metrics
  const totalSleepHours = weekSleepData.reduce((acc, curr) => acc + curr.hours, 0);
  const avgSleepHours = parseFloat((totalSleepHours / weekSleepData.length).toFixed(1));
  const restfulNightsCount = weekSleepData.filter(
    (d) => d.quality === "restful" || d.quality === "excellent"
  ).length;

  const currentHours = todayLog.sleepHours || 7.5;
  const currentQuality = todayLog.sleepQuality || "restful";
  const currentRating = todayLog.sleepRating || (currentQuality === "restful" ? 4 : currentQuality === "average" ? 3 : 2);

  // Quality label mapping
  const getQualityBadge = (q: string) => {
    switch (q) {
      case "excellent":
      case "restful":
        return {
          label: "Restful & Deep",
          bg: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
          stars: 5,
        };
      case "average":
        return {
          label: "Average / Fair",
          bg: "bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]",
          stars: 3,
        };
      case "disturbed":
      case "poor":
      default:
        return {
          label: "Disturbed / Broken",
          bg: "bg-[#FFF0F3] text-[#D9455D] border-[#FFD3DC]",
          stars: 2,
        };
    }
  };

  const qualityInfo = getQualityBadge(currentQuality);

  // Life-stage tailored sleep insight
  const getStageSleepInsight = () => {
    switch (activeLifeStage) {
      case "cycle_hormonal":
        return "Mid-to-late luteal progesterone shifts can raise core body temperature by 0.5°F, causing lighter REM sleep. Keeping the bedroom at 66–68°F promotes deep slow-wave rest.";
      case "pregnant":
        return "During the second trimester, left-side sleeping with a supportive pelvic pillow enhances maternal and uterine circulation while easing lower back pressure.";
      case "postpartum":
        return "Fragmented sleep cycles are biologically expected. Aim for non-linear daytime naps (20-30 mins) to support oxytocin release and hormonal recovery.";
      case "perimenopause":
      case "menopause":
        return "Fluctuating estrogen can trigger nighttime vasomotor symptoms. Magnesium glycinate and moisture-wicking breathable linens significantly reduce night awakenings.";
      case "ttc":
        return "Consistent 7.5–8.5 hours of dark circadian sleep regulates melatonin, a key antioxidant directly protecting follicular and oocyte quality.";
      default:
        return "Circadian rhythm consistency supports balanced cortisol awakening responses and steady daytime mental stamina.";
    }
  };

  const handleAdjustHours = (delta: number) => {
    if (!onSaveDailyLog) return;
    const newHours = Math.max(1, Math.min(14, parseFloat((currentHours + delta).toFixed(1))));
    onSaveDailyLog({ sleepHours: newHours });
  };

  const handleSetQuality = (quality: "restful" | "average" | "disturbed") => {
    if (!onSaveDailyLog) return;
    const rating = quality === "restful" ? 5 : quality === "average" ? 3 : 2;
    onSaveDailyLog({ sleepQuality: quality, sleepRating: rating });
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;

    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#FFDADA] shadow-lg text-xs space-y-1.5 z-50">
        <div className="flex items-center justify-between border-b border-[#FFDADA] pb-1 gap-4">
          <span className="font-bold text-[#2D2226]">
            {data.weekday}, {data.monthDay}
          </span>
          {data.isToday && (
            <span className="px-1.5 py-0.2 bg-[#FF788D] text-white rounded text-[9px] font-bold">
              Today
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#735E65]">Duration:</span>
          <span className="font-bold text-[#2D2226]">{data.hours} hours</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#735E65]">Quality:</span>
          <span className="font-semibold text-[#D9455D] capitalize">{data.quality}</span>
        </div>
        <div className="text-[10px] text-[#8E7A81] pt-1 border-t border-[#FFF5F7]">
          Target: {targetHours} hrs ({data.metTarget ? "✓ Reached" : "Below target"})
        </div>
      </div>
    );
  };

  return (
    <div
      id="sleep-data-summary-card"
      className="bg-white rounded-2xl p-6 border border-[#FFDADA] shadow-xs space-y-5 transition-all relative overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FFF0F3] via-[#FFF8FA] to-transparent rounded-bl-full pointer-events-none -z-0" />

      {/* 1. Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FFDADA] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FFF0F3] text-[#FF788D] border border-[#FFD3DC] shrink-0">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[#2D2226]">
                Sleep & Restorative Recovery
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA]">
                Daily Vitals
              </span>
            </div>
            <p className="text-xs text-[#8E7A81] mt-0.5">
              Circadian rhythm tracking and restorative sleep architecture
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowQuickLog(!showQuickLog)}
            className="px-3 py-1.5 rounded-xl bg-[#FFF5F7] hover:bg-[#FFE5E9] text-[#D9455D] text-xs font-semibold border border-[#FFDADA] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{showQuickLog ? "Hide Quick Log" : "Quick Adjust"}</span>
          </button>
          {onOpenTrack && (
            <button
              type="button"
              onClick={onOpenTrack}
              className="px-3 py-1.5 rounded-xl bg-[#FF788D] hover:bg-[#E85C71] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Full Log</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Log Interactive Panel (Expanded if toggled) */}
      {showQuickLog && (
        <div className="p-4 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] space-y-3 animate-in fade-in zoom-in-98">
          <div className="flex items-center justify-between text-xs font-semibold text-[#2D2226]">
            <span className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-[#FF788D]" />
              <span>Update Today's Sleep Duration & Quality</span>
            </span>
            <span className="text-[#D9455D] font-bold">{currentHours} hrs</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Duration Stepper Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#735E65]">Duration:</span>
              <button
                type="button"
                onClick={() => handleAdjustHours(-0.5)}
                className="w-8 h-8 rounded-lg bg-white border border-[#FFDADA] hover:border-[#FF788D] text-[#2D2226] font-bold flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Minus 30 minutes"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1 bg-white rounded-lg border border-[#FFDADA] text-xs font-bold text-[#2D2226]">
                {currentHours}h
              </span>
              <button
                type="button"
                onClick={() => handleAdjustHours(0.5)}
                className="w-8 h-8 rounded-lg bg-white border border-[#FFDADA] hover:border-[#FF788D] text-[#2D2226] font-bold flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Plus 30 minutes"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quality Selectors */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#735E65]">Quality:</span>
              {(["restful", "average", "disturbed"] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSetQuality(q)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border capitalize transition-all cursor-pointer ${
                    currentQuality === q
                      ? "bg-[#FF788D] text-white border-[#FF788D] shadow-2xs"
                      : "bg-white text-[#735E65] border-[#FFDADA] hover:bg-[#FFF0F3]"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Today's Sleep Highlight & 7-Day Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Today's / Last Night's Sleep */}
        <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#FFDADA] flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-medium text-[#8E7A81] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#FF788D]" />
              <span>Last Night's Sleep</span>
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2226]">
                {currentHours}
              </span>
              <span className="text-xs font-medium text-[#735E65]">
                hours ({Math.floor(currentHours)}h {Math.round((currentHours % 1) * 60)}m)
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-[#735E65] mb-1">
              <span>Goal: {targetHours}h</span>
              <span className="font-semibold text-[#D9455D]">
                {Math.round((currentHours / targetHours) * 100)}% of Target
              </span>
            </div>
            <div className="w-full bg-[#FFDADA] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#FF788D] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((currentHours / targetHours) * 100))}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#FFDADA]/60">
            <span className="text-xs text-[#735E65]">Quality:</span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${qualityInfo.bg}`}
            >
              {qualityInfo.label}
            </span>
          </div>
        </div>

        {/* Card 2: 7-Day Consistency Metrics */}
        <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#FFDADA] flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-medium text-[#8E7A81] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#FF788D]" />
              <span>7-Day Sleep Rhythm</span>
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2226]">
                {avgSleepHours}
              </span>
              <span className="text-xs font-medium text-[#735E65]">hrs/night avg</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-[#735E65]">
            <div className="flex items-center justify-between">
              <span>Restful Nights:</span>
              <span className="font-bold text-[#16A34A]">{restfulNightsCount} / 7 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Circadian Stability:</span>
              <span className="font-bold text-[#D9455D]">
                {avgSleepHours >= targetHours - 0.5 ? "Optimal" : "Mild Deficit"}
              </span>
            </div>
          </div>

          <div className="pt-1 border-t border-[#FFDADA]/60 text-[11px] text-[#8E7A81]">
            Target range: {targetHours - 0.5}–{targetHours + 1} hours for {activeLifeStage.replace("_", " ")}
          </div>
        </div>

        {/* Card 3: 7-Day Sleep Duration Mini-Chart */}
        <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#FFDADA] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8E7A81] mb-1">
            <span className="font-medium">7-Day Duration Pattern</span>
            <span className="text-[10px] text-[#D9455D] font-semibold">Target: {targetHours}h</span>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weekSleepData}
                margin={{ top: 8, right: 4, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="sleepBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF788D" />
                    <stop offset="100%" stopColor="#FFA4B2" />
                  </linearGradient>
                  <linearGradient id="sleepBarToday" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D9455D" />
                    <stop offset="100%" stopColor="#FF788D" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="weekday"
                  tickLine={false}
                  axisLine={{ stroke: "#FFDADA" }}
                  tick={{ fontSize: 10, fill: "#735E65" }}
                />
                <YAxis
                  domain={[0, 11]}
                  tickLine={false}
                  axisLine={{ stroke: "#FFDADA" }}
                  tick={{ fontSize: 9, fill: "#8E7A81" }}
                  ticks={[4, 8]}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={targetHours}
                  stroke="#FF788D"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={28}>
                  {weekSleepData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.isToday
                          ? "url(#sleepBarToday)"
                          : entry.quality === "disturbed"
                          ? "#FCA5A5"
                          : "url(#sleepBarGradient)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#8E7A81] pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FF788D]" />
              <span>Restful</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FCA5A5]" />
              <span>Disturbed</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 border-b border-dashed border-[#FF788D]" />
              <span>Target</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Physiological Stage-Specific Circadian Insight & Copilot CTA */}
      <div className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5 text-[#735E65] min-w-0">
          <Info className="w-4 h-4 text-[#FF788D] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#2D2226] font-semibold">Circadian Biology Note: </strong>
            {getStageSleepInsight()}
          </p>
        </div>

        {onOpenCopilot && (
          <button
            type="button"
            onClick={() =>
              onOpenCopilot(
                `Can you provide gentle, non-diagnostic sleep hygiene advice tailored to my current life stage (${activeLifeStage}) and last night's ${currentHours} hours of ${currentQuality} sleep?`
              )
            }
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#FFF0F3] border border-[#FFDADA] hover:border-[#FF788D] text-xs font-semibold text-[#D9455D] transition-colors shrink-0 flex items-center gap-1 cursor-pointer self-end sm:self-auto shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF788D]" />
            <span>Ask Copilot</span>
          </button>
        )}
      </div>
    </div>
  );
};
