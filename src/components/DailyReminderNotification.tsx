import React, { useState, useEffect } from "react";
import { DailyHealthLog, LifeStage } from "../types";
import {
  Bell,
  CheckCircle2,
  Droplets,
  AlertCircle,
  Clock,
  X,
  Plus,
  Sliders,
  ChevronRight,
  Sparkles,
  Heart,
  Volume2,
} from "lucide-react";

interface DailyReminderNotificationProps {
  todayLog: DailyHealthLog;
  onSaveDailyLog: (log: Partial<DailyHealthLog>) => void;
  onOpenTrack: () => void;
  activeLifeStage: LifeStage;
}

const SETTINGS_KEY = "velora_reminder_settings_v1";
const DISMISSED_KEY_PREFIX = "velora_reminder_dismissed_";

export const DailyReminderNotification: React.FC<DailyReminderNotificationProps> = ({
  todayLog,
  onSaveDailyLog,
  onOpenTrack,
  activeLifeStage,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];

  // Configurable reminder threshold hour (e.g., 12 for 12 PM noon, or -1 for Always Active)
  const [thresholdHour, setThresholdHour] = useState<number>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.thresholdHour === "number") return parsed.thresholdHour;
      } catch (e) {
        // fallback
      }
    }
    return 12; // default to 12:00 PM noon
  });

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem(`${DISMISSED_KEY_PREFIX}${todayStr}`) === "true";
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours());

  // Update current hour periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Save settings
  const handleThresholdChange = (hour: number) => {
    setThresholdHour(hour);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ thresholdHour: hour }));
  };

  // Dismiss for today
  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`${DISMISSED_KEY_PREFIX}${todayStr}`, "true");
    setIsPopoverOpen(false);
  };

  // Undo dismiss
  const handleRestore = () => {
    setIsDismissed(false);
    localStorage.removeItem(`${DISMISSED_KEY_PREFIX}${todayStr}`);
  };

  // Check statuses
  const waterCount = todayLog.hydrationGlasses || 0;
  const isWaterLogged = waterCount > 0;

  // Symptom check: check if any severity, flags, or explicit notes were recorded
  const hasSymptomsOrNotes = Boolean(
    todayLog.crampsSeverity > 0 ||
    todayLog.headacheSeverity > 0 ||
    todayLog.bloating ||
    todayLog.acne ||
    todayLog.breastTenderness ||
    (todayLog.hotFlashesCount && todayLog.hotFlashesCount > 0) ||
    (todayLog.babyKicksCount && todayLog.babyKicksCount > 0) ||
    todayLog.flow !== "none" ||
    (todayLog.notes && todayLog.notes.trim().length > 0)
  );

  // Is past threshold hour? (If thresholdHour is -1, it means always trigger for test/demo)
  const isPastTime = thresholdHour === -1 || currentHour >= thresholdHour;

  // Pending reminder items
  const pendingItems: Array<{
    id: "water" | "symptoms";
    title: string;
    description: string;
    icon: React.ReactNode;
  }> = [];

  if (!isWaterLogged) {
    pendingItems.push({
      id: "water",
      title: "Log Hydration",
      description: "0 glasses logged today. Aim for 8 glasses.",
      icon: <Droplets className="w-4 h-4 text-[#0284C7]" />,
    });
  }

  if (!hasSymptomsOrNotes) {
    pendingItems.push({
      id: "symptoms",
      title: "Log Symptoms & Vitals",
      description: "Daily cycle, mood or body check-in not recorded yet.",
      icon: <Heart className="w-4 h-4 text-[#E11D48]" />,
    });
  }

  const hasPending = pendingItems.length > 0;
  const shouldHighlight = isPastTime && hasPending && !isDismissed;

  const formatThresholdName = (hour: number) => {
    if (hour === -1) return "Always Active (Test Mode)";
    if (hour === 0) return "12:00 AM (Midnight)";
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return "12:00 PM (Noon)";
    return `${hour - 12}:00 PM`;
  };

  return (
    <div className="relative inline-block">
      {/* 1. Main Reminder Pill */}
      {shouldHighlight ? (
        <button
          type="button"
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FFF0F3] text-[#D9455D] border border-[#FF788D] shadow-xs hover:bg-[#FFE5E9] active:scale-98 transition-all cursor-pointer animate-pulse"
          title="Click to view pending daily reminders"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF788D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E11D48]"></span>
          </span>
          <Bell className="w-3.5 h-3.5 text-[#FF788D]" />
          <span>
            {pendingItems.length} Reminder{pendingItems.length > 1 ? "s" : ""}
          </span>
          <span className="text-[10px] bg-white text-[#D9455D] border border-[#FFD3DC] px-1.5 py-0.2 rounded-full font-bold">
            Action Needed
          </span>
        </button>
      ) : hasPending && !isPastTime && !isDismissed ? (
        <button
          type="button"
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFF5F7] text-[#735E65] hover:text-[#2D2226] border border-[#FFDADA] hover:border-[#FFB7C3] transition-all cursor-pointer"
          title={`Reminders active after ${formatThresholdName(thresholdHour)}`}
        >
          <Clock className="w-3.5 h-3.5 text-[#8E7A81]" />
          <span>Reminder: {pendingItems.length} Pending</span>
        </button>
      ) : isDismissed ? (
        <button
          type="button"
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F9F9F9] text-[#8E7A81] border border-[#E5E5E5] hover:bg-[#F0F0F0] transition-all cursor-pointer"
          title="Reminders snoozed for today"
        >
          <Bell className="w-3.5 h-3.5 text-[#8E7A81]" />
          <span>Reminders Snoozed</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] hover:bg-[#DCFCE7] transition-all cursor-pointer"
          title="All daily checks completed"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Today Logged</span>
        </button>
      )}

      {/* 2. Interactive Dropdown / Popover Modal */}
      {isPopoverOpen && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/10 sm:hidden"
            onClick={() => setIsPopoverOpen(false)}
          />

          <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 z-50 w-80 sm:w-96 bg-white rounded-2xl p-5 border border-[#FFDADA] shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#FFDADA] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#FFF0F3] text-[#FF788D] border border-[#FFD3DC]">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D2226]">
                    Daily Logging Reminders
                  </h4>
                  <p className="text-[11px] text-[#8E7A81]">
                    Scheduled alert threshold: {formatThresholdName(thresholdHour)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPopoverOpen(false)}
                className="text-[#8E7A81] hover:text-[#2D2226] p-1 rounded-lg hover:bg-[#FFF5F7] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Checklist */}
            <div className="space-y-2.5">
              {/* Water Item */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isWaterLogged
                    ? "bg-[#F0FDF4] border-[#BBF7D0]"
                    : "bg-[#FFF5F7] border-[#FFDADA]"
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    <Droplets className="w-4 h-4 text-[#0284C7]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#2D2226]">
                        Hydration Intake
                      </span>
                      {isWaterLogged ? (
                        <span className="text-[10px] font-semibold text-[#16A34A] bg-white border border-[#BBF7D0] px-1.5 py-0.2 rounded">
                          {waterCount} glasses
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-[#D9455D] bg-[#FFF0F3] border border-[#FFD3DC] px-1.5 py-0.2 rounded">
                          Missing
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#735E65] mt-0.5">
                      {isWaterLogged
                        ? `${waterCount} of 8 glasses logged today`
                        : "Haven't logged any water today"}
                    </p>
                  </div>
                </div>

                {!isWaterLogged ? (
                  <button
                    type="button"
                    onClick={() => onSaveDailyLog({ hydrationGlasses: 1 })}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-bold shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+1 Glass</span>
                  </button>
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                )}
              </div>

              {/* Symptom Item */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  hasSymptomsOrNotes
                    ? "bg-[#F0FDF4] border-[#BBF7D0]"
                    : "bg-[#FFF5F7] border-[#FFDADA]"
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    <Heart className="w-4 h-4 text-[#E11D48]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#2D2226]">
                        Symptoms & Check-in
                      </span>
                      {hasSymptomsOrNotes ? (
                        <span className="text-[10px] font-semibold text-[#16A34A] bg-white border border-[#BBF7D0] px-1.5 py-0.2 rounded">
                          Recorded
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-[#D9455D] bg-[#FFF0F3] border border-[#FFD3DC] px-1.5 py-0.2 rounded">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#735E65] mt-0.5 truncate">
                      {hasSymptomsOrNotes
                        ? "Vitals, mood and symptoms saved"
                        : "No symptoms or cycle notes recorded"}
                    </p>
                  </div>
                </div>

                {!hasSymptomsOrNotes ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPopoverOpen(false);
                      onOpenTrack();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#FF788D] hover:bg-[#E85C71] text-white text-[11px] font-bold shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                  >
                    <span>Log Now</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                )}
              </div>
            </div>

            {/* Reminder Time Threshold Settings */}
            <div className="pt-2 border-t border-[#FFDADA] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#2D2226] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FF788D]" />
                  <span>Notify Me If Incomplete By:</span>
                </span>
                <select
                  value={thresholdHour}
                  onChange={(e) => handleThresholdChange(parseInt(e.target.value, 10))}
                  className="px-2 py-1 bg-[#FFF5F7] border border-[#FFDADA] rounded-lg text-xs font-semibold text-[#2D2226] focus:outline-none focus:ring-1 focus:ring-[#FF788D] cursor-pointer"
                >
                  <option value={-1}>⚡ Always Active (Test Mode)</option>
                  <option value={9}>9:00 AM (Morning)</option>
                  <option value={12}>12:00 PM (Noon)</option>
                  <option value={14}>2:00 PM (Afternoon)</option>
                  <option value={17}>5:00 PM (Early Evening)</option>
                  <option value={20}>8:00 PM (Night)</option>
                </select>
              </div>
              <p className="text-[10px] text-[#8E7A81]">
                Reminders highlight the pill once current time ({currentHour}:00) passes your chosen cutoff.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#FFDADA] text-xs">
              {isDismissed ? (
                <button
                  type="button"
                  onClick={handleRestore}
                  className="text-[#D9455D] hover:underline font-semibold cursor-pointer"
                >
                  Un-snooze Alerts
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-[#8E7A81] hover:text-[#2D2226] font-medium cursor-pointer"
                >
                  Snooze for Today
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsPopoverOpen(false);
                  onOpenTrack();
                }}
                className="font-bold text-[#D9455D] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Full Daily Tracker</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
