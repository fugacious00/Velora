import React, { useState } from "react";
import { useHealth } from "../context/HealthContext";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  RefreshCw,
  Clock,
  Smartphone,
  Activity,
  Sliders,
} from "lucide-react";
import { SettingsModal } from "./SettingsModal";

export const PrivacyCenterView: React.FC = () => {
  const {
    privacyMatrix,
    updatePrivacyMatrix,
    auditLogs,
    exportAllHealthData,
    deleteHealthDataOnly,
    resetAllToFactory,
    user,
    discreetMode,
    toggleDiscreetMode,
    syncPreferences,
  } = useHealth();

  const [confirmDeleteRecords, setConfirmDeleteRecords] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isSyncSettingsOpen, setIsSyncSettingsOpen] = useState(false);

  const categories = [
    { name: "Cycle & Periods", desc: "Cycle lengths, flow volume, fertile window tracking" },
    { name: "Symptoms & Patterns", desc: "Cramps, headaches, acne, bloating, hot flashes" },
    { name: "Medical Records & Vault", desc: "Uploaded lab panels, prescriptions, ultrasounds" },
    { name: "Mood & Mental Wellbeing", desc: "Daily mood ratings, anxiety check-ins, stress tags" },
    { name: "Fitness & Movement", desc: "Workouts, step counts, resting sleep architecture" },
    { name: "Nutrition & Vitals", desc: "Meal reflections, prenatal vitamins, electrolytes" },
  ];

  const handleExport = () => {
    exportAllHealthData();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-[#2D2226] rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-[#443338]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FF788D]/20 text-[#FFDADA] border border-[#FF788D]/40 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF788D]" />
              <span>Zero-Knowledge Architecture</span>
            </span>
            <span className="text-xs text-[#FFDADA]/80">Strict Privacy First</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">
            Velora Privacy & Data Rights Center
          </h1>
          <p className="text-xs text-[#FFDADA]/90 max-w-xl leading-relaxed">
            "Your health. Your body. Your data. Your decision." You have granular cryptographic control over who and what can access your intimate health logs.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-[#FF788D] hover:bg-[#E85C71] active:scale-98 text-white rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{exportSuccess ? "Exported JSON!" : "Export Health Data"}</span>
        </button>
      </div>

      {/* 2. Privacy Mode & Discretion Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Discreet Mode */}
        <div className="bg-white p-5 rounded-2xl border border-[#FFDADA] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FFF5F7] text-[#FF788D]">
                {discreetMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#2D2226]">
                  Discreet Privacy Mode
                </h3>
                <p className="text-xs text-[#735E65]">
                  Masks biological terms
                </p>
              </div>
            </div>
            <button
              onClick={toggleDiscreetMode}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                discreetMode ? "bg-[#FF788D]" : "bg-[#FFDADA]"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform absolute top-0.5 ${
                  discreetMode ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#FFDADA] text-xs text-[#735E65] space-y-1">
            <span className="font-semibold text-[#2D2226] block">Discreet Masking Preview:</span>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#8E7A81] line-through">"Menstrual Day 18"</span>
              <span className="text-[#D9455D] font-semibold">→ "Day 18 (Rhythm)"</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#8E7A81] line-through">"Lochia Postpartum"</span>
              <span className="text-[#D9455D] font-semibold">→ "Recovery Vitals"</span>
            </div>
          </div>
        </div>

        {/* Biometric Security */}
        <div className="bg-white p-5 rounded-2xl border border-[#FFDADA] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FFF5F7] text-[#FF788D]">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#2D2226]">
                  Biometric Shield
                </h3>
                <p className="text-xs text-[#735E65]">
                  FaceID / TouchID lock
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA] rounded-full">
              Active
            </span>
          </div>

          <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#FFDADA] text-xs text-[#735E65]">
            <p>
              Session timeout automatically blurs screen after 15 minutes of background inactivity to prevent over-the-shoulder viewing.
            </p>
          </div>
        </div>

        {/* External Health Sync Bridges */}
        <div className="bg-white p-5 rounded-2xl border border-[#FFDADA] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FFF5F7] text-[#FF788D]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#2D2226]">
                  Health Bridges
                </h3>
                <p className="text-xs text-[#735E65]">
                  Google Fit & Health Connect
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSyncSettingsOpen(true)}
              className="text-xs font-semibold text-[#D9455D] hover:underline cursor-pointer"
            >
              Configure
            </button>
          </div>

          <div className="p-2.5 bg-[#FFF5F7] rounded-xl border border-[#FFDADA] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#735E65] flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                <span>Google Fit & Health Connect</span>
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  syncPreferences.googleFit.enabled
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-white text-[#8E7A81] border-[#FFDADA]"
                }`}
              >
                {syncPreferences.googleFit.enabled ? "Connected" : "Off"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Granular Data Permission Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#FFDADA] pb-3">
          <div>
            <h3 className="text-base font-semibold text-[#2D2226]">
              Granular Data Access Matrix
            </h3>
            <p className="text-xs text-[#735E65]">
              Control exactly which entities can access specific categories of your health logs.
            </p>
          </div>
          <span className="text-xs text-[#8E7A81]">Zero Data Sold Guarantee</span>
        </div>

        <div className="overflow-x-auto border border-[#FFDADA] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF5F7] text-[#2D2226] border-b border-[#FFDADA]">
              <tr>
                <th className="p-3 font-semibold">Health Data Domain</th>
                <th className="p-3 font-semibold text-center">You (Owner)</th>
                <th className="p-3 font-semibold text-center">Velora AI Copilot</th>
                <th className="p-3 font-semibold text-center">Doctor Brief Export</th>
                <th className="p-3 font-semibold text-center">Family / Partner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFDADA]">
              {categories.map((cat) => {
                const matrixRow = privacyMatrix.find((m) => m.category === cat.name);
                const aiAllowed = matrixRow?.ai ?? true;
                const doctorAllowed = matrixRow?.doctor ?? true;
                const familyAllowed = matrixRow?.family ?? false;

                return (
                  <tr key={cat.name} className="hover:bg-[#FFF5F7]/50">
                    <td className="p-3">
                      <p className="font-semibold text-[#2D2226]">{cat.name}</p>
                      <p className="text-[11px] text-[#735E65]">{cat.desc}</p>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-[#D9455D] font-bold bg-[#FFF5F7] px-2 py-0.5 rounded border border-[#FFDADA]">
                        Full
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={aiAllowed}
                        onChange={(e) =>
                          updatePrivacyMatrix(cat.name, "ai", e.target.checked)
                        }
                        className="w-4 h-4 accent-[#FF788D] cursor-pointer"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={doctorAllowed}
                        onChange={(e) =>
                          updatePrivacyMatrix(cat.name, "doctor", e.target.checked)
                        }
                        className="w-4 h-4 accent-[#FF788D] cursor-pointer"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={familyAllowed}
                        onChange={(e) =>
                          updatePrivacyMatrix(cat.name, "family", e.target.checked)
                        }
                        className="w-4 h-4 accent-[#FF788D] cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Real-time Audit Logs Stream */}
      <div className="bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#FFDADA] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FF788D]" />
            <h3 className="text-base font-semibold text-[#2D2226]">
              Real-Time Security & Access Audit Log
            </h3>
          </div>
          <span className="text-xs text-[#735E65]">Immutable Ledger</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#2D2226]">
                    {log.action}
                  </span>
                  <span className="text-[10px] bg-white text-[#D9455D] px-1.5 py-0.2 rounded uppercase font-medium border border-[#FFDADA]">
                    {log.system}
                  </span>
                </div>
                <p className="text-[11px] text-[#735E65]">{log.details}</p>
              </div>
              <span className="text-[10px] text-[#8E7A81] shrink-0">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Irreversible Deletion Zone */}
      <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <h3 className="text-base font-semibold">Data Deletion & Cryptographic Purge</h3>
        </div>
        <p className="text-xs text-rose-800 leading-relaxed">
          Velora believes in absolute data sovereignty. You can selectively erase all intimate health logs while keeping your account, or permanently delete everything from our servers immediately.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {confirmDeleteRecords ? (
            <div className="flex items-center gap-2 bg-[#FFF5F7] p-2 rounded-xl border border-rose-300">
              <span className="text-xs font-semibold text-rose-700">Are you sure?</span>
              <button
                onClick={() => {
                  deleteHealthDataOnly();
                  setConfirmDeleteRecords(false);
                }}
                className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Yes, Purge Health Logs
              </button>
              <button
                onClick={() => setConfirmDeleteRecords(false)}
                className="px-2 py-1 text-[#8E7A81] text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDeleteRecords(true)}
              className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Delete Health Records Only
            </button>
          )}

          {confirmDeleteAccount ? (
            <div className="flex items-center gap-2 bg-[#FFF5F7] p-2 rounded-xl border border-rose-300">
              <span className="text-xs font-semibold text-rose-700">Delete everything permanently?</span>
              <button
                onClick={() => {
                  resetAllToFactory();
                  setConfirmDeleteAccount(false);
                }}
                className="px-3 py-1 bg-rose-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Permanently Reset Account
              </button>
              <button
                onClick={() => setConfirmDeleteAccount(false)}
                className="px-2 py-1 text-[#8E7A81] text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDeleteAccount(true)}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Delete Account & All Data
            </button>
          )}
        </div>
      </div>

      {/* Sync Settings Modal */}
      <SettingsModal
        isOpen={isSyncSettingsOpen}
        onClose={() => setIsSyncSettingsOpen(false)}
        defaultTab="sync"
      />
    </div>
  );
};
