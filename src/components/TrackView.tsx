import React, { useState } from "react";
import { useHealth } from "../context/HealthContext";
import { FlowLevel, MoodType, CervicalMucus, OvulationTestResult } from "../types";
import {
  Check,
  Calendar,
  Heart,
  Moon,
  Sun,
  Droplets,
  Activity,
  Pill,
  Sparkles,
  Baby,
  Flame,
  Plus,
  Minus,
  Trash2,
  Save,
  CheckCircle2,
  Star,
  Bed,
  Clock,
  Zap,
} from "lucide-react";

interface TrackViewProps {
  onSaved?: () => void;
}

export const TrackView: React.FC<TrackViewProps> = ({ onSaved }) => {
  const { todayLog, saveDailyLog, activeLifeStage, formatTerm } = useHealth();

  const [date, setDate] = useState(todayLog.date || "2026-08-21");
  const [cycleDay, setCycleDay] = useState(todayLog.cycleDay || 18);
  const [flow, setFlow] = useState<FlowLevel>(todayLog.flow || "none");
  const [cramps, setCramps] = useState(todayLog.crampsSeverity || 0);
  const [headaches, setHeadaches] = useState(todayLog.headacheSeverity || 0);
  const [energy, setEnergy] = useState(todayLog.energyLevel || 4);
  const [mood, setMood] = useState<MoodType>(todayLog.mood || "calm");
  const [sleepHours, setSleepHours] = useState(todayLog.sleepHours || 7.5);
  const [sleepQuality, setSleepQuality] = useState<"restful" | "average" | "disturbed" | "poor" | "excellent">(
    todayLog.sleepQuality || "restful"
  );
  const [sleepRating, setSleepRating] = useState<number>(
    todayLog.sleepRating || (todayLog.sleepQuality === "restful" ? 4 : todayLog.sleepQuality === "average" ? 3 : 2)
  );
  const [sleepFactors, setSleepFactors] = useState<string[]>(
    todayLog.sleepFactors || ["Woke up refreshed"]
  );
  const [acne, setAcne] = useState(todayLog.acne || false);
  const [bloating, setBloating] = useState(todayLog.bloating || false);
  const [breastTenderness, setBreastTenderness] = useState(todayLog.breastTenderness || false);

  // Stage-specific fields
  const [bbt, setBbt] = useState<number>(todayLog.basalBodyTemp || 97.9);
  const [cervicalMucus, setCervicalMucus] = useState<CervicalMucus>(todayLog.cervicalMucus || "creamy");
  const [ovulationTest, setOvulationTest] = useState<OvulationTestResult>(todayLog.ovulationTest || "negative");
  const [babyKicks, setBabyKicks] = useState(todayLog.babyKicksCount || 8);
  const [bloodPressure, setBloodPressure] = useState(todayLog.maternalBloodPressure || "116/74");
  const [hotFlashes, setHotFlashes] = useState(todayLog.hotFlashesCount || 0);
  const [postpartumPain, setPostpartumPain] = useState(todayLog.postpartumRecovery?.painScore || 1);
  const [feedings, setFeedings] = useState(todayLog.postpartumRecovery?.feedingsCount || 7);
  const [pumpingOz, setPumpingOz] = useState(todayLog.postpartumRecovery?.pumpingVolumeOz || 12);

  const [medications, setMedications] = useState<string[]>(
    todayLog.medicationsTaken || ["Prenatal Multivitamin with Methylfolate", "Magnesium Bisglycinate 300mg"]
  );
  const [newMedInput, setNewMedInput] = useState("");
  const [hydration, setHydration] = useState(todayLog.hydrationGlasses || 6);
  const [exerciseMinutes, setExerciseMinutes] = useState(todayLog.exerciseMinutes || 30);
  const [exerciseType, setExerciseType] = useState(todayLog.exerciseType || "Walking & gentle mobility");
  const [notes, setNotes] = useState(todayLog.notes || "");
  const [isSaved, setIsSaved] = useState(false);

  const moodsList: { id: MoodType; label: string }[] = [
    { id: "calm", label: "Calm" },
    { id: "joyful", label: "Joyful" },
    { id: "focused", label: "Focused" },
    { id: "sensitive", label: "Sensitive" },
    { id: "anxious", label: "Anxious" },
    { id: "low", label: "Low" },
    { id: "irritable", label: "Irritable" },
    { id: "exhausted", label: "Exhausted" },
  ];

  const flowLevels: { id: FlowLevel; label: string; desc: string }[] = [
    { id: "none", label: "None", desc: "No bleeding" },
    { id: "spotting", label: "Spotting", desc: "Minimal drops" },
    { id: "light", label: "Light", desc: "Light liner" },
    { id: "medium", label: "Medium", desc: "Regular flow" },
    { id: "heavy", label: "Heavy", desc: "Full pad/cup" },
  ];

  const handleToggleMed = (med: string) => {
    if (medications.includes(med)) {
      setMedications(medications.filter((m) => m !== med));
    } else {
      setMedications([...medications, med]);
    }
  };

  const handleAddCustomMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedInput.trim()) return;
    if (!medications.includes(newMedInput.trim())) {
      setMedications([...medications, newMedInput.trim()]);
    }
    setNewMedInput("");
  };

  const handleToggleFactor = (factor: string) => {
    if (sleepFactors.includes(factor)) {
      setSleepFactors(sleepFactors.filter((f) => f !== factor));
    } else {
      setSleepFactors([...sleepFactors, factor]);
    }
  };

  const handleSave = () => {
    saveDailyLog({
      date,
      cycleDay,
      flow,
      crampsSeverity: cramps,
      headacheSeverity: headaches,
      energyLevel: energy,
      mood,
      sleepHours,
      sleepQuality,
      sleepRating,
      sleepFactors,
      acne,
      bloating,
      breastTenderness,
      basalBodyTemp: bbt,
      cervicalMucus,
      ovulationTest,
      babyKicksCount: babyKicks,
      maternalBloodPressure: bloodPressure,
      hotFlashesCount: hotFlashes,
      postpartumRecovery: {
        painScore: postpartumPain,
        bleedingLochia: flow === "none" ? "none" : "light",
        pelvicFloorSoreness: postpartumPain > 2,
        feedingsCount: feedings,
        pumpingVolumeOz: pumpingOz,
        supportScore: 4,
      },
      medicationsTaken: medications,
      hydrationGlasses: hydration,
      exerciseMinutes,
      exerciseType,
      notes,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      if (onSaved) onSaved();
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#D9455D] bg-[#FFF5F7] px-2.5 py-0.5 rounded-full border border-[#FFDADA]">
              Your Day Tracker
            </span>
            <span className="text-xs text-[#8E7A81]">1-Tap Continuous Health Log</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2D2226] mt-1">
            Log Health & Biological Markers
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 text-sm border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF788D]"
          />
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
              isSaved
                ? "bg-[#FF788D] text-white"
                : "bg-[#FF788D] hover:bg-[#E85C71] active:scale-98 text-white"
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved to Timeline!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Today's Log</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Cycle & Flow Section (if applicable to stage) */}
      <div className="bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#FFDADA] pb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-[#FF788D]" />
            <h3 className="text-base font-semibold text-[#2D2226]">
              {formatTerm("Menstrual Flow & Cycle Day", "Flow & Cycle Rhythm")}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8E7A81]">Cycle Day:</span>
            <input
              type="number"
              min="1"
              max="60"
              value={cycleDay}
              onChange={(e) => setCycleDay(Number(e.target.value))}
              className="w-14 px-2 py-1 text-sm border border-[#FFDADA] rounded-lg text-center font-bold text-[#2D2226] bg-[#FFF5F7]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {flowLevels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setFlow(lvl.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                flow === lvl.id
                  ? "border-[#FF788D] bg-[#FFF5F7] text-[#D9455D] font-semibold"
                  : "border-[#FFDADA] hover:bg-[#FFF5F7] text-[#735E65] bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{lvl.label}</span>
                {flow === lvl.id && <Check className="w-4 h-4 text-[#FF788D]" />}
              </div>
              <p className="text-[10px] text-[#8E7A81] mt-1">{lvl.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Physical Symptoms & Discomforts */}
      <div className="bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs space-y-5">
        <h3 className="text-base font-semibold text-[#2D2226] border-b border-[#FFDADA] pb-3">
          Physical Symptoms & Sensations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cramps Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-[#2D2226]">Pelvic Cramps Severity</span>
              <span className="font-bold text-[#D9455D]">{cramps} / 5</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={cramps}
              onChange={(e) => setCramps(Number(e.target.value))}
              className="w-full accent-[#FF788D] h-2 bg-[#FFF5F7] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8E7A81]">
              <span>None (0)</span>
              <span>Mild (1-2)</span>
              <span>Moderate (3-4)</span>
              <span>Severe (5)</span>
            </div>
          </div>

          {/* Headaches Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-[#2D2226]">Headache / Migraine</span>
              <span className="font-bold text-[#D9455D]">{headaches} / 5</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={headaches}
              onChange={(e) => setHeadaches(Number(e.target.value))}
              className="w-full accent-[#FF788D] h-2 bg-[#FFF5F7] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8E7A81]">
              <span>None (0)</span>
              <span>Tension (1-2)</span>
              <span>Throbbing (3-4)</span>
              <span>Intense (5)</span>
            </div>
          </div>
        </div>

        {/* Secondary Symptom Chips */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-medium text-[#8E7A81]">Other Observed Symptoms:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setBloating(!bloating)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                bloating
                  ? "bg-[#FFF5F7] border-[#FF788D] text-[#D9455D] font-semibold"
                  : "bg-[#FFF9FA] border-[#FFDADA] text-[#735E65] hover:bg-[#FFF5F7]"
              }`}
            >
              {bloating ? "✓ Bloating Logged" : "+ Bloating"}
            </button>
            <button
              onClick={() => setAcne(!acne)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                acne
                  ? "bg-[#FFF5F7] border-[#FF788D] text-[#D9455D] font-semibold"
                  : "bg-[#FFF9FA] border-[#FFDADA] text-[#735E65] hover:bg-[#FFF5F7]"
              }`}
            >
              {acne ? "✓ Skin / Acne" : "+ Skin / Acne"}
            </button>
            <button
              onClick={() => setBreastTenderness(!breastTenderness)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                breastTenderness
                  ? "bg-[#FFF5F7] border-[#FF788D] text-[#D9455D] font-semibold"
                  : "bg-[#FFF9FA] border-[#FFDADA] text-[#735E65] hover:bg-[#FFF5F7]"
              }`}
            >
              {breastTenderness ? "✓ Breast Tenderness" : "+ Breast Tenderness"}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Emotional Mood & Physical Vitality */}
      <div className="bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#FFDADA] pb-3">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-[#FF788D]" />
            <h3 className="text-base font-semibold text-[#2D2226]">
              Emotional Mood & Daily Energy
            </h3>
          </div>
          <span className="text-xs text-[#8E7A81]">Neurochemical Balance</span>
        </div>

        {/* Mood Grid */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#8E7A81]">Dominant Mood Today:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {moodsList.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  mood === m.id
                    ? "bg-[#FF788D] text-white border-[#FF788D] font-semibold shadow-2xs scale-[1.02]"
                    : "bg-[#FFF5F7] border-[#FFDADA] text-[#735E65] hover:bg-[#FFEDF1]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Energy Slider */}
        <div className="space-y-2 pt-2 border-t border-[#FFDADA]/60">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-[#2D2226] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#FF788D]" />
              <span>Overall Physical Stamina</span>
            </span>
            <span className="font-bold text-[#D9455D]">{energy} / 5</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full accent-[#FF788D] h-2 bg-[#FFF5F7] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8E7A81]">
            <span>Exhausted / Depleted (1)</span>
            <span>Moderate / Balanced (3)</span>
            <span>Peak Vitality (5)</span>
          </div>
        </div>
      </div>

      {/* 4. Dedicated Sleep Duration & Quality Architecture */}
      <div
        id="sleep-logging-section"
        className="bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FFDADA] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#FFF0F3] text-[#FF788D] border border-[#FFD3DC]">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#2D2226]">
                Sleep Duration & Quality Rating
              </h3>
              <p className="text-xs text-[#8E7A81]">
                Circadian restoration, night awakenings, and rest architecture
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#FFF5F7] px-3 py-1 rounded-full border border-[#FFDADA]">
            <Clock className="w-3.5 h-3.5 text-[#FF788D]" />
            <span className="text-xs font-semibold text-[#D9455D]">
              Goal: {activeLifeStage === "pregnant" || activeLifeStage === "postpartum" ? "8.5h" : "8.0h"} Target
            </span>
          </div>
        </div>

        {/* 4A. Sleep Duration Input Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#735E65] flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-[#FF788D]" />
              <span>Hours of Sleep Last Night</span>
            </label>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-serif font-bold text-[#2D2226]">
                {sleepHours}
              </span>
              <span className="text-xs text-[#735E65] font-medium">
                hrs ({Math.floor(sleepHours)}h {Math.round((sleepHours % 1) * 60)}m)
              </span>
            </div>
          </div>

          {/* Stepper + Slider Row */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSleepHours(Math.max(1, parseFloat((sleepHours - 0.5).toFixed(1))))}
              className="px-3 py-2 rounded-xl bg-[#FFF5F7] hover:bg-[#FFE5E9] border border-[#FFDADA] text-xs font-bold text-[#D9455D] flex items-center gap-1 transition-colors cursor-pointer"
              title="Decrease by 30 minutes"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>30m</span>
            </button>

            <div className="flex-1">
              <input
                type="range"
                min="2"
                max="13"
                step="0.25"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-[#FF788D] h-2.5 bg-[#FFF5F7] rounded-lg cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => setSleepHours(Math.min(14, parseFloat((sleepHours + 0.5).toFixed(1))))}
              className="px-3 py-2 rounded-xl bg-[#FFF5F7] hover:bg-[#FFE5E9] border border-[#FFDADA] text-xs font-bold text-[#D9455D] flex items-center gap-1 transition-colors cursor-pointer"
              title="Increase by 30 minutes"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>30m</span>
            </button>
          </div>

          {/* Duration Preset Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-[#8E7A81]">Quick Presets:</span>
            {[5.5, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSleepHours(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  sleepHours === preset
                    ? "bg-[#FF788D] text-white border-[#FF788D] font-bold shadow-2xs"
                    : "bg-[#FFF9FA] border-[#FFDADA] text-[#735E65] hover:bg-[#FFF5F7]"
                }`}
              >
                {preset}h
              </button>
            ))}
          </div>
        </div>

        {/* 4B. Sleep Quality Rating (5-Star & Qualitative Classification) */}
        <div className="space-y-3 pt-4 border-t border-[#FFDADA]/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-[#735E65]">
                How would you rate the quality of your sleep?
              </span>
              <p className="text-[11px] text-[#8E7A81]">
                Measures sleep depth, soundness, and morning recovery
              </p>
            </div>

            {/* Interactive Star Rating Indicator */}
            <div className="flex items-center gap-1 bg-[#FFF5F7] px-3 py-1.5 rounded-xl border border-[#FFDADA]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setSleepRating(star);
                    if (star >= 4) setSleepQuality("restful");
                    else if (star === 3) setSleepQuality("average");
                    else setSleepQuality("disturbed");
                  }}
                  className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= sleepRating
                        ? "fill-[#FF788D] text-[#FF788D]"
                        : "text-[#FFDADA] hover:text-[#FFA4B2]"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-[#D9455D] ml-1.5">
                {sleepRating}/5 Stars
              </span>
            </div>
          </div>

          {/* 5 Distinct Quality Rating Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {[
              {
                id: "excellent",
                rating: 5,
                title: "Deep & Restorative",
                desc: "Woke fully rested",
                qualityKey: "restful" as const,
              },
              {
                id: "restful",
                rating: 4,
                title: "Good & Sound",
                desc: "Solid, easy awakening",
                qualityKey: "restful" as const,
              },
              {
                id: "average",
                rating: 3,
                title: "Fair / Moderate",
                desc: "Adequate, light sleep",
                qualityKey: "average" as const,
              },
              {
                id: "disturbed",
                rating: 2,
                title: "Restless / Broken",
                desc: "Frequent awakenings",
                qualityKey: "disturbed" as const,
              },
              {
                id: "poor",
                rating: 1,
                title: "Poor / Insomnia",
                desc: "Exhausted / Tossed",
                qualityKey: "disturbed" as const,
              },
            ].map((card) => {
              const isSelected = sleepRating === card.rating;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setSleepRating(card.rating);
                    setSleepQuality(card.qualityKey);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-[#FF788D] bg-[#FFF0F3] shadow-2xs scale-[1.02]"
                      : "border-[#FFDADA] bg-white hover:bg-[#FFF9FA]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D2226]">{card.title}</span>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-[#FF788D]" />
                    ) : (
                      <span className="text-[10px] text-[#8E7A81]">{card.rating}★</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#735E65] mt-1.5">{card.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4C. Sleep Factors & Nighttime Context Tags */}
        <div className="space-y-2 pt-4 border-t border-[#FFDADA]/60">
          <span className="text-xs font-semibold text-[#735E65] block">
            Sleep Factors & Observed Influences:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              "Woke Up Refreshed",
              "Fell Asleep Fast (<15m)",
              "Night Sweats / Overheating",
              "Frequent Night Waking",
              "Vivid / Intense Dreams",
              "Difficulty Falling Asleep",
              "Screen Use Before Bed",
              "Magnesium / Herbal Tea Taken",
            ].map((factor) => {
              const active = sleepFactors.includes(factor);
              return (
                <button
                  key={factor}
                  type="button"
                  onClick={() => handleToggleFactor(factor)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                    active
                      ? "bg-[#FFF0F3] border-[#FF788D] text-[#D9455D] font-semibold"
                      : "bg-[#FFF9FA] border-[#FFDADA] text-[#735E65] hover:bg-[#FFF5F7]"
                  }`}
                >
                  {active ? `✓ ${factor}` : `+ ${factor}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Life-Stage Dynamic Extension */}
      {activeLifeStage === "ttc" && (
        <div className="bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#FF788D] border-b border-[#FFDADA] pb-3">
            <Heart className="w-5 h-5" />
            <h3 className="text-base font-semibold text-[#2D2226]">TTC & Fertility Biomarkers</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-[#8E7A81] block mb-1">
                Basal Body Temp (°F)
              </label>
              <input
                type="number"
                step="0.1"
                value={bbt}
                onChange={(e) => setBbt(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#8E7A81] block mb-1">
                Cervical Fluid
              </label>
              <select
                value={cervicalMucus}
                onChange={(e) => setCervicalMucus(e.target.value as CervicalMucus)}
                className="w-full px-3 py-2 text-sm border border-[#FFDADA] rounded-xl bg-white text-[#2D2226]"
              >
                <option value="dry">Dry</option>
                <option value="sticky">Sticky</option>
                <option value="creamy">Creamy</option>
                <option value="egg_white">Egg-white (Fertile)</option>
                <option value="watery">Watery</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#8E7A81] block mb-1">
                LH Surge Test
              </label>
              <select
                value={ovulationTest}
                onChange={(e) => setOvulationTest(e.target.value as OvulationTestResult)}
                className="w-full px-3 py-2 text-sm border border-[#FFDADA] rounded-xl bg-white text-[#2D2226]"
              >
                <option value="negative">Negative</option>
                <option value="faint">Faint Line</option>
                <option value="positive">Positive</option>
                <option value="peak">Peak Surge</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeLifeStage === "pregnant" && (
        <div className="bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#FF788D] border-b border-[#FFDADA] pb-3">
            <Baby className="w-5 h-5" />
            <h3 className="text-base font-semibold text-[#2D2226]">Pregnancy Markers (Week 16)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#FFDADA]">
              <label className="text-xs font-medium text-[#8E7A81] block mb-2">
                Kick / Movement Counter
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBabyKicks((k) => k + 1)}
                  className="px-4 py-2 bg-[#FF788D] hover:bg-[#E85C71] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                >
                  + Log Kick
                </button>
                <span className="text-lg font-bold text-[#2D2226]">{babyKicks} Kicks Logged</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#8E7A81] block mb-1">
                Maternal Blood Pressure
              </label>
              <input
                type="text"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
                placeholder="e.g. 116/74"
                className="w-full px-3 py-2 text-sm border border-[#FFDADA] rounded-xl bg-white text-[#2D2226]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Medications & Supplements */}
      <div className="bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#FFDADA] pb-3">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#FF788D]" />
            <h3 className="text-base font-semibold text-[#2D2226]">
              Medications & Daily Supplements
            </h3>
          </div>
          <span className="text-xs text-[#8E7A81]">{medications.length} Active Regimens</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {["Prenatal Multivitamin with Methylfolate", "Magnesium Bisglycinate 300mg", "Omega-3 1000mg", "Iron 25mg", "Vitamin D3 2000 IU", "Probiotic"].map((med) => {
            const isChecked = medications.includes(med);
            return (
              <button
                key={med}
                onClick={() => handleToggleMed(med)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  isChecked
                    ? "bg-[#FFF5F7] border-[#FF788D] text-[#D9455D] font-semibold"
                    : "bg-[#FFF9FA] border-[#FFDADA] text-[#735E65] hover:bg-[#FFF5F7]"
                }`}
              >
                {isChecked ? `✓ ${med}` : `+ ${med}`}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleAddCustomMed} className="flex gap-2 pt-2">
          <input
            type="text"
            value={newMedInput}
            onChange={(e) => setNewMedInput(e.target.value)}
            placeholder="Add custom prescription or supplement..."
            className="flex-1 px-3 py-1.5 text-xs border border-[#FFDADA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF788D] bg-[#FFF5F7] text-[#2D2226]"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-[#FF788D] hover:bg-[#E85C71] text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs"
          >
            Add
          </button>
        </form>
      </div>

      {/* 6. Hydration & Movement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hydration */}
        <div className="bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-[#2D2226] flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-[#FF788D]" />
              <span>Hydration Target</span>
            </span>
            <span className="text-xs font-bold text-[#D9455D]">{hydration} / 8 Glasses</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <button
                key={num}
                onClick={() => setHydration(num)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  num <= hydration
                    ? "bg-[#FF788D] text-white shadow-2xs"
                    : "bg-[#FFF5F7] text-[#8E7A81] hover:bg-[#FFEDF1] border border-[#FFDADA]"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Movement */}
        <div className="bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-[#2D2226] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#FF788D]" />
              <span>Movement & Exercise</span>
            </span>
            <span className="text-xs font-bold text-[#D9455D]">{exerciseMinutes} Mins</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value)}
              placeholder="e.g. Brisk walk, Pilates, Rest day"
              className="flex-1 px-3 py-1.5 text-xs border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226]"
            />
            <input
              type="number"
              value={exerciseMinutes}
              onChange={(e) => setExerciseMinutes(Number(e.target.value))}
              className="w-16 px-2 py-1.5 text-xs border border-[#FFDADA] rounded-xl text-center font-bold bg-[#FFF5F7] text-[#2D2226]"
            />
          </div>
        </div>
      </div>

      {/* 7. Journal Notes & Personal Reflection */}
      <div className="bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs space-y-2">
        <label className="text-sm font-semibold text-[#2D2226] block">
          Personal Health Scratchpad & Reflections
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Log anything notable: nutrition cues, stress levels, doctor questions, energy reflections..."
          className="w-full p-3 text-sm border border-[#FFDADA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF788D] text-[#2D2226] placeholder-[#8E7A81] bg-[#FFF5F7]"
        />
      </div>

      {/* Bottom Save Action */}
      <div className="flex items-center justify-between p-4 bg-[#FFF5F7] rounded-2xl border border-[#FFDADA]">
        <p className="text-xs text-[#8E7A81]">
          🔒 Encrypted locally. Syncs to your Health Timeline and updates Body Pattern correlations.
        </p>
        <button
          onClick={handleSave}
          disabled={isSaved}
          className="px-6 py-2.5 bg-[#FF788D] hover:bg-[#E85C71] active:scale-98 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          {isSaved ? "Saved Successfully!" : "Save Today's Entry"}
        </button>
      </div>
    </div>
  );
};
