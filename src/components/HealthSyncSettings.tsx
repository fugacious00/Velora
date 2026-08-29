import React, { useState } from "react";
import { useHealth } from "../context/HealthContext";
import { HealthSyncProvider, HealthSyncCategories, HealthSyncServiceState } from "../types";
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Zap,
  Sliders,
  Clock,
  Database,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  Lock,
  ExternalLink,
  HeartPulse,
} from "lucide-react";

interface CategoryMeta {
  key: keyof HealthSyncCategories;
  label: string;
  desc: string;
  iconText: string;
}

const SYNC_CATEGORIES_CONFIG: CategoryMeta[] = [
  {
    key: "cycleAndMenstruation",
    label: "Menstrual Cycle & Symptoms",
    desc: "Flow intensity, cramps, and luteal symptom logs",
    iconText: "🩸",
  },
  {
    key: "basalBodyTemperature",
    label: "Basal Body Temp (BBT)",
    desc: "Morning waking temperatures for ovulation timing",
    iconText: "🌡️",
  },
  {
    key: "sleepAnalysis",
    label: "Sleep Architecture & Quality",
    desc: "Duration, restorative sleep stages, and wake events",
    iconText: "🌙",
  },
  {
    key: "hydrationAndWater",
    label: "Hydration & Fluid Intake",
    desc: "Daily water glasses and hydration tracking",
    iconText: "💧",
  },
  {
    key: "activityAndSteps",
    label: "Activity & Movement",
    desc: "Daily active minutes and step count aggregates",
    iconText: "🏃",
  },
  {
    key: "vitalSigns",
    label: "Maternal & Cardiovascular Vitals",
    desc: "Resting heart rate and maternal blood pressure",
    iconText: "💓",
  },
];

export const HealthSyncSettings: React.FC = () => {
  const {
    syncPreferences,
    toggleSyncProvider,
    syncProviderNow,
    updateSyncCategories,
    updateSyncFrequency,
    disconnectSyncProvider,
  } = useHealth();

  const [expandedProvider, setExpandedProvider] = useState<HealthSyncProvider | null>(null);
  const [activeSimulationStep, setActiveSimulationStep] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    provider: HealthSyncProvider;
    text: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const handleToggle = async (provider: HealthSyncProvider, currentEnabled: boolean) => {
    const nextState = !currentEnabled;
    const providerTitle = "Google Fit & Health Connect";

    if (nextState) {
      setActiveSimulationStep(`Connecting to ${providerTitle} API Gateway...`);
      setTimeout(() => {
        setActiveSimulationStep(`Authorizing Zero-Knowledge biometric scopes for ${providerTitle}...`);
      }, 500);
      setTimeout(() => {
        setActiveSimulationStep(`Syncing baseline records...`);
      }, 900);
    }

    try {
      const res = await toggleSyncProvider(provider, nextState);
      setActiveSimulationStep(null);
      if (res.success) {
        setFeedbackMessage({
          provider,
          text: res.message,
          type: "success",
        });
        if (nextState) {
          setExpandedProvider(provider);
        }
      }
    } catch (err) {
      setActiveSimulationStep(null);
      setFeedbackMessage({
        provider,
        text: `Failed to connect with ${providerTitle}. Please try again.`,
        type: "error",
      });
    }

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  };

  const handleManualSync = async (provider: HealthSyncProvider) => {
    const providerTitle = "Google Health Connect";
    setActiveSimulationStep(`Pushing latest biometrics to ${providerTitle}...`);

    try {
      const res = await syncProviderNow(provider);
      setActiveSimulationStep(null);
      setFeedbackMessage({
        provider,
        text: `Synced ${res.recordsSynced} new data points with ${providerTitle}!`,
        type: "success",
      });
    } catch (err) {
      setActiveSimulationStep(null);
      setFeedbackMessage({
        provider,
        text: `Sync error with ${providerTitle}.`,
        type: "error",
      });
    }

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleCategoryToggle = (
    provider: HealthSyncProvider,
    categoryKey: keyof HealthSyncCategories,
    currentValue: boolean
  ) => {
    updateSyncCategories(provider, {
      [categoryKey]: !currentValue,
    });
  };

  const renderProviderCard = (
    provider: HealthSyncProvider,
    service: HealthSyncServiceState,
    brandColor: {
      border: string;
      bg: string;
      accent: string;
      badgeBg: string;
      badgeText: string;
    }
  ) => {
    const isExpanded = expandedProvider === provider;
    const isProcessing = service.apiStatus === "authorizing" || service.apiStatus === "syncing";

    return (
      <div
        key={provider}
        className={`rounded-2xl border transition-all duration-200 ${
          service.enabled
            ? "border-[#FF788D]/40 bg-white shadow-xs"
            : "border-[#FFDADA] bg-[#FFF5F7]/50"
        } p-4 space-y-3.5`}
      >
        {/* Header with Brand Icon, Status & Main Toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-emerald-50 border-emerald-200 text-emerald-600">
              <HeartPulse className="w-5 h-5 text-emerald-600" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-[#2D2226] font-serif">
                  Google Fit & Health Connect
                </h4>
                {service.connected ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Sync
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-[#8E7A81] bg-[#FFF5F7] border border-[#FFDADA] px-2 py-0.5 rounded-full">
                    Not Linked
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#735E65] mt-0.5">
                Sync with Android Health Connect & Google Fit ecosystem
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleToggle(provider, service.enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                service.enabled ? "bg-[#FF788D]" : "bg-[#D8C7CB]"
              } ${isProcessing ? "opacity-60 cursor-wait" : ""}`}
              role="switch"
              aria-checked={service.enabled}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  service.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Status / Last Sync / Actions Bar */}
        {service.enabled && (
          <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#FFDADA] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#735E65]">
                <Clock className="w-3.5 h-3.5 text-[#FF788D]" />
                <span>
                  Last synced:{" "}
                  <strong className="text-[#2D2226] font-medium">
                    {service.lastSyncedAt || "Just now"}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#8E7A81]">
                <Database className="w-3 h-3 text-[#D9455D]" />
                <span>{service.syncedRecordsCount} biometric entries linked</span>
              </div>
            </div>

            {/* Sync Now Button & Options Trigger */}
            <div className="flex items-center justify-between pt-1 border-t border-[#FFDADA]/60">
              <button
                type="button"
                onClick={() => setExpandedProvider(isExpanded ? null : provider)}
                className="text-[11px] font-semibold text-[#D9455D] hover:text-[#B83248] flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3 h-3" />
                <span>{isExpanded ? "Hide Sync Options" : "Configure Data Types & Frequency"}</span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleManualSync(provider)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#D9455D] bg-white hover:bg-[#FFF0F3] border border-[#FFDADA] rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`w-3 h-3 ${isProcessing ? "animate-spin text-[#FF788D]" : ""}`} />
                <span>{isProcessing ? "Syncing..." : "Sync Now"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Permissions & Granular Sync Controls */}
        {service.enabled && isExpanded && (
          <div className="pt-2 border-t border-[#FFDADA] space-y-3.5 animate-fadeIn">
            {/* Sync Frequency */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#735E65] block mb-1.5">
                Synchronization Frequency
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["realtime", "hourly", "daily", "manual"] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => updateSyncFrequency(provider, freq)}
                    className={`py-1 px-2 rounded-lg text-xs font-medium capitalize border transition-all cursor-pointer text-center ${
                      service.syncFrequency === freq
                        ? "bg-[#FF788D] text-white border-[#FF788D] shadow-2xs"
                        : "bg-white text-[#735E65] border-[#FFDADA] hover:bg-[#FFF5F7]"
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Granular Biometric Categories */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#735E65]">
                  Active Data Streams
                </label>
                <span className="text-[10px] text-[#8E7A81]">Toggle data to share/receive</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SYNC_CATEGORIES_CONFIG.map((cat) => {
                  const isChecked = !!service.categories[cat.key];
                  return (
                    <div
                      key={cat.key}
                      onClick={() => handleCategoryToggle(provider, cat.key, isChecked)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        isChecked
                          ? "bg-white border-[#FF788D]/60 shadow-2xs"
                          : "bg-[#FFF5F7]/40 border-[#FFDADA]/60 opacity-60"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors shrink-0 ${
                          isChecked
                            ? "bg-[#FF788D] border-[#FF788D] text-white"
                            : "bg-white border-[#D8C7CB]"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#2D2226] leading-tight flex items-center gap-1">
                          <span>{cat.iconText}</span>
                          <span className="truncate">{cat.label}</span>
                        </p>
                        <p className="text-[10px] text-[#735E65] leading-tight mt-0.5 line-clamp-1">
                          {cat.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between text-[11px] text-[#735E65]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Encrypted with Android Knox & Hardware Keystore</span>
              </div>
              <button
                type="button"
                onClick={() => disconnectSyncProvider(provider)}
                className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
              >
                Revoke Access
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-[#2D2226] uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#FF788D]" />
            <span>Health Ecosystem Synchronization</span>
          </h3>
          <p className="text-xs text-[#735E65] mt-0.5">
            Synchronize cycle baselines, basal body temperature, and sleep metrics with Google Fit & Health Connect.
          </p>
        </div>
      </div>

      {/* Active Step Progress Simulation Banner */}
      {activeSimulationStep && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2.5 text-xs animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
          <span className="font-medium">{activeSimulationStep}</span>
        </div>
      )}

      {/* Feedback Toast */}
      {feedbackMessage && !activeSimulationStep && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2 text-xs transition-all ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Provider Cards */}
      <div className="space-y-3">
        {renderProviderCard("google_fit", syncPreferences.googleFit, {
          border: "border-emerald-200",
          bg: "bg-white",
          accent: "text-emerald-600",
          badgeBg: "bg-emerald-50",
          badgeText: "text-emerald-700",
        })}
      </div>

      {/* Privacy Guarantee Footer */}
      <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#FFDADA] flex items-center justify-between text-xs text-[#735E65]">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#FF788D]" />
          <span>Biometric tokens are strictly zero-knowledge & locally encrypted.</span>
        </div>
        <span className="text-[10px] font-semibold text-[#D9455D] bg-white px-2 py-0.5 rounded border border-[#FFDADA]">
          v2.4 Health API Bridge
        </span>
      </div>
    </div>
  );
};

