import React, { useState, useEffect } from "react";
import { LifeStage } from "../types";
import {
  Target,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  TrendingUp,
  Droplets,
  Moon,
  Activity,
  Heart,
  Sparkles,
  Pill,
  Utensils,
  Wind,
  Trash2,
  Calendar,
  X,
  ChevronRight,
} from "lucide-react";

export type GoalFrequency = "daily" | "weekly";
export type GoalCategory =
  | "hydration"
  | "movement"
  | "sleep"
  | "mindfulness"
  | "nutrition"
  | "vitals"
  | "custom";

export interface HealthGoal {
  id: string;
  title: string;
  category: GoalCategory;
  frequency: GoalFrequency;
  current: number;
  target: number;
  unit: string;
  lifeStage?: LifeStage;
  completed: boolean;
  streakDays?: number;
}

const DEFAULT_GOALS: HealthGoal[] = [
  {
    id: "g-daily-1",
    title: "Daily Hydration Target",
    category: "hydration",
    frequency: "daily",
    current: 6,
    target: 8,
    unit: "glasses",
    completed: false,
    streakDays: 5,
  },
  {
    id: "g-daily-2",
    title: "Restful Night Sleep",
    category: "sleep",
    frequency: "daily",
    current: 7.5,
    target: 8,
    unit: "hours",
    completed: true,
    streakDays: 4,
  },
  {
    id: "g-daily-3",
    title: "Gentle Movement / Walk",
    category: "movement",
    frequency: "daily",
    current: 25,
    target: 30,
    unit: "mins",
    completed: false,
    streakDays: 3,
  },
  {
    id: "g-daily-4",
    title: "Supplements & Hormonal Vitals",
    category: "nutrition",
    frequency: "daily",
    current: 1,
    target: 1,
    unit: "dose",
    completed: true,
    streakDays: 12,
  },
  {
    id: "g-daily-5",
    title: "Vagus Reset / 4-7-8 Breathwork",
    category: "mindfulness",
    frequency: "daily",
    current: 1,
    target: 1,
    unit: "session",
    completed: true,
    streakDays: 6,
  },
  // Weekly goals
  {
    id: "g-weekly-1",
    title: "Strength & Low-Impact Pilates",
    category: "movement",
    frequency: "weekly",
    current: 3,
    target: 4,
    unit: "workouts",
    completed: false,
    streakDays: 2,
  },
  {
    id: "g-weekly-2",
    title: "Whole-Food Kitchen Meal Prep",
    category: "nutrition",
    frequency: "weekly",
    current: 4,
    target: 5,
    unit: "meals",
    completed: false,
    streakDays: 3,
  },
  {
    id: "g-weekly-3",
    title: "Longitudinal Symptom & BBT Logging",
    category: "vitals",
    frequency: "weekly",
    current: 6,
    target: 7,
    unit: "days",
    completed: false,
    streakDays: 4,
  },
  {
    id: "g-weekly-4",
    title: "Pelvic Floor & Core Reset Sessions",
    category: "mindfulness",
    frequency: "weekly",
    current: 3,
    target: 3,
    unit: "sessions",
    completed: true,
    streakDays: 5,
  },
];

const LOCAL_STORAGE_GOALS_KEY = "velora_health_goals_v1";

interface PersonalHealthGoalsTrackerProps {
  activeLifeStage: LifeStage;
  onOpenTrack?: () => void;
  onOpenBreathing?: () => void;
  onOpenKitchen?: () => void;
}

export const PersonalHealthGoalsTracker: React.FC<PersonalHealthGoalsTrackerProps> = ({
  activeLifeStage,
  onOpenTrack,
  onOpenBreathing,
  onOpenKitchen,
}) => {
  const [goals, setGoals] = useState<HealthGoal[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_GOALS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fall back to defaults
      }
    }
    return DEFAULT_GOALS;
  });

  const [selectedFrequency, setSelectedFrequency] = useState<GoalFrequency>("daily");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New goal form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<GoalCategory>("movement");
  const [newTarget, setNewTarget] = useState<number>(1);
  const [newUnit, setNewUnit] = useState("session");

  // Save to localStorage when goals change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_GOALS_KEY, JSON.stringify(goals));
  }, [goals]);

  // Filter goals by frequency
  const currentGoals = goals.filter((g) => g.frequency === selectedFrequency);

  // Calculate statistics
  const totalCount = currentGoals.length;
  const completedCount = currentGoals.filter((g) => g.completed || g.current >= g.target).length;
  const overallPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Toggle goal complete
  const toggleGoalComplete = (id: string) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === id) {
          const nextCompleted = !goal.completed;
          return {
            ...goal,
            completed: nextCompleted,
            current: nextCompleted ? goal.target : Math.max(0, goal.target - 1),
          };
        }
        return goal;
      })
    );
  };

  // Increment goal progress
  const incrementGoal = (id: string, step = 1) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === id) {
          const nextVal = Math.min(goal.target * 2, Number((goal.current + step).toFixed(1)));
          const isDone = nextVal >= goal.target;
          return {
            ...goal,
            current: nextVal,
            completed: isDone,
          };
        }
        return goal;
      })
    );
  };

  // Decrement goal progress
  const decrementGoal = (id: string, step = 1) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === id) {
          const nextVal = Math.max(0, Number((goal.current - step).toFixed(1)));
          return {
            ...goal,
            current: nextVal,
            completed: nextVal >= goal.target,
          };
        }
        return goal;
      })
    );
  };

  // Delete a goal
  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Add a new goal
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoalItem: HealthGoal = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      frequency: selectedFrequency,
      current: 0,
      target: Math.max(1, newTarget),
      unit: newUnit.trim() || "unit",
      completed: false,
      streakDays: 1,
    };

    setGoals((prev) => [...prev, newGoalItem]);
    setNewTitle("");
    setNewTarget(1);
    setNewUnit("session");
    setIsAddModalOpen(false);
  };

  // Category Icon helper
  const getCategoryIcon = (category: GoalCategory) => {
    switch (category) {
      case "hydration":
        return <Droplets className="w-4 h-4 text-[#0284C7]" />;
      case "sleep":
        return <Moon className="w-4 h-4 text-[#7E60CD]" />;
      case "movement":
        return <Activity className="w-4 h-4 text-[#FF788D]" />;
      case "nutrition":
        return <Utensils className="w-4 h-4 text-[#16A34A]" />;
      case "mindfulness":
        return <Wind className="w-4 h-4 text-[#0D9488]" />;
      case "vitals":
        return <Heart className="w-4 h-4 text-[#E11D48]" />;
      default:
        return <Target className="w-4 h-4 text-[#FF788D]" />;
    }
  };

  const getCategoryBg = (category: GoalCategory) => {
    switch (category) {
      case "hydration":
        return "bg-[#F0F9FF] border-[#BAE6FD]";
      case "sleep":
        return "bg-[#F5F0FB] border-[#DDD0ED]";
      case "movement":
        return "bg-[#FFF0F3] border-[#FFD3DC]";
      case "nutrition":
        return "bg-[#F0FDF4] border-[#BBF7D0]";
      case "mindfulness":
        return "bg-[#F0FDFA] border-[#99F6E4]";
      case "vitals":
        return "bg-[#FFF1F2] border-[#FECDD3]";
      default:
        return "bg-[#FFF5F7] border-[#FFDADA]";
    }
  };

  // Stage-adapted guidance snippet
  const getStageRecommendation = () => {
    switch (activeLifeStage) {
      case "pregnant":
        return "Pregnancy Focus: Aim for 9-10 glasses of water, gentle walking, and daily prenatal DHA.";
      case "postpartum":
        return "Postpartum Focus: Gentle pelvic floor breathing, warm nourishing hydration, and rest intervals.";
      case "perimenopause":
        return "Perimenopause Focus: Magnesium-rich evening routine, cooling hydration, and bone-strengthening resistance.";
      case "ttc":
        return "Fertility Focus: Consistent morning basal temperature logging, folate nutrition, and stress reduction.";
      default:
        return "Cycle Alignment: Tailor workout intensity to your cycle phase and support progesterone with restorative rest.";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#FFDADA] shadow-xs space-y-6">
      {/* 1. Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FFDADA] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#FFF0F3] text-[#FF788D] border border-[#FFD3DC]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#2D2226] tracking-tight">
                Personal Health Goals
              </h2>
              <p className="text-xs text-[#8E7A81]">
                Active daily milestones & weekly progress tracking
              </p>
            </div>
          </div>
        </div>

        {/* Frequency Segmented Control + Add Button */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="bg-[#FFF5F7] p-1 rounded-xl border border-[#FFDADA] flex items-center">
            <button
              type="button"
              onClick={() => setSelectedFrequency("daily")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFrequency === "daily"
                  ? "bg-[#FF788D] text-white shadow-xs"
                  : "text-[#735E65] hover:text-[#2D2226]"
              }`}
            >
              Daily Goals
            </button>
            <button
              type="button"
              onClick={() => setSelectedFrequency("weekly")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFrequency === "weekly"
                  ? "bg-[#FF788D] text-white shadow-xs"
                  : "text-[#735E65] hover:text-[#2D2226]"
              }`}
            >
              Weekly Milestones
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="p-2 rounded-xl bg-[#FFF0F3] hover:bg-[#FFE5E9] text-[#D9455D] border border-[#FFD3DC] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Add New Goal"
          >
            <Plus className="w-4 h-4 text-[#FF788D]" />
            <span className="hidden md:inline">Add Goal</span>
          </button>
        </div>
      </div>

      {/* 2. Progress Overview Banner with Animated Circular Ring */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FFF5F7] via-[#FFF0F3] to-[#FFF9FA] border border-[#FFDADA] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D9455D]">
              {selectedFrequency === "daily" ? "Today's Completion" : "Weekly Target Completion"}
            </span>
            <span className="text-[10px] font-semibold bg-[#FFD3DC] text-[#9E2036] px-2 py-0.5 rounded-full">
              {completedCount} of {totalCount} Achieved
            </span>
          </div>
          <p className="text-xs text-[#735E65] max-w-lg">
            {getStageRecommendation()}
          </p>
        </div>

        {/* Big Animated Circular Progress Ring & Streak */}
        <div className="flex items-center gap-4 self-start md:self-auto">
          {/* Circular Ring */}
          <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 76 76">
              <defs>
                <linearGradient id="goalRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF8FA3" />
                  <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
                <linearGradient id="goalRingCompleteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Background Track */}
              <circle
                cx="38"
                cy="38"
                r="30"
                stroke="#FCD5DC"
                strokeWidth="6"
                fill="transparent"
              />

              {/* Progress Stroke */}
              <circle
                cx="38"
                cy="38"
                r="30"
                stroke={overallPercentage >= 100 ? "url(#goalRingCompleteGrad)" : "url(#goalRingGrad)"}
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 30}
                strokeDashoffset={(2 * Math.PI * 30) - (overallPercentage / 100) * (2 * Math.PI * 30)}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  transition: "stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease",
                }}
              />
            </svg>

            {/* Inner Ring Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {overallPercentage >= 100 ? (
                <div className="flex flex-col items-center animate-in zoom-in-75 duration-300">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  <span className="text-[10px] font-bold text-[#059669] leading-none mt-0.5">100%</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-[#2D2226] leading-none">{overallPercentage}%</span>
                  <span className="text-[8px] font-semibold text-[#8E7A81] mt-0.5">Done</span>
                </div>
              )}
            </div>

            {/* Pulsing halo when 100% achieved */}
            {overallPercentage >= 100 && (
              <div className="absolute inset-0 rounded-full border border-[#34D399] animate-ping opacity-40 pointer-events-none" />
            )}
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white border border-[#FFDADA] flex flex-col items-center justify-center shrink-0 shadow-2xs">
            <Flame className="w-4 h-4 text-[#FF788D]" />
            <span className="text-[10px] font-bold text-[#2D2226] mt-0.5">
              {selectedFrequency === "daily" ? "5d Streak" : "3w Streak"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Goals List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {currentGoals.map((goal) => {
          const isDone = goal.completed || goal.current >= goal.target;
          const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));

          // Mini ring calculations: radius = 15, circumference = 2 * Math.PI * 15 = 94.25
          const miniRadius = 15;
          const miniCircumference = 2 * Math.PI * miniRadius;
          const miniOffset = miniCircumference - (percent / 100) * miniCircumference;

          return (
            <div
              key={goal.id}
              className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden ${
                isDone
                  ? "bg-[#FFF9FA] border-[#FFD3DC] shadow-2xs"
                  : "bg-white border-[#F0DFE3] hover:border-[#FFB7C3]"
              }`}
            >
              {/* Top Row: Mini Ring Icon, Title, Checkbox */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  {/* Category Icon with Animated Mini Circular Progress Ring */}
                  <div className="relative w-10 h-10 shrink-0 mt-0.5 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 38 38">
                      {/* Background track circle */}
                      <circle
                        cx="19"
                        cy="19"
                        r={miniRadius}
                        stroke="#F5E4E8"
                        strokeWidth="3"
                        fill="transparent"
                      />
                      {/* Progress stroke */}
                      <circle
                        cx="19"
                        cy="19"
                        r={miniRadius}
                        stroke={isDone ? "#16A34A" : "#FF788D"}
                        strokeWidth="3"
                        strokeDasharray={miniCircumference}
                        strokeDashoffset={miniOffset}
                        strokeLinecap="round"
                        fill="transparent"
                        style={{
                          transition: "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease",
                        }}
                      />
                    </svg>

                    <div
                      className={`absolute inset-1.5 rounded-full flex items-center justify-center ${getCategoryBg(
                        goal.category
                      )}`}
                    >
                      {getCategoryIcon(goal.category)}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        isDone ? "text-[#2D2226] line-through opacity-75" : "text-[#2D2226]"
                      }`}
                    >
                      {goal.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-medium text-[#8E7A81]">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                      {goal.streakDays && goal.streakDays > 0 && (
                        <span className="text-[10px] font-semibold text-[#D9455D] bg-[#FFF0F3] px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" />
                          {goal.streakDays}d streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct 1-tap Toggle Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleGoalComplete(goal.id)}
                  className="text-[#FF788D] hover:scale-110 active:scale-95 transition-all p-1 cursor-pointer"
                  title={isDone ? "Mark Incomplete" : "Mark Complete"}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6 fill-[#FF788D] text-white" />
                  ) : (
                    <Circle className="w-6 h-6 text-[#FFB7C3] hover:text-[#FF788D]" />
                  )}
                </button>
              </div>

              {/* Progress Bar and Quick Increment Buttons */}
              <div className="space-y-2 pt-1 border-t border-[#F5E6E9]">
                <div className="w-full bg-[#FFF0F3] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone ? "bg-[#16A34A]" : "bg-[#FF788D]"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[11px] font-medium text-[#8E7A81]">
                    {percent}% Completed
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => decrementGoal(goal.id, goal.target > 10 ? 5 : 1)}
                      className="w-6 h-6 rounded-lg bg-[#FFF5F7] hover:bg-[#FFE5E9] text-[#735E65] border border-[#FFDADA] text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                      title="Decrease"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => incrementGoal(goal.id, goal.target > 10 ? 5 : 1)}
                      className="w-6 h-6 rounded-lg bg-[#FFF0F3] hover:bg-[#FFE5E9] text-[#D9455D] border border-[#FFD3DC] text-xs font-bold flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                      title="Increase"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteGoal(goal.id)}
                      className="w-6 h-6 rounded-lg bg-transparent hover:bg-rose-50 text-[#8E7A81] hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer ml-1"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Quick Shortcuts to Supporting Wellbeing Modules */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8E7A81]">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FF788D]" />
          <span>Synced with your daily log, hydration tracker & mindfulness tools.</span>
        </span>

        <div className="flex items-center gap-3 font-semibold text-[#D9455D]">
          {onOpenKitchen && (
            <button
              type="button"
              onClick={onOpenKitchen}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Utensils className="w-3 h-3 text-[#FF788D]" />
              <span>Nutrition Kitchen</span>
            </button>
          )}
          {onOpenBreathing && (
            <button
              type="button"
              onClick={onOpenBreathing}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Wind className="w-3 h-3 text-[#FF788D]" />
              <span>Breathwork Reset</span>
            </button>
          )}
          {onOpenTrack && (
            <button
              type="button"
              onClick={onOpenTrack}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Vitals Log →</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Add Custom Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#FFDADA] shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#FFDADA] pb-3.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FFF0F3] text-[#FF788D]">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#2D2226]">
                  Create Personal Goal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#8E7A81] hover:text-[#2D2226] p-1 rounded-lg hover:bg-[#FFF5F7] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              {/* Goal Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D2226] block">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Magnesium Glycinate at Bedtime"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FFF5F7] border border-[#FFDADA] rounded-xl text-[#2D2226] focus:outline-none focus:ring-1 focus:ring-[#FF788D]"
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D2226] block">
                  Health Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "movement", label: "Movement", icon: Activity },
                    { id: "hydration", label: "Hydration", icon: Droplets },
                    { id: "sleep", label: "Sleep", icon: Moon },
                    { id: "nutrition", label: "Nutrition", icon: Utensils },
                    { id: "mindfulness", label: "Mindfulness", icon: Wind },
                    { id: "vitals", label: "Vitals", icon: Heart },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewCategory(cat.id as GoalCategory)}
                      className={`p-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        newCategory === cat.id
                          ? "bg-[#FFF0F3] border-[#FF788D] text-[#D9455D] font-semibold shadow-2xs"
                          : "bg-white border-[#FFDADA] text-[#735E65] hover:bg-[#FFF5F7]"
                      }`}
                    >
                      <cat.icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D2226] block">
                    Target Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(parseFloat(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFF5F7] border border-[#FFDADA] rounded-xl text-[#2D2226] focus:outline-none focus:ring-1 focus:ring-[#FF788D]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D2226] block">
                    Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="e.g. mins, glasses, dose"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFF5F7] border border-[#FFDADA] rounded-xl text-[#2D2226] focus:outline-none focus:ring-1 focus:ring-[#FF788D]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#FFDADA]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#735E65] hover:bg-[#FFF5F7] border border-[#FFDADA] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#FF788D] hover:bg-[#E85C71] transition-all shadow-xs cursor-pointer"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
