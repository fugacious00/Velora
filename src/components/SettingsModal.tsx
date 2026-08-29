import React, { useState } from "react";
import { useHealth } from "../context/HealthContext";
import {
  Settings,
  X,
  User,
  Sliders,
  Shield,
  Key,
  LogOut,
  LogIn,
  CheckCircle2,
  Lock,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import { HealthSyncSettings } from "./HealthSyncSettings";
import { LogoutConfirmationModal } from "./LogoutConfirmationModal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "profile" | "sync" | "security";
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "profile",
}) => {
  const { user, updateUser, logout } = useHealth();

  const [activeTab, setActiveTab] = useState<"profile" | "sync" | "security">(defaultTab);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [cycleLength, setCycleLength] = useState(user.cycleLength || 29);
  const [periodLength, setPeriodLength] = useState(user.periodLength || 5);
  const [isSaved, setIsSaved] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      cycleLength,
      periodLength,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#FFDADA] space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#FFDADA] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFF5F7] text-[#FF788D] border border-[#FFDADA]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#2D2226]">
                Velora System & Health Settings
              </h2>
              <p className="text-xs text-[#735E65]">
                Manage biometrics, Google Fit sync, and account security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8E7A81] hover:text-[#2D2226] rounded-lg hover:bg-[#FFF5F7] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-[#FFDADA] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "bg-[#FF788D] text-white shadow-2xs"
                : "bg-[#FFF5F7] text-[#735E65] hover:text-[#2D2226] border border-[#FFDADA]"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Baselines</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sync")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "sync"
                ? "bg-[#FF788D] text-white shadow-2xs"
                : "bg-[#FFF5F7] text-[#735E65] hover:text-[#2D2226] border border-[#FFDADA]"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Health Connect & Fit Sync</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "security"
                ? "bg-[#FF788D] text-white shadow-2xs"
                : "bg-[#FFF5F7] text-[#735E65] hover:text-[#2D2226] border border-[#FFDADA]"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Auth & Security</span>
          </button>
        </div>

        {/* Tab 1: Profile & Baselines */}
        {activeTab === "profile" && (
          <form onSubmit={handleSave} className="space-y-4 pt-1">
            {/* Profile Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#2D2226] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#FF788D]" />
                <span>User Profile</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#2D2226] block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226] focus:outline-none focus:ring-1 focus:ring-[#FF788D]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#2D2226] block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226] focus:outline-none focus:ring-1 focus:ring-[#FF788D]"
                  />
                </div>
              </div>
            </div>

            {/* Cycle Calibration Section */}
            <div className="space-y-3 pt-3 border-t border-[#FFDADA]">
              <h3 className="text-xs font-bold text-[#2D2226] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#FF788D]" />
                <span>Cycle & Physiological Baselines</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#2D2226] block mb-1">
                    Average Cycle Length (Days)
                  </label>
                  <input
                    type="number"
                    min="21"
                    max="45"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226] focus:outline-none focus:ring-1 focus:ring-[#FF788D]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#2D2226] block mb-1">
                    Average Period Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={periodLength}
                    onChange={(e) => setPeriodLength(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226] focus:outline-none focus:ring-1 focus:ring-[#FF788D]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#FFDADA]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#735E65] hover:bg-[#FFF5F7] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#FF788D] hover:bg-[#E85C71] rounded-xl cursor-pointer shadow-xs"
              >
                {isSaved ? "Saved!" : "Save Profile"}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Health Sync Settings */}
        {activeTab === "sync" && (
          <div className="pt-1">
            <HealthSyncSettings />
          </div>
        )}

        {/* Tab 3: Security & Session */}
        {activeTab === "security" && (
          <div className="space-y-4 pt-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#2D2226] uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#FF788D]" />
                  <span>Clerk Authentication & Session</span>
                </h3>
                <span className="text-[10px] font-semibold text-[#D9455D] bg-[#FFF5F7] px-2 py-0.5 rounded border border-[#FFDADA]">
                  Signed In
                </span>
              </div>

              <div className="p-3.5 bg-[#FFF5F7] rounded-xl border border-[#FFDADA] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#735E65]">Authenticated Identity:</span>
                  <span className="font-semibold text-[#2D2226]">
                    {user.email || "maya.lin@velora.health"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#735E65]">Session Encryption:</span>
                  <span className="text-[#D9455D] font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#FF788D]" />
                    <span>AES-256 GCM Client Token</span>
                  </span>
                </div>

                <div className="pt-2.5 border-t border-[#FFDADA] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Velora</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Prompt */}
      <LogoutConfirmationModal
        isOpen={showLogoutConfirm}
        userName={user.name}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onClose();
          logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

