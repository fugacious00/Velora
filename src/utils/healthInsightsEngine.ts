import { DailyHealthLog, LifeStage, HealthInsightAlert, DailyTrendPoint, HealthInsightType } from "../types";

/**
 * Normalizes and sorts the last 7 days of daily logs leading up to the current day.
 */
export function getSequential7DayLogs(
  logs: DailyHealthLog[],
  todayLog: DailyHealthLog,
  referenceDateStr = "2026-08-21"
): { dateStr: string; dayLabel: string; log: DailyHealthLog; isToday: boolean }[] {
  const baseDate = new Date(`${referenceDateStr}T12:00:00Z`);
  const logsByDate = new Map<string, DailyHealthLog>();

  // Map all logs by date
  logs.forEach((l) => {
    logsByDate.set(l.date, l);
  });

  // Ensure current active todayLog is set
  const todayKey = todayLog.date || referenceDateStr;
  logsByDate.set(todayKey, todayLog);

  const result: { dateStr: string; dayLabel: string; log: DailyHealthLog; isToday: boolean }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const isToday = i === 0;
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

    // Retrieve or construct day log fallback
    let dayLog = logsByDate.get(dateStr);
    if (!dayLog) {
      dayLog = {
        id: `log_${dateStr}`,
        date: dateStr,
        cycleDay: Math.max(1, (todayLog.cycleDay || 18) - i),
        flow: "none",
        crampsSeverity: 0,
        headacheSeverity: 0,
        energyLevel: 4,
        mood: "calm",
        sleepHours: 7.5,
        sleepQuality: "restful",
        acne: false,
        bloating: false,
        breastTenderness: false,
        medicationsTaken: [],
        hydrationGlasses: 6,
        exerciseMinutes: 20,
      };
    }

    result.push({
      dateStr,
      dayLabel,
      log: dayLog,
      isToday,
    });
  }

  return result;
}

/**
 * Parses the last 7 days of health logs to detect clinical and lifestyle patterns in real-time.
 */
export function parseHealthInsights(
  logs: DailyHealthLog[],
  todayLog: DailyHealthLog,
  activeLifeStage: LifeStage
): HealthInsightAlert[] {
  const weekData = getSequential7DayLogs(logs, todayLog);
  const alerts: HealthInsightAlert[] = [];

  // Extract sequential arrays
  const sleepSeries = weekData.map((d) => d.log.sleepHours ?? 7.5);
  const hydrationSeries = weekData.map((d) => d.log.hydrationGlasses ?? 6);
  const headacheSeries = weekData.map((d) => d.log.headacheSeverity ?? 0);
  const crampSeries = weekData.map((d) => d.log.crampsSeverity ?? 0);
  const energySeries = weekData.map((d) => d.log.energyLevel ?? 3);
  const hotFlashesSeries = weekData.map((d) => d.log.hotFlashesCount ?? 0);

  // -------------------------------------------------------------
  // 1. SLEEP DURATION CONSISTENTLY DROPPING / DEFICIT
  // -------------------------------------------------------------
  // Check for 3+ consecutive days of decreasing sleep OR steep drop
  let consecutiveSleepDrops = 0;
  for (let i = sleepSeries.length - 1; i > 0; i--) {
    if (sleepSeries[i] < sleepSeries[i - 1]) {
      consecutiveSleepDrops++;
    } else {
      break;
    }
  }

  const startSleep = sleepSeries[0];
  const latestSleep = sleepSeries[sleepSeries.length - 1];
  const first4AvgSleep = (sleepSeries[0] + sleepSeries[1] + sleepSeries[2] + sleepSeries[3]) / 4;
  const last3AvgSleep = (sleepSeries[4] + sleepSeries[5] + sleepSeries[6]) / 3;
  const sleepDifference = +(last3AvgSleep - first4AvgSleep).toFixed(1);

  // Detect if consecutive drop >= 2 days or recent 3-day average dropped by >= 0.8h
  if (consecutiveSleepDrops >= 2 || sleepDifference <= -0.8 || latestSleep < 6.5) {
    const totalLost = +(sleepSeries[Math.max(0, sleepSeries.length - 1 - consecutiveSleepDrops)] - latestSleep).toFixed(1);
    const dropAmount = totalLost > 0 ? totalLost : Math.abs(sleepDifference);
    const percentDrop = Math.round((dropAmount / Math.max(1, startSleep)) * 100);

    const historyPoints: DailyTrendPoint[] = weekData.map((w, idx) => ({
      date: w.dateStr,
      dayLabel: w.dayLabel,
      value: sleepSeries[idx],
      unit: "h",
      label: `${sleepSeries[idx]} hrs`,
      target: 8.0,
      isToday: w.isToday,
    }));

    let bioContext = "";
    if (activeLifeStage === "cycle_hormonal") {
      bioContext =
        "In the mid-to-late luteal phase, rising then declining progesterone can elevate basal body temperature by ~0.5°F and suppress melatonin release, causing premature wakefulness and reduced deep REM latency.";
    } else if (activeLifeStage === "pregnant") {
      bioContext =
        "Gestational physiological changes, increased metabolic demands, and frequent nocturnal bathroom trips often cause fragmented sleep duration.";
    } else if (activeLifeStage === "perimenopause" || activeLifeStage === "menopause") {
      bioContext =
        "Fluctuating estrogen levels can disrupt hypothalamic temperature regulation, leading to vasomotor nocturnal awakenings.";
    } else {
      bioContext =
        "Consistent declines in sleep duration heighten evening cortisol and sympathetic nervous system tone, impacting energy and metabolic recovery.";
    }

    alerts.push({
      id: "alert_sleep_duration_drop",
      type: "sleep_drop",
      title: "Sleep Duration Consistently Dropping",
      subtitle: `${consecutiveSleepDrops >= 2 ? `${consecutiveSleepDrops + 1} consecutive days` : "7-day trend"} of declining rest`,
      severity: dropAmount >= 1.5 || latestSleep < 6.0 ? "elevated" : "notable",
      confidenceScore: Math.min(96, 75 + consecutiveSleepDrops * 7),
      detectedMetric: "Sleep Duration (Hours)",
      summary: `Sleep duration has decreased by -${dropAmount}h (${percentDrop}%) over recent days.`,
      detailedAnalysis: `Your logged sleep has trended downward from ${sleepSeries[Math.max(0, sleepSeries.length - 1 - Math.max(2, consecutiveSleepDrops))]}h to ${latestSleep}h. Over the last 7 days, your rolling average is now ${last3AvgSleep.toFixed(1)}h (target: 8.0h). Consistent sleep loss compounds cognitive fatigue and hormonal sensitivity.`,
      biologicalContext: bioContext,
      actionItems: [
        "Initiate a 30-minute screen curfew before bed to encourage natural melatonin secretion.",
        "Cool bedroom ambient temperature to 65–68°F (18–20°C) to facilitate core thermal drop.",
        "Consider magnesium glycinate (200-300mg) or warm chamomile tea after dinner.",
      ],
      copilotPromptSuggestion:
        "My sleep duration has been steadily dropping over the past few days. Can you analyze how this correlates with my current biological phase and recommend an evening wind-down routine?",
      history7Days: historyPoints,
      changeMetric: {
        value: dropAmount,
        percentage: percentDrop,
        direction: "down",
        unit: "hours",
        description: `-${dropAmount}h over ${Math.max(3, consecutiveSleepDrops + 1)} days`,
      },
      category: "sleep",
      detectedAt: new Date().toISOString(),
    });
  }

  // -------------------------------------------------------------
  // 2. HYDRATION DEFICIT PATTERN
  // -------------------------------------------------------------
  const lowHydrationDays = hydrationSeries.filter((h) => h < 6).length;
  const recentHydrationAvg = (hydrationSeries[4] + hydrationSeries[5] + hydrationSeries[6]) / 3;

  if (lowHydrationDays >= 3 || recentHydrationAvg < 5.5) {
    const hydrPoints: DailyTrendPoint[] = weekData.map((w, idx) => ({
      date: w.dateStr,
      dayLabel: w.dayLabel,
      value: hydrationSeries[idx],
      unit: "glasses",
      label: `${hydrationSeries[idx]} gl`,
      target: 8,
      isToday: w.isToday,
    }));

    alerts.push({
      id: "alert_hydration_lag",
      type: "hydration_deficit",
      title: "Sub-Optimal Hydration Deficit",
      subtitle: `${lowHydrationDays} of last 7 days below 6 glasses`,
      severity: recentHydrationAvg < 4.5 ? "elevated" : "subtle",
      confidenceScore: 88,
      detectedMetric: "Water Intake (Glasses)",
      summary: `Water intake is averaging ${recentHydrationAvg.toFixed(1)} glasses/day (target: 8).`,
      detailedAnalysis: `Hydration has remained under the 8-glass threshold on ${lowHydrationDays} logged days this week. Mild dehydration increases vascular tension, exacerbates brain fog, and can heighten luteal water retention.`,
      biologicalContext:
        "Cellular electrolyte balance supports luteal blood volume expansion and eases digestive sluggishness commonly influenced by progesterone.",
      actionItems: [
        "Keep an insulated water carafe at your desk or bedside table.",
        "Add an electrolyte pinch (pink mineral salt & lemon) to your morning water.",
        "Set a micro-hydration reminder after each meal.",
      ],
      copilotPromptSuggestion:
        "How does mild dehydration impact my energy, cramps, and headache frequency during my current cycle phase?",
      history7Days: hydrPoints,
      changeMetric: {
        value: +(8 - recentHydrationAvg).toFixed(1),
        percentage: Math.round(((8 - recentHydrationAvg) / 8) * 100),
        direction: "down",
        unit: "glasses deficit",
        description: `${(8 - recentHydrationAvg).toFixed(1)} glasses below goal`,
      },
      category: "hydration",
      detectedAt: new Date().toISOString(),
    });
  }

  // -------------------------------------------------------------
  // 3. HEADACHE / TENSION CLUSTERING
  // -------------------------------------------------------------
  const headacheDays = headacheSeries.filter((h) => h > 0);
  const maxHeadache = Math.max(...headacheSeries);

  if (headacheDays.length >= 2 || maxHeadache >= 3) {
    const headachePoints: DailyTrendPoint[] = weekData.map((w, idx) => ({
      date: w.dateStr,
      dayLabel: w.dayLabel,
      value: headacheSeries[idx],
      unit: "/5",
      label: `Sev ${headacheSeries[idx]}/5`,
      target: 0,
      isToday: w.isToday,
    }));

    alerts.push({
      id: "alert_headache_clustering",
      type: "headache_cluster",
      title: "Elevated Tension & Headache Clustering",
      subtitle: `Logged across ${headacheDays.length} days this week`,
      severity: maxHeadache >= 3 ? "elevated" : "notable",
      confidenceScore: 91,
      detectedMetric: "Headache Severity (0-5)",
      summary: `Tension headaches logged on ${headacheDays.length} of the last 7 days (peak severity ${maxHeadache}/5).`,
      detailedAnalysis: `Repeated headache episodes were detected during this 7-day window. If co-occurring with sleep declines or hormonal shifts, neurovascular sensitivity may be elevated.`,
      biologicalContext:
        "Estrogen fluctuations and neck tension from postural fatigue often sensitize cranial blood vessels during premenstrual or perimenopausal transitions.",
      actionItems: [
        "Perform 5 minutes of gentle suboccipital and trapezius neck stretches.",
        "Increase magnesium-rich foods (pumpkin seeds, spinach, dark chocolate).",
        "Take a 10-minute break from close digital screens to relax visual accommodation.",
      ],
      copilotPromptSuggestion:
        "I've logged headaches multiple times this week. What non-pharmacological support strategies align with my health history?",
      history7Days: headachePoints,
      changeMetric: {
        value: maxHeadache,
        percentage: Math.round((maxHeadache / 5) * 100),
        direction: "up",
        unit: "severity index",
        description: `Peak ${maxHeadache}/5 severity recorded`,
      },
      category: "symptom",
      detectedAt: new Date().toISOString(),
    });
  }

  // -------------------------------------------------------------
  // 4. ENERGY DEPLETION SLOPE
  // -------------------------------------------------------------
  const recentEnergyAvg = (energySeries[4] + energySeries[5] + energySeries[6]) / 3;
  if (recentEnergyAvg <= 2.8 && energySeries[0] >= 4) {
    const energyPoints: DailyTrendPoint[] = weekData.map((w, idx) => ({
      date: w.dateStr,
      dayLabel: w.dayLabel,
      value: energySeries[idx],
      unit: "/5",
      label: `Level ${energySeries[idx]}/5`,
      target: 4,
      isToday: w.isToday,
    }));

    alerts.push({
      id: "alert_energy_dip",
      type: "energy_dip",
      title: "Prolonged Energy Depletion Slope",
      subtitle: `Energy rating dropped from ${energySeries[0]}/5 to ${energySeries[6]}/5`,
      severity: recentEnergyAvg <= 2.2 ? "elevated" : "subtle",
      confidenceScore: 84,
      detectedMetric: "Energy Rating (1-5)",
      summary: `Energy levels have declined over consecutive logs to an average of ${recentEnergyAvg.toFixed(1)}/5.`,
      detailedAnalysis: `A downward vitality trajectory has been sustained over the past 48–72 hours. Synchronizing daily workloads with biological pacing can prevent systemic burnout.`,
      biologicalContext:
        "Hormonal transitions require higher basal metabolic energy for cellular repair and uterine preparation.",
      actionItems: [
        "Prioritize protein and complex carbohydrates at breakfast to stabilize glucose.",
        "Replace intense workouts with restorative yoga or brisk outdoor strolls.",
        "Schedule a brief 15-minute afternoon non-sleep deep rest (NSDR) session.",
      ],
      copilotPromptSuggestion:
        "What are gentle ways to nourish my energy when entering a low-stamina cycle phase?",
      history7Days: energyPoints,
      changeMetric: {
        value: +(energySeries[0] - energySeries[6]).toFixed(1),
        percentage: Math.round(((energySeries[0] - energySeries[6]) / 5) * 100),
        direction: "down",
        unit: "points",
        description: `-${+(energySeries[0] - energySeries[6]).toFixed(1)} points drop`,
      },
      category: "energy",
      detectedAt: new Date().toISOString(),
    });
  }

  // -------------------------------------------------------------
  // 5. CRAMPS / PELVIC SYMPTOM ESCALATION
  // -------------------------------------------------------------
  const recentCramps = crampSeries.filter((c) => c > 0);
  if (recentCramps.length >= 2) {
    const crampPoints: DailyTrendPoint[] = weekData.map((w, idx) => ({
      date: w.dateStr,
      dayLabel: w.dayLabel,
      value: crampSeries[idx],
      unit: "/5",
      label: `Cramps ${crampSeries[idx]}/5`,
      target: 0,
      isToday: w.isToday,
    }));

    alerts.push({
      id: "alert_cramps_escalation",
      type: "cramps_escalation",
      title: "Rising Pelvic Tension / Cramp Trajectory",
      subtitle: `Logged across ${recentCramps.length} recent entries`,
      severity: Math.max(...crampSeries) >= 3 ? "elevated" : "subtle",
      confidenceScore: 89,
      detectedMetric: "Cramp Severity (0-5)",
      summary: `Pelvic tension has been noted across ${recentCramps.length} days, signaling upcoming phase transition.`,
      detailedAnalysis: `Uterine prostaglandin activity naturally elevates before cycle onset. Tracking intensity helps optimize comfort in advance.`,
      biologicalContext:
        "Prostaglandins stimulate myometrial contractions to prepare for cycle shedding.",
      actionItems: [
        "Apply targeted heat therapy (heating pad or warm bath) for 15 minutes.",
        "Incorporate ginger or turmeric anti-inflammatory infusions.",
        "Practice supported child's pose and gentle cat-cow stretches.",
      ],
      copilotPromptSuggestion:
        "What evidence-based lifestyle tools can soften premenstrual cramps and pelvic tension?",
      history7Days: crampPoints,
      changeMetric: {
        value: Math.max(...crampSeries),
        percentage: Math.round((Math.max(...crampSeries) / 5) * 100),
        direction: "up",
        unit: "severity index",
        description: `Peak ${Math.max(...crampSeries)}/5 severity`,
      },
      category: "symptom",
      detectedAt: new Date().toISOString(),
    });
  }

  // -------------------------------------------------------------
  // 6. VASOMOTOR / HOT FLASH SURGE (Perimenopause / Menopause)
  // -------------------------------------------------------------
  const totalHotFlashes = hotFlashesSeries.reduce((a, b) => a + b, 0);
  if ((activeLifeStage === "perimenopause" || activeLifeStage === "menopause") && totalHotFlashes >= 4) {
    const flashPoints: DailyTrendPoint[] = weekData.map((w, idx) => ({
      date: w.dateStr,
      dayLabel: w.dayLabel,
      value: hotFlashesSeries[idx],
      unit: "flashes",
      label: `${hotFlashesSeries[idx]} flashes`,
      target: 0,
      isToday: w.isToday,
    }));

    alerts.push({
      id: "alert_hot_flashes_surge",
      type: "hot_flashes_surge",
      title: "Vasomotor Frequency Surge",
      subtitle: `${totalHotFlashes} hot flashes logged in last 7 days`,
      severity: totalHotFlashes >= 8 ? "elevated" : "notable",
      confidenceScore: 93,
      detectedMetric: "Hot Flash Episodes",
      summary: `Increased vasomotor frequency detected (${totalHotFlashes} episodes logged this week).`,
      detailedAnalysis: `A clustering of vasomotor episodes was recorded over recent days. Keeping track of triggers (e.g. spicy food, room heat, caffeine) helps pinpoint patterns.`,
      biologicalContext:
        "Hypothalamic thermo-neutral zone narrowing is triggered by fluctuating central estradiol levels.",
      actionItems: [
        "Wear breathable, moisture-wicking natural fiber layers.",
        "Limit evening caffeine and spicy triggers 4 hours before bedtime.",
        "Practice paced diaphragmatic respiration (6 breaths per minute).",
      ],
      copilotPromptSuggestion:
        "Can you help me prepare a brief of my recent hot flash frequency to discuss with my doctor?",
      history7Days: flashPoints,
      changeMetric: {
        value: totalHotFlashes,
        percentage: Math.min(100, totalHotFlashes * 12),
        direction: "up",
        unit: "weekly episodes",
        description: `${totalHotFlashes} episodes in 7 days`,
      },
      category: "symptom",
      detectedAt: new Date().toISOString(),
    });
  }

  // -------------------------------------------------------------
  // 7. POSITIVE VITALITY / RESTORATION MILESTONE (If no alerts)
  // -------------------------------------------------------------
  if (alerts.length === 0) {
    const avgSleep = +(sleepSeries.reduce((a, b) => a + b, 0) / 7).toFixed(1);
    const avgWater = +(hydrationSeries.reduce((a, b) => a + b, 0) / 7).toFixed(1);
    const vitPoints: DailyTrendPoint[] = weekData.map((w, idx) => ({
      date: w.dateStr,
      dayLabel: w.dayLabel,
      value: sleepSeries[idx],
      unit: "h",
      label: `${sleepSeries[idx]} hrs`,
      target: 8.0,
      isToday: w.isToday,
    }));

    alerts.push({
      id: "alert_vitality_optimal",
      type: "vitality_optimal",
      title: "Stable 7-Day Physiological Rhythm",
      subtitle: `Consistent restorative metrics across all 7 days`,
      severity: "subtle",
      confidenceScore: 95,
      detectedMetric: "Vitality Index",
      summary: `Your 7-day vitals are balanced with steady sleep (${avgSleep}h avg) and hydration (${avgWater} gl avg).`,
      detailedAnalysis: `No concerning deviations detected in your 7-day rolling window. Sleep duration and hydration levels are meeting clinical restorative benchmarks.`,
      biologicalContext:
        "Steady circadian entrainment strengthens immune modulation and hormonal balance.",
      actionItems: [
        "Maintain your consistent wake-up and evening wind-down times.",
        "Continue steady hydration throughout your active hours.",
      ],
      copilotPromptSuggestion:
        "My 7-day health trend is steady. What preventive wellness habits can I maintain for this phase?",
      history7Days: vitPoints,
      changeMetric: {
        value: avgSleep,
        percentage: 100,
        direction: "neutral",
        unit: "hrs avg",
        description: `Balanced 7-day baseline`,
      },
      category: "vitals",
      detectedAt: new Date().toISOString(),
    });
  }

  return alerts;
}
