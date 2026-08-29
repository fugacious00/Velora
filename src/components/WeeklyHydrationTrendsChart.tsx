import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  Droplets,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { DailyHealthLog, LifeStage } from "../types";

interface WeeklyHydrationTrendsChartProps {
  logs: DailyHealthLog[];
  todayLog: DailyHealthLog;
  activeLifeStage: LifeStage;
  onSaveDailyLog?: (log: Partial<DailyHealthLog>) => void;
  onOpenTrack?: () => void;
}

const ML_PER_GLASS = 250;

export const WeeklyHydrationTrendsChart: React.FC<WeeklyHydrationTrendsChartProps> = ({
  logs,
  todayLog,
  activeLifeStage,
  onSaveDailyLog,
  onOpenTrack,
}) => {
  const [chartType, setChartType] = useState<"bars" | "area">("bars");
  const [metricUnit, setMetricUnit] = useState<"glasses" | "ml">("glasses");

  const targetGlasses =
    activeLifeStage === "pregnant" || activeLifeStage === "postpartum" ? 10 : 8;
  const targetMl = targetGlasses * ML_PER_GLASS;

  // Build sequential 7-day hydration dataset ending with today
  const weekData = useMemo(() => {
    // Anchor to today's date or reference date
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

    // Baseline fallback mock values for past days to demonstrate rich realistic patterns
    const fallbackGlasses = [7, 8, 6, 9, 8, 7, todayLog.hydrationGlasses || 6];

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const isToday = i === 0;

      const log = logsByDate.get(dateStr);
      const glasses =
        isToday
          ? todayLog.hydrationGlasses ?? fallbackGlasses[6]
          : log?.hydrationGlasses ?? fallbackGlasses[6 - i];

      const volumeMl = glasses * ML_PER_GLASS;
      const percent = Math.min(150, Math.round((glasses / targetGlasses) * 100));
      const metTarget = glasses >= targetGlasses;

      result.push({
        date: dateStr,
        weekday,
        monthDay,
        isToday,
        glasses,
        volumeMl,
        targetGlasses,
        targetMl,
        percent,
        metTarget,
        cycleDay: log?.cycleDay || (18 - i),
      });
    }

    return result;
  }, [logs, todayLog, targetGlasses]);

  // Aggregate Metrics
  const totalGlasses = weekData.reduce((acc, curr) => acc + curr.glasses, 0);
  const avgGlasses = parseFloat((totalGlasses / weekData.length).toFixed(1));
  const avgVolumeMl = Math.round(avgGlasses * ML_PER_GLASS);
  const daysMetTarget = weekData.filter((d) => d.metTarget).length;
  const bestDay = [...weekData].sort((a, b) => b.glasses - a.glasses)[0];

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;

    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#BAE6FD] shadow-lg text-xs space-y-2 min-w-[200px] z-50">
        <div className="flex items-center justify-between border-b border-[#E0F2FE] pb-1.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
            <span className="font-bold text-[#2D2226]">
              {data.weekday}, {data.monthDay}
            </span>
          </div>
          {data.isToday && (
            <span className="px-1.5 py-0.2 bg-[#0284C7] text-white rounded-md text-[9px] font-bold">
              Today
            </span>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#735E65] flex items-center gap-1">
              <Droplets className="w-3 h-3 text-[#0284C7]" />
              <span>Intake:</span>
            </span>
            <span className="font-bold text-[#0284C7] text-sm">
              {data.glasses} glasses{" "}
              <span className="text-[10px] font-normal text-[#8E7A81]">
                ({data.volumeMl.toLocaleString()} ml)
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#735E65]">Target:</span>
            <span className="font-semibold text-[#2D2226]">
              {targetGlasses} glasses ({targetMl.toLocaleString()} ml)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#735E65]">Completion:</span>
            <span
              className={`font-bold ${
                data.metTarget ? "text-[#059669]" : "text-[#D9455D]"
              }`}
            >
              {data.percent}% {data.metTarget ? "✓ Goal Met" : "Incomplete"}
            </span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-[#F0F9FF] text-[10px] text-[#0369A1] bg-[#F0F9FF] px-2 py-1 rounded-lg">
          {data.metTarget
            ? "💧 Optimal cellular hydration maintained."
            : "⚠️ Below daily recommended volume."}
        </div>
      </div>
    );
  };

  return (
    <div
      id="weekly-hydration-trends-card"
      className="bg-white rounded-3xl p-6 sm:p-7 border border-[#FFDADA] shadow-xs space-y-6 transition-all relative overflow-hidden"
    >
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#E0F2FE]/40 via-[#F0F9FF]/20 to-transparent rounded-bl-full pointer-events-none -z-0" />

      {/* 1. Header & Controls */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#FFDADA] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center shrink-0 shadow-2xs">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D2226] tracking-tight">
                Weekly Hydration Trends
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                <TrendingUp className="w-2.5 h-2.5" />
                7-Day Overview
              </span>
            </div>
            <p className="text-xs text-[#8E7A81] mt-0.5">
              Visualizing fluid volume consistency and daily electrolyte balance
            </p>
          </div>
        </div>

        {/* View Switches & Quick Add */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart format switch */}
          <div className="flex items-center bg-[#F0F9FF] p-1 rounded-xl border border-[#BAE6FD]">
            <button
              type="button"
              onClick={() => setChartType("bars")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartType === "bars"
                  ? "bg-white text-[#0284C7] shadow-2xs border border-[#BAE6FD]"
                  : "text-[#735E65] hover:text-[#2D2226]"
              }`}
            >
              Bars
            </button>
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartType === "area"
                  ? "bg-white text-[#0284C7] shadow-2xs border border-[#BAE6FD]"
                  : "text-[#735E65] hover:text-[#2D2226]"
              }`}
            >
              Wave
            </button>
          </div>

          {/* Metric toggle */}
          <div className="flex items-center bg-[#F0F9FF] p-1 rounded-xl border border-[#BAE6FD]">
            <button
              type="button"
              onClick={() => setMetricUnit("glasses")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                metricUnit === "glasses"
                  ? "bg-white text-[#0284C7] shadow-2xs border border-[#BAE6FD]"
                  : "text-[#735E65] hover:text-[#2D2226]"
              }`}
            >
              Glasses
            </button>
            <button
              type="button"
              onClick={() => setMetricUnit("ml")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                metricUnit === "ml"
                  ? "bg-white text-[#0284C7] shadow-2xs border border-[#BAE6FD]"
                  : "text-[#735E65] hover:text-[#2D2226]"
              }`}
            >
              Volume (ml)
            </button>
          </div>

          {onSaveDailyLog && (
            <button
              type="button"
              onClick={() =>
                onSaveDailyLog({
                  hydrationGlasses: (todayLog.hydrationGlasses || 0) + 1,
                })
              }
              className="px-3 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+1 Glass</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD]/80">
          <span className="text-[11px] font-medium text-[#735E65] flex items-center gap-1">
            <Droplets className="w-3 h-3 text-[#0284C7]" />
            <span>7-Day Average</span>
          </span>
          <p className="text-base sm:text-lg font-bold text-[#0284C7] mt-1">
            {avgGlasses}{" "}
            <span className="text-xs font-normal text-[#735E65]">glasses/day</span>
          </p>
          <p className="text-[10px] text-[#8E7A81] mt-0.5">
            ≈ {avgVolumeMl.toLocaleString()} ml daily intake
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD]/80">
          <span className="text-[11px] font-medium text-[#735E65] flex items-center gap-1">
            <Target className="w-3 h-3 text-[#0284C7]" />
            <span>Goal Met Rate</span>
          </span>
          <p className="text-base sm:text-lg font-bold text-[#2D2226] mt-1">
            {daysMetTarget} / 7{" "}
            <span className="text-xs font-normal text-[#735E65]">days</span>
          </p>
          <div className="w-full bg-[#BAE6FD] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-[#0284C7] h-full rounded-full transition-all duration-500"
              style={{ width: `${(daysMetTarget / 7) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD]/80">
          <span className="text-[11px] font-medium text-[#735E65] flex items-center gap-1">
            <Award className="w-3 h-3 text-[#0284C7]" />
            <span>Peak Day</span>
          </span>
          <p className="text-base sm:text-lg font-bold text-[#2D2226] mt-1">
            {bestDay.glasses}{" "}
            <span className="text-xs font-normal text-[#735E65]">glasses</span>
          </p>
          <p className="text-[10px] text-[#8E7A81] mt-0.5">
            {bestDay.weekday} ({bestDay.volumeMl.toLocaleString()} ml)
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD]/80">
          <span className="text-[11px] font-medium text-[#735E65] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#0284C7]" />
            <span>Daily Target</span>
          </span>
          <p className="text-base sm:text-lg font-bold text-[#059669] mt-1">
            {targetGlasses}{" "}
            <span className="text-xs font-normal text-[#735E65]">glasses</span>
          </p>
          <p className="text-[10px] text-[#8E7A81] mt-0.5">
            {targetMl.toLocaleString()} ml baseline
          </p>
        </div>
      </div>

      {/* 3. Recharts Visual Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#735E65]">
          <span className="font-semibold flex items-center gap-1.5">
            <span>Water Intake per Day</span>
            <span className="text-[10px] text-[#8E7A81]">
              (Target: {metricUnit === "glasses" ? `${targetGlasses} glasses` : `${targetMl} ml`})
            </span>
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
              <span>Goal Met</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#93C5FD]" />
              <span>Incomplete</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-[#EF4444]" />
              <span>Target Line</span>
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bars" ? (
              <BarChart
                data={weekData}
                margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="hydrationBarGoal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284C7" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                  <linearGradient id="hydrationBarNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#BAE6FD" />
                  </linearGradient>
                  <linearGradient id="hydrationBarToday" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0369A1" />
                    <stop offset="100%" stopColor="#0284C7" />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0F2FE" />
                <XAxis
                  dataKey="weekday"
                  tickLine={false}
                  axisLine={{ stroke: "#BAE6FD" }}
                  tick={{ fontSize: 11, fill: "#735E65", fontWeight: 500 }}
                  tickFormatter={(val, idx) => {
                    const item = weekData[idx];
                    return item?.isToday ? `${val} (Today)` : val;
                  }}
                />
                <YAxis
                  domain={[0, (dataMax: number) => Math.max(targetGlasses + 2, dataMax + 1)]}
                  tickLine={false}
                  axisLine={{ stroke: "#BAE6FD" }}
                  tick={{ fontSize: 11, fill: "#8E7A81" }}
                  dataKey={metricUnit === "glasses" ? "glasses" : "volumeMl"}
                  tickFormatter={(v) => (metricUnit === "glasses" ? `${v} gl` : `${v} ml`)}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={metricUnit === "glasses" ? targetGlasses : targetMl}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Daily Target",
                    position: "right",
                    fill: "#EF4444",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey={metricUnit === "glasses" ? "glasses" : "volumeMl"}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={44}
                  animationDuration={800}
                >
                  {weekData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.isToday
                          ? "url(#hydrationBarToday)"
                          : entry.metTarget
                          ? "url(#hydrationBarGoal)"
                          : "url(#hydrationBarNormal)"
                      }
                      stroke={entry.isToday ? "#0284C7" : "transparent"}
                      strokeWidth={entry.isToday ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart
                data={weekData}
                margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="hydrationAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#BAE6FD" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0F2FE" />
                <XAxis
                  dataKey="weekday"
                  tickLine={false}
                  axisLine={{ stroke: "#BAE6FD" }}
                  tick={{ fontSize: 11, fill: "#735E65", fontWeight: 500 }}
                  tickFormatter={(val, idx) => {
                    const item = weekData[idx];
                    return item?.isToday ? `${val} (Today)` : val;
                  }}
                />
                <YAxis
                  domain={[0, (dataMax: number) => Math.max(targetGlasses + 2, dataMax + 1)]}
                  tickLine={false}
                  axisLine={{ stroke: "#BAE6FD" }}
                  tick={{ fontSize: 11, fill: "#8E7A81" }}
                  dataKey={metricUnit === "glasses" ? "glasses" : "volumeMl"}
                  tickFormatter={(v) => (metricUnit === "glasses" ? `${v} gl` : `${v} ml`)}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={metricUnit === "glasses" ? targetGlasses : targetMl}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey={metricUnit === "glasses" ? "glasses" : "volumeMl"}
                  stroke="#0284C7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#hydrationAreaGrad)"
                  dot={{ r: 4, fill: "#0284C7", stroke: "#FFF", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#0369A1", stroke: "#FFF", strokeWidth: 2 }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Biological Insight & Micro-recommendation */}
      <div className="p-3.5 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#0369A1]">
          <Info className="w-4 h-4 text-[#0284C7] shrink-0" />
          <span>
            {avgGlasses >= targetGlasses
              ? `Great job! Your 7-day average of ${avgGlasses} glasses satisfies your ${activeLifeStage.replace("_", " ")} cellular hydration requirements.`
              : `Tip: You are averaging ${avgGlasses} glasses/day. Increasing by ${(targetGlasses - avgGlasses).toFixed(1)} glasses helps alleviate fatigue and luteal water retention.`}
          </span>
        </div>

        {onOpenTrack && (
          <button
            type="button"
            onClick={onOpenTrack}
            className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] hover:underline flex items-center gap-1 shrink-0 cursor-pointer self-end sm:self-auto"
          >
            <span>Log Details in Tracker</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
