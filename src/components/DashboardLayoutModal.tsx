import React, { useState } from "react";
import {
  GripVertical,
  X,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  MoveUp,
  MoveDown,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Bookmark,
} from "lucide-react";

export interface DashboardCardItem {
  id: string;
  title: string;
  category: "vitals" | "trends" | "insights" | "tools" | "clinical";
  description: string;
  visible: boolean;
}

export const DEFAULT_DASHBOARD_CARDS: DashboardCardItem[] = [
  {
    id: "affirmation",
    title: "Daily Affirmation & Mindfulness",
    category: "insights",
    description: "Positive stage-specific daily affirmation and guidance",
    visible: true,
  },
  {
    id: "metrics_strip",
    title: "Key Vitals & Rhythm Strip",
    category: "vitals",
    description: "Quick 4-metric strip: Cycle/Pregnancy rhythm, Sleep, Mood, Energy",
    visible: true,
  },
  {
    id: "daily_insight",
    title: "AI Health Insight & Contextual Tip",
    category: "insights",
    description: "Personalized daily health tip based on active phase and symptoms",
    visible: true,
  },
  {
    id: "stage_hero",
    title: "Life-Stage Physiology & Status",
    category: "clinical",
    description: "Stage-specific interactive tracker (Pregnancy, Postpartum, TTC, Cycle)",
    visible: true,
  },
  {
    id: "seven_day_trend",
    title: "7-Day Rhythm & Vitality Trend",
    category: "trends",
    description: "Longitudinal temperature, symptoms, and sleep multi-metric graph",
    visible: true,
  },
  {
    id: "sleep_summary",
    title: "Sleep Architecture & Circadian Card",
    category: "vitals",
    description: "Sleep stages, restorative quality, and circadian alignment",
    visible: true,
  },
  {
    id: "hydration_trends",
    title: "Weekly Hydration Trends Chart",
    category: "trends",
    description: "Visual bar chart of weekly fluid intake vs daily target",
    visible: true,
  },
  {
    id: "health_goals",
    title: "Personal Health Goals Tracker",
    category: "tools",
    description: "Target tracking for hydration, sleep, movement, and wellness",
    visible: true,
  },
  {
    id: "body_pattern",
    title: "Body Pattern Engine™",
    category: "clinical",
    description: "Non-diagnostic observed biological relationships across logged data",
    visible: true,
  },
  {
    id: "day_glance",
    title: "Your Day & Quick Check-in",
    category: "tools",
    description: "Daily vitals summary and 1-tap symptom toggles",
    visible: true,
  },
  {
    id: "recent_symptoms",
    title: "Recent Symptoms Summary",
    category: "clinical",
    description: "Frequency and timeline of your latest reported symptoms",
    visible: true,
  },
  {
    id: "water_quick_log",
    title: "Hydration Quick-Log Tracker",
    category: "tools",
    description: "Glass visualizer and 1-tap water intake logger",
    visible: true,
  },
  {
    id: "copilot_prompt",
    title: "Velora Health Copilot Assistant",
    category: "tools",
    description: "Instant prompt bar for safe health and nutrition inquiries",
    visible: true,
  },
  {
    id: "wellbeing_tools",
    title: "Wellbeing & Reset Tools",
    category: "tools",
    description: "Quick access to Kitchen Nutrition and Nervous System Reset",
    visible: true,
  },
  {
    id: "vault_summary",
    title: "Encrypted Health Vault Storage",
    category: "clinical",
    description: "Index of secure clinical records and lab documents",
    visible: true,
  },
  {
    id: "timeline_preview",
    title: "Longitudinal Timeline Highlights",
    category: "trends",
    description: "Chronological medical milestones and cycle history",
    visible: true,
  },
];

interface DashboardLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: DashboardCardItem[];
  onSaveCards: (updatedCards: DashboardCardItem[]) => void;
  onResetDefault: () => void;
}

export const DashboardLayoutModal: React.FC<DashboardLayoutModalProps> = ({
  isOpen,
  onClose,
  cards,
  onSaveCards,
  onResetDefault,
}) => {
  const [localCards, setLocalCards] = useState<DashboardCardItem[]>(cards);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");

  if (!isOpen) return null;

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...localCards];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, movedItem);

    setLocalCards(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localCards.length) return;

    const updated = [...localCards];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setLocalCards(updated);
  };

  const handleToggleVisibility = (id: string) => {
    setLocalCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c))
    );
  };

  const handleApplyPreset = (presetType: "default" | "vitals" | "clinical" | "minimal") => {
    if (presetType === "default") {
      setLocalCards(DEFAULT_DASHBOARD_CARDS);
      return;
    }

    if (presetType === "vitals") {
      // Prioritize vitals and daily check-ins
      const priorityIds = [
        "metrics_strip",
        "day_glance",
        "sleep_summary",
        "water_quick_log",
        "health_goals",
        "seven_day_trend",
        "hydration_trends",
        "stage_hero",
        "recent_symptoms",
        "daily_insight",
        "affirmation",
        "body_pattern",
        "copilot_prompt",
        "wellbeing_tools",
        "vault_summary",
        "timeline_preview",
      ];
      reorderWithPriority(priorityIds);
      return;
    }

    if (presetType === "clinical") {
      // Prioritize clinical observations & doctor preparation
      const priorityIds = [
        "stage_hero",
        "body_pattern",
        "recent_symptoms",
        "seven_day_trend",
        "vault_summary",
        "timeline_preview",
        "metrics_strip",
        "daily_insight",
        "day_glance",
        "sleep_summary",
        "copilot_prompt",
        "health_goals",
        "water_quick_log",
        "hydration_trends",
        "wellbeing_tools",
        "affirmation",
      ];
      reorderWithPriority(priorityIds);
      return;
    }

    if (presetType === "minimal") {
      // Minimal high-focus view
      const activeIds = ["metrics_strip", "stage_hero", "day_glance", "daily_insight", "copilot_prompt"];
      const updated = localCards.map((c) => ({
        ...c,
        visible: activeIds.includes(c.id),
      }));
      setLocalCards(updated);
    }
  };

  const reorderWithPriority = (priorityIds: string[]) => {
    const cardMap = new Map<string, DashboardCardItem>(
      localCards.map((c) => [c.id, c])
    );
    const newOrdered: DashboardCardItem[] = [];

    priorityIds.forEach((id) => {
      const item = cardMap.get(id);
      if (item) {
        newOrdered.push({ ...item, visible: true });
        cardMap.delete(id);
      }
    });

    cardMap.forEach((card) => {
      newOrdered.push(card);
    });

    setLocalCards(newOrdered);
  };

  const handleSave = () => {
    onSaveCards(localCards);
    onClose();
  };

  const categoryLabels: Record<string, { label: string; color: string }> = {
    vitals: { label: "Vitals", color: "bg-blue-50 text-blue-700 border-blue-200" },
    trends: { label: "Trends", color: "bg-purple-50 text-purple-700 border-purple-200" },
    insights: { label: "Insights", color: "bg-amber-50 text-amber-700 border-amber-200" },
    tools: { label: "Tools", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    clinical: { label: "Clinical", color: "bg-rose-50 text-rose-700 border-rose-200" },
  };

  const filteredCards =
    activeCategoryFilter === "all"
      ? localCards
      : localCards.filter((c) => c.category === activeCategoryFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#FFDADA] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[#FFDADA] bg-[#FFF5F7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF788D] text-white shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#2D2226]">
                Customize Dashboard Layout
              </h3>
              <p className="text-xs text-[#8E7A81]">
                Drag and drop cards to reorder your dashboard overview
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8E7A81] hover:text-[#2D2226] rounded-xl hover:bg-[#FFE5E9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets & Category Filters */}
        <div className="p-3.5 bg-[#FFF9FA] border-b border-[#FFDADA] space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-[#2D2226] flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#FF788D]" />
              <span>Layout Presets:</span>
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleApplyPreset("default")}
                className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-[#FFF0F3] border border-[#FFDADA] rounded-lg text-[#2D2226] transition-colors cursor-pointer"
              >
                Standard Flow
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("vitals")}
                className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-[#FFF0F3] border border-[#FFDADA] rounded-lg text-[#0369A1] transition-colors cursor-pointer"
              >
                Vitals & Habits First
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("clinical")}
                className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-[#FFF0F3] border border-[#FFDADA] rounded-lg text-[#D9455D] transition-colors cursor-pointer"
              >
                Clinical & Symptoms
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("minimal")}
                className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-[#FFF0F3] border border-[#FFDADA] rounded-lg text-[#735E65] transition-colors cursor-pointer"
              >
                Minimal Focus
              </button>
            </div>
          </div>
        </div>

        {/* Card Reorder List (Drag & Drop + Up/Down) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
          <div className="text-xs text-[#8E7A81] flex items-center justify-between pb-1">
            <span>Drag handle or use buttons to reposition. Click eye icon to show/hide.</span>
            <span className="font-semibold text-[#D9455D]">
              {localCards.filter((c) => c.visible).length} / {localCards.length} Visible
            </span>
          </div>

          {localCards.map((card, index) => {
            const isDragging = draggedIndex === index;
            const isOver = dragOverIndex === index;
            const badge = categoryLabels[card.category] || {
              label: card.category,
              color: "bg-gray-50 text-gray-700 border-gray-200",
            };

            return (
              <div
                key={card.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  isDragging
                    ? "opacity-40 border-dashed border-[#FF788D] bg-[#FFF5F7] scale-98"
                    : isOver
                    ? "border-2 border-[#FF788D] bg-[#FFF0F3] shadow-md"
                    : card.visible
                    ? "bg-white border-[#FFDADA] hover:border-[#FF788D] shadow-2xs"
                    : "bg-[#FAFAFA] border-gray-200 opacity-60"
                }`}
              >
                {/* Drag Grip Handle */}
                <div
                  className="cursor-grab active:cursor-grabbing p-1.5 text-[#8E7A81] hover:text-[#FF788D] hover:bg-[#FFF5F7] rounded-lg transition-colors shrink-0"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Card Position Number */}
                <div className="w-5 h-5 rounded-full bg-[#FFF5F7] border border-[#FFDADA] text-[#D9455D] text-[10px] font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </div>

                {/* Card Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-xs font-bold truncate ${
                        card.visible ? "text-[#2D2226]" : "text-gray-400 line-through"
                      }`}
                    >
                      {card.title}
                    </h4>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8E7A81] truncate mt-0.5">
                    {card.description}
                  </p>
                </div>

                {/* Actions: Reorder Buttons & Visibility Toggle */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-[#735E65] hover:text-[#2D2226] hover:bg-[#FFF5F7] disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                    title="Move up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === localCards.length - 1}
                    className="p-1.5 rounded-lg text-[#735E65] hover:text-[#2D2226] hover:bg-[#FFF5F7] disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                    title="Move down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(card.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      card.visible
                        ? "text-[#FF788D] hover:bg-[#FFF5F7]"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    }`}
                    title={card.visible ? "Hide card" : "Show card"}
                  >
                    {card.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#FFDADA] bg-[#FFF5F7] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onResetDefault();
              setLocalCards(DEFAULT_DASHBOARD_CARDS);
            }}
            className="text-xs font-semibold text-[#8E7A81] hover:text-[#D9455D] flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#735E65] hover:bg-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-[#FF788D] hover:bg-[#E85C71] active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Layout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
