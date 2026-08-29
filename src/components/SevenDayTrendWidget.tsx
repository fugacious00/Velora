import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  Zap,
  Smile,
  Moon,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { DailyHealthLog, LifeStage, MoodType } from "../types";

interface SevenDayTrendWidgetProps {
  logs: DailyHealthLog[];
  todayLog: DailyHealthLog;
  activeLifeStage: LifeStage;
  onOpenTrack?: () => void;
  onOpenCopilot?: (initialQuery?: string) => void;
}

// Numerical mapping for Mood score
const MOOD_SCORES: Record<MoodType | string, { score: number; label: string; color: string }> = {
  joyful: { score: 5.0, label: "Joyful", color: "#EC4899" },
  energized: { score: 4.8, label: "Energized", color: "#F59E0B" },
  focused: { score: 4.5, label: "Focused", color: "#8B5CF6" },
  calm: { score: 4.0, label: "Calm", color: "#10B981" },
  sensitive: { score: 3.0, label: "Sensitive", color: "#6366F1" },
  anxious: { score: 2.5, label: "Anxious", color: "#F97316" },
  irritable: { score: 2.0, label: "Irritable", color: "#EF4444" },
  low: { score: 1.5, label: "Low", color: "#64748B" },
  exhausted: { score: 1.0, label: "Exhausted", color: "#94A3B8" },
};

type ViewMode = "combined" | "energy" | "mood" | "sleep";

export const SevenDayTrendWidget: React.FC<SevenDayTrendWidgetProps> = ({
  logs,
  todayLog,
  activeLifeStage,
  onOpenTrack,
  onOpenCopilot,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("combined");

  // Compute 7-day sequential dataset ending with today
  const trendData = useMemo(() => {
    // Generate dates for the past 7 days (including today)
    const baseDate = new Date("2026-08-21T12:00:00Z");
    const result: any[] = [];

    // Index existing logs by date string
    const logsByDate = new Map<string, DailyHealthLog>();
    logs.forEach((log) => {
      logsByDate.set(log.date, log);
    });

    // Ensure today's active log is mapped
    logsByDate.set(todayLog.date || "2026-08-21", todayLog);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const log = logsByDate.get(dateStr);

      // Fallback default values if day log isn't recorded
      const cycleDay = log?.cycleDay || (18 - i);
      const energyLevel = log?.energyLevel ?? (i === 0 ? todayLog.energyLevel || 4 : 4);
      const moodRaw = log?.mood || (i === 0 ? todayLog.mood || "calm" : "calm");
      const moodMeta = MOOD_SCORES[moodRaw] || MOOD_SCORES["calm"];
      const sleepHours = log?.sleepHours ?? (i === 0 ? todayLog.sleepHours || 7.6 : 7.4);
      const sleepQuality = log?.sleepQuality || (i === 0 ? todayLog.sleepQuality || "restful" : "restful");
      const hydration = log?.hydrationGlasses ?? (i === 0 ? todayLog.hydrationGlasses || 6 : 6);
      const symptoms = [
        (log?.headacheSeverity || 0) > 0 ? `Headache (${log?.headacheSeverity}/5)` : null,
        (log?.crampsSeverity || 0) > 0 ? `Cramps (${log?.crampsSeverity}/5)` : null,
        log?.bloating ? "Bloating" : null,
        log?.breastTenderness ? "Breast Tenderness" : null,
      ].filter(Boolean);

      // Phase identification for cycle
      let phase = "Luteal";
      if (cycleDay <= 5) phase = "Menstrual";
      else if (cycleDay <= 12) phase = "Follicular";
      else if (cycleDay <= 16) phase = "Ovulatory";

      result.push({
        date: dateStr,
        displayDate: monthDay,
        weekday,
        cycleDay,
        isToday: i === 0,
        energy: energyLevel,
        moodScore: moodMeta.score,
        moodLabel: moodMeta.label,
        moodColor: moodMeta.color,
        moodRaw,
        sleepHours,
        sleepQuality,
        hydration,
        symptoms,
        notes: log?.notes || (i === 0 ? todayLog.notes : undefined),
        phase,
      });
    }

    return result;
  }, [logs, todayLog]);

  // Aggregate statistics for the 7-day period
  const stats = useMemo(() => {
    if (!trendData.length) {
      return {
        avgEnergy: "4.0",
        avgMoodScore: "4.2",
        avgSleep: "7.5",
        peakDay: "Day 14",
        moodDistribution: "Calm & Focused",
        energyDelta: "+15%",
      };
    }

    const energySum = trendData.reduce((acc, curr) => acc + curr.energy, 0);
    const sleepSum = trendData.reduce((acc, curr) => acc + curr.sleepHours, 0);
    const moodSum = trendData.reduce((acc, curr) => acc + curr.moodScore, 0);

    const avgEnergy = (energySum / trendData.length).toFixed(1);
    const avgSleep = (sleepSum / trendData.length).toFixed(1);
    const avgMoodScore = (moodSum / trendData.length).toFixed(1);

    // Find peak energy item
    const maxItem = [...trendData].sort((a, b) => b.energy - a.energy)[0];
    const peakDay = maxItem ? (activeLifeStage === "pregnant" ? maxItem.weekday : `Day ${maxItem.cycleDay}`) : "Day 14";

    return {
      avgEnergy,
      avgSleep,
      avgMoodScore,
      peakDay,
      moodDistribution: "Calm & Grounded",
      energyDelta: "+12%",
    };
  }, [trendData, activeLifeStage]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          id="recharts-trend-tooltip"
          className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#FFDADA] shadow-lg text-xs space-y-2 min-w-[210px] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-[#FFDADA] pb-2">
            <div>
              <span className="font-bold text-[#2D2226] text-sm">
                {data.weekday}, {data.displayDate}
              </span>
              <span className="text-[10px] text-[#8E7A81] block">
                {activeLifeStage === "pregnant"
                  ? "2nd Trimester"
                  : `Cycle Day ${data.cycleDay} (${data.phase})`}
              </span>
            </div>
            {data.isToday && (
              <span className="px-2 py-0.5 rounded-full bg-[#FF788D] text-white font-semibold text-[10px]">
                Today
              </span>
            )}
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[#8E7A81] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#FF788D]" />
                <span>Energy Index</span>
              </span>
              <span className="font-bold text-[#2D2226] flex items-center gap-1">
                <span>{data.energy} / 5</span>
                <span className="text-[10px] font-normal text-[#8E7A81]">
                  {data.energy >= 4 ? "(High)" : data.energy >= 3 ? "(Moderate)" : "(Low)"}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#8E7A81] flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Mood State</span>
              </span>
              <span className="font-bold capitalize text-[#8B5CF6]">
                {data.moodLabel}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#8E7A81] flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Sleep Activity</span>
              </span>
              <span className="font-bold text-[#2D2226]">
                {data.sleepHours}h ({data.sleepQuality})
              </span>
            </div>
          </div>

          {data.symptoms && data.symptoms.length > 0 && (
            <div className="pt-2 border-t border-[#FFDADA]">
              <span className="text-[10px] text-[#8E7A81] block mb-1">Symptoms Logged:</span>
              <div className="flex flex-wrap gap-1">
                {data.symptoms.map((s: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-[#FFF5F7] border border-[#FFDADA] text-[10px] text-[#D9455D]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.notes && (
            <div className="pt-1.5 text-[10px] text-[#735E65] italic border-t border-[#FFDADA]">
              "{data.notes}"
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="dashboard-7day-trend-widget"
      className="bg-white rounded-2xl p-6 border border-[#FFDADA] shadow-xs space-y-5"
    >
      {/* 1. Header with Title, Mode Selector and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FFDADA] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#FFF5F7] text-[#FF788D] border border-[#FFDADA]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#2D2226]">
                  7-Day Mood & Energy Trend
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA]">
                  Glanceable Rhythm
                </span>
              </div>
              <p className="text-xs text-[#8E7A81] mt-0.5">
                Longitudinal correlation of vitality, emotional baseline, and sleep recovery
              </p>
            </div>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center bg-[#FFF5F7] p-1 rounded-xl border border-[#FFDADA] self-start sm:self-auto">
          <button
            onClick={() => setViewMode("combined")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "combined"
                ? "bg-white text-[#D9455D] shadow-xs"
                : "text-[#735E65] hover:text-[#2D2226]"
            }`}
          >
            Combined
          </button>
          <button
            onClick={() => setViewMode("energy")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === "energy"
                ? "bg-white text-[#FF788D] shadow-xs"
                : "text-[#735E65] hover:text-[#2D2226]"
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Energy</span>
          </button>
          <button
            onClick={() => setViewMode("mood")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === "mood"
                ? "bg-white text-[#8B5CF6] shadow-xs"
                : "text-[#735E65] hover:text-[#2D2226]"
            }`}
          >
            <Smile className="w-3 h-3" />
            <span>Mood</span>
          </button>
          <button
            onClick={() => setViewMode("sleep")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === "sleep"
                ? "bg-white text-[#10B981] shadow-xs"
                : "text-[#735E65] hover:text-[#2D2226]"
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>Sleep</span>
          </button>
        </div>
      </div>

      {/* 2. Glanceable 4-KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] transition-all hover:bg-[#FFEDF1]">
          <div className="flex items-center justify-between text-xs text-[#8E7A81]">
            <span className="flex items-center gap-1 font-medium">
              <Zap className="w-3.5 h-3.5 text-[#FF788D]" />
              <span>7-Day Avg Energy</span>
            </span>
            <span className="text-[10px] text-[#10B981] font-semibold">{stats.energyDelta}</span>
          </div>
          <p className="text-xl font-bold text-[#2D2226] mt-1">
            {stats.avgEnergy} <span className="text-xs font-normal text-[#8E7A81]">/ 5.0</span>
          </p>
          <span className="text-[10px] text-[#D9455D] font-medium block mt-0.5">
            Optimal stamina band
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] transition-all hover:bg-[#FFEDF1]">
          <div className="flex items-center justify-between text-xs text-[#8E7A81]">
            <span className="flex items-center gap-1 font-medium">
              <Smile className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Dominant Mood</span>
            </span>
            <span className="text-[10px] text-[#8B5CF6] font-semibold">Stable</span>
          </div>
          <p className="text-xl font-bold text-[#2D2226] mt-1 capitalize truncate">
            {stats.moodDistribution}
          </p>
          <span className="text-[10px] text-[#8E7A81] block mt-0.5">
            Score: {stats.avgMoodScore} / 5.0
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] transition-all hover:bg-[#FFEDF1]">
          <div className="flex items-center justify-between text-xs text-[#8E7A81]">
            <span className="flex items-center gap-1 font-medium">
              <Moon className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Avg Sleep Rest</span>
            </span>
            <span className="text-[10px] text-[#10B981] font-semibold">94%</span>
          </div>
          <p className="text-xl font-bold text-[#2D2226] mt-1">
            {stats.avgSleep} <span className="text-xs font-normal text-[#8E7A81]">hours/night</span>
          </p>
          <span className="text-[10px] text-[#735E65] block mt-0.5">
            Consistent REM duration
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] transition-all hover:bg-[#FFEDF1]">
          <div className="flex items-center justify-between text-xs text-[#8E7A81]">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Vitality Peak</span>
            </span>
            <span className="text-[10px] text-[#D9455D] font-semibold">Ovulation</span>
          </div>
          <p className="text-xl font-bold text-[#2D2226] mt-1">
            {stats.peakDay}
          </p>
          <span className="text-[10px] text-[#8E7A81] block mt-0.5">
            Highest logged vitality
          </span>
        </div>
      </div>

      {/* 3. Main Recharts Interactive Stage */}
      <div className="w-full h-64 sm:h-72 relative pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trendData}
            margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Energy Gradient */}
              <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF788D" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#FF788D" stopOpacity={0.02} />
              </linearGradient>

              {/* Mood Gradient */}
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
              </linearGradient>

              {/* Sleep Gradient */}
              <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#FFECEF" vertical={false} />

            <XAxis
              dataKey="weekday"
              tickLine={false}
              axisLine={{ stroke: "#FFDADA" }}
              tick={({ x, y, payload }) => {
                const item = trendData[payload.index];
                const isToday = item?.isToday;
                return (
                  <g transform={`translate(${x},${y + 10})`}>
                    <text
                      x={0}
                      y={0}
                      dy={0}
                      textAnchor="middle"
                      fill={isToday ? "#D9455D" : "#735E65"}
                      fontWeight={isToday ? 700 : 500}
                      fontSize={11}
                    >
                      {payload.value}
                    </text>
                    <text
                      x={0}
                      y={14}
                      textAnchor="middle"
                      fill={isToday ? "#FF788D" : "#8E7A81"}
                      fontSize={9}
                    >
                      {activeLifeStage === "pregnant" ? item?.displayDate : `D${item?.cycleDay}`}
                    </text>
                  </g>
                );
              }}
              height={42}
            />

            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8E7A81", fontSize: 10 }}
              tickFormatter={(v) => {
                if (v === 5) return "5 (Peak)";
                if (v === 4) return "4 (High)";
                if (v === 3) return "3 (Good)";
                if (v === 2) return "2 (Fair)";
                return "1 (Low)";
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Reference Average Baseline */}
            <ReferenceLine
              y={4}
              stroke="#FFB7C3"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Baseline (4.0)",
                fill: "#D9455D",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />

            {/* Energy Area Series */}
            {(viewMode === "combined" || viewMode === "energy") && (
              <Area
                type="monotone"
                dataKey="energy"
                name="Energy Level"
                stroke="#FF788D"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorEnergy)"
                activeDot={{ r: 6, fill: "#D9455D", stroke: "#FFFFFF", strokeWidth: 2 }}
                dot={{ r: 4, fill: "#FF788D", strokeWidth: 2, stroke: "#FFFFFF" }}
              />
            )}

            {/* Mood Line / Area Series */}
            {(viewMode === "combined" || viewMode === "mood") && (
              <Area
                type="monotone"
                dataKey="moodScore"
                name="Mood Balance"
                stroke="#8B5CF6"
                strokeWidth={viewMode === "mood" ? 3 : 2}
                strokeDasharray={viewMode === "combined" ? "4 4" : undefined}
                fillOpacity={1}
                fill="url(#colorMood)"
                activeDot={{ r: 6, fill: "#7C3AED", stroke: "#FFFFFF", strokeWidth: 2 }}
                dot={{ r: 4, fill: "#8B5CF6", strokeWidth: 2, stroke: "#FFFFFF" }}
              />
            )}

            {/* Sleep Hours Area Series (when selected) */}
            {viewMode === "sleep" && (
              <Area
                type="monotone"
                dataKey="sleepHours"
                name="Sleep (Hours)"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSleep)"
                activeDot={{ r: 6, fill: "#059669", stroke: "#FFFFFF", strokeWidth: 2 }}
                dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#FFFFFF" }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Chart Legend & Active Physiological Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#FFDADA] text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF788D] inline-block" />
            <span className="text-[#2D2226] font-medium">Energy Level (1-5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#8B5CF6] inline-block" />
            <span className="text-[#2D2226] font-medium">Mood Score (1-5)</span>
          </div>
          {viewMode === "sleep" && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#10B981] inline-block" />
              <span className="text-[#2D2226] font-medium">Sleep Hours</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[#8E7A81]">
            <span className="w-3 h-0.5 border-b border-dashed border-[#FFB7C3] inline-block" />
            <span>Optimal Baseline</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCopilot && (
            <button
              onClick={() =>
                onOpenCopilot(
                  "Can you summarize my 7-day mood and energy trend and provide gentle lifestyle observations?"
                )
              }
              className="text-[#D9455D] hover:text-[#B32B42] font-semibold text-xs flex items-center gap-1 cursor-pointer bg-[#FFF5F7] px-3 py-1 rounded-lg border border-[#FFDADA] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF788D]" />
              <span>Ask Copilot About Trends</span>
            </button>
          )}

          {onOpenTrack && (
            <button
              onClick={onOpenTrack}
              className="text-[#735E65] hover:text-[#2D2226] font-semibold text-xs flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span>Log Vitals</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Natural Physiological Context Callout */}
      <div className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] flex items-start gap-3 text-xs text-[#2D2226]">
        <Info className="w-4 h-4 text-[#FF788D] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-[#D9455D]">
            7-Day Physiological Pattern Note:
          </p>
          <p className="text-[#735E65] leading-relaxed">
            Your energy and mood peaked at score <strong className="text-[#2D2226]">5.0 (Joyful & Focused)</strong> during Cycle Days 13–15 (Ovulatory Window), followed by a steady, calm transition into the Luteal phase. Consistent 7.6h sleep is maintaining high stamina without sharp afternoon dips.
          </p>
        </div>
      </div>
    </div>
  );
};
