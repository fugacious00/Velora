import React, { useState } from "react";
import { useHealth } from "../context/HealthContext";
import { LIFE_STAGES } from "../data/initialData";
import { LifeStage } from "../types";
import {
  Sparkles,
  CheckCircle2,
  Heart,
  Calendar,
  Baby,
  Activity,
  ShieldCheck,
  ArrowRight,
  X,
  Compass,
} from "lucide-react";

interface LifeMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LifeMapModal: React.FC<LifeMapModalProps> = ({ isOpen, onClose }) => {
  const { activeLifeStage, setLifeStage } = useHealth();
  const [selectedStage, setSelectedStage] = useState<LifeStage>(activeLifeStage);

  if (!isOpen) return null;

  const stageKeys = Object.keys(LIFE_STAGES) as LifeStage[];

  const handleApply = () => {
    setLifeStage(selectedStage);
    onClose();
  };

  const getStageIcon = (stage: LifeStage) => {
    switch (stage) {
      case "teen":
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
      case "cycle_hormonal":
        return <Calendar className="w-5 h-5 text-teal-600" />;
      case "ttc":
        return <Heart className="w-5 h-5 text-emerald-600" />;
      case "pregnant":
        return <Baby className="w-5 h-5 text-rose-500" />;
      case "postpartum":
        return <Activity className="w-5 h-5 text-amber-500" />;
      case "perimenopause":
      case "menopause":
        return <Compass className="w-5 h-5 text-violet-500" />;
      default:
        return <Calendar className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#FFDADA] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#FFDADA] flex items-start justify-between bg-[#FFF5F7]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D9455D] bg-[#FFF5F7] px-2.5 py-0.5 rounded-full border border-[#FFDADA]">
                Women's Life Map™
              </span>
              <span className="text-xs text-[#8E7A81]">Dynamic Personalization</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#2D2226]">
              Select Your Current Life Stage
            </h2>
            <p className="text-sm text-[#735E65] mt-1">
              Velora never assumes your stage permanently. Switch anytime to dynamically configure your health dashboard and prioritize relevant modules.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E7A81] hover:text-[#2D2226] hover:bg-[#FFF5F7] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-white">
          {stageKeys.map((key) => {
            const stage = LIFE_STAGES[key];
            const isSelected = selectedStage === key;
            const isCurrent = activeLifeStage === key;

            return (
              <div
                key={key}
                onClick={() => setSelectedStage(key)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? "border-[#FF788D] bg-[#FFF5F7] shadow-xs ring-1 ring-[#FF788D]/30"
                    : "border-[#FFDADA] hover:border-[#FF788D]/60 hover:bg-[#FFF5F7]/50"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-white shadow-xs border border-[#FFDADA] shrink-0">
                    {getStageIcon(key)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-[#2D2226]">
                        {stage.name}
                      </h3>
                      {isCurrent && (
                        <span className="text-[11px] font-medium bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA] px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-[#2D2226] mt-0.5">
                      {stage.tagline}
                    </p>
                    <p className="text-xs text-[#735E65] mt-1 leading-relaxed">
                      {stage.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {stage.prioritizedModules.map((mod, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium bg-white text-[#D9455D] border border-[#FFDADA] px-2 py-0.5 rounded-md"
                        >
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#FF788D] border-[#FF788D] text-white"
                          : "border-[#FFDADA] bg-white"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#FFDADA] bg-[#FFF5F7] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#8E7A81]">
            <ShieldCheck className="w-4 h-4 text-[#FF788D]" />
            <span>Encrypted local preference · Changes take effect immediately</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#735E65] hover:text-[#2D2226] hover:bg-[#FFF5F7] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#FF788D] hover:bg-[#E85C71] active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Switch Life Stage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
