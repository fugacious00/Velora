import React, { useState } from "react";
import { HealthProvider, useHealth } from "./context/HealthContext";
import { DashboardView } from "./components/DashboardView";
import { TrackView } from "./components/TrackView";
import { TimelineView } from "./components/TimelineView";
import { VaultView } from "./components/VaultView";
import { CopilotView } from "./components/CopilotView";
import { PrivacyCenterView } from "./components/PrivacyCenterView";
import { LifeMapModal } from "./components/LifeMapModal";
import { DoctorBriefModal } from "./components/DoctorBriefModal";
import { KitchenNutritionModal } from "./components/KitchenNutritionModal";
import { BreathingModal } from "./components/BreathingModal";
import { SettingsModal } from "./components/SettingsModal";
import { LogoutConfirmationModal } from "./components/LogoutConfirmationModal";
import { AuthView, VeloraBrandEmblem } from "./components/AuthView";
import { HealthInsightsAlertPill } from "./components/HealthInsightsAlertPill";
import { LIFE_STAGES } from "./data/initialData";
import {
  LayoutDashboard,
  PlusCircle,
  Calendar,
  ShieldCheck,
  Sparkles,
  FileText,
  Lock,
  Compass,
  Eye,
  EyeOff,
  Wind,
  Settings,
  User,
  Heart,
  Menu,
  X,
  LogOut,
  Utensils,
  ChevronRight,
  MoreHorizontal,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

type NavTab = "dashboard" | "track" | "timeline" | "vault" | "copilot" | "privacy";

const MainAppLayout: React.FC = () => {
  const { user, activeLifeStage, toggleDiscreetMode, formatTerm, logout } = useHealth();
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string | undefined>(undefined);
  const [isRailCollapsed, setIsRailCollapsed] = useState(false);

  // Modals and Action Sheet state
  const [isLifeMapOpen, setIsLifeMapOpen] = useState(false);
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [isKitchenOpen, setIsKitchenOpen] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const stageConfig = LIFE_STAGES[activeLifeStage] || LIFE_STAGES.cycle_hormonal;

  const handleOpenCopilotWithPrompt = (prompt?: string) => {
    setCopilotInitialPrompt(prompt);
    setActiveTab("copilot");
    setIsMoreSheetOpen(false);
  };

  const primaryNavTabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "dashboard", label: "Today", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "timeline", label: "Timeline", icon: <Calendar className="w-5 h-5" /> },
    { id: "track", label: "Log", icon: <Plus className="w-6 h-6" /> },
    { id: "vault", label: "Vault", icon: <ShieldCheck className="w-5 h-5" /> },
    { id: "copilot", label: "Copilot", icon: <Sparkles className="w-5 h-5" />, badge: "AI" },
  ];

  const sidebarNavItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "dashboard", label: "Today's Health", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "track", label: "Daily Log & Symptoms", icon: <PlusCircle className="w-4 h-4" /> },
    { id: "timeline", label: "Health Timeline", icon: <Calendar className="w-4 h-4" /> },
    { id: "vault", label: "Encrypted Health Vault", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "copilot", label: "Clinical Copilot", icon: <Sparkles className="w-4 h-4" />, badge: "AI Guard" },
    { id: "privacy", label: "Privacy Center", icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#FFF9FA] text-[#2D2226] overflow-hidden font-sans selection:bg-[#FFDADA] selection:text-[#2D2226]">
      {/* 1. DESKTOP / IPAD APP NAVIGATION RAIL */}
      <aside
        className={`hidden md:flex flex-col transition-all duration-300 bg-white text-[#2D2226] border-r border-[#FFDADA] shrink-0 select-none shadow-xs z-20 ${
          isRailCollapsed ? "w-20" : "w-64 lg:w-72"
        }`}
      >
        {/* App Title Header & Rail Toggle Button */}
        <div className="p-4 sm:p-5 border-b border-[#FFDADA] flex items-center justify-between gap-2">
          {!isRailCollapsed ? (
            <div className="flex items-center gap-3 min-w-0">
              <VeloraBrandEmblem size="sm" />
              <div className="min-w-0">
                <div className="text-xl font-bold tracking-tight text-[#2D2226] font-serif leading-tight truncate">
                  Velora
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[#FF788D] font-semibold">
                  Health OS
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto">
              <VeloraBrandEmblem size="sm" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsRailCollapsed(!isRailCollapsed)}
            className="p-1.5 rounded-xl bg-[#FFF5F7] hover:bg-[#FFEDF1] text-[#8E7A81] hover:text-[#2D2226] border border-[#FFDADA] transition-all cursor-pointer shadow-2xs shrink-0"
            title={isRailCollapsed ? "Expand navigation rail" : "Collapse navigation rail"}
          >
            {isRailCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#FF788D]" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Life Stage Interactive Card */}
        <div className="p-3 border-b border-[#FFDADA]">
          <button
            onClick={() => setIsLifeMapOpen(true)}
            className={`w-full rounded-2xl bg-[#FFF5F7] hover:bg-[#FFEDF1] active:scale-[0.98] border border-[#FFDADA] transition-all text-left group cursor-pointer shadow-2xs ${
              isRailCollapsed ? "p-2 flex flex-col items-center" : "p-3"
            }`}
            title="Women's Life Map™"
          >
            {!isRailCollapsed ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF788D] flex items-center gap-1">
                    <Compass className="w-3 h-3 group-hover:rotate-45 transition-transform" />
                    <span>Women's Life Map™</span>
                  </span>
                  <span className="text-[9px] text-[#8E7A81] bg-white px-1.5 py-0.5 rounded-md border border-[#FFDADA]">
                    Switch
                  </span>
                </div>
                <div className="text-xs font-bold text-[#2D2226] mt-1 truncate">
                  {stageConfig.name}
                </div>
                <p className="text-[10px] text-[#8E7A81] truncate mt-0.5">
                  Active biological calibration
                </p>
              </>
            ) : (
              <Compass className="w-5 h-5 text-[#FF788D] group-hover:rotate-45 transition-transform" />
            )}
          </button>
        </div>

        {/* App Navigation Rail Tabs */}
        <nav className="flex-1 p-2.5 sm:p-3.5 space-y-1 overflow-y-auto no-scrollbar">
          {!isRailCollapsed && (
            <div className="text-[10px] font-bold text-[#8E7A81] uppercase tracking-wider px-3 py-1">
              Navigation
            </div>
          )}
          {sidebarNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "copilot") setCopilotInitialPrompt(undefined);
                  setActiveTab(item.id);
                }}
                title={item.label}
                className={`w-full flex items-center rounded-xl text-xs transition-all cursor-pointer ${
                  isRailCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"
                } ${
                  isActive
                    ? "bg-[#FFDADA]/60 text-[#D9455D] font-bold border border-[#FFDADA] shadow-2xs"
                    : "text-[#735E65] hover:text-[#2D2226] hover:bg-[#FFF5F7] font-medium"
                }`}
              >
                <div className={`flex items-center ${isRailCollapsed ? "justify-center" : "gap-3"}`}>
                  <span className={isActive ? "text-[#FF788D]" : "text-[#8E7A81]"}>
                    {item.icon}
                  </span>
                  {!isRailCollapsed && <span>{item.label}</span>}
                </div>
                {!isRailCollapsed && item.badge && (
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                      isActive
                        ? "bg-[#FF788D] text-white"
                        : "bg-[#FFDADA] text-[#D9455D] border border-[#FFDADA]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {!isRailCollapsed && (
            <div className="pt-3">
              <div className="text-[10px] font-bold text-[#8E7A81] uppercase tracking-wider px-3 py-1">
                Quick Clinical Tools
              </div>
              <div className="space-y-1 pt-1">
                <button
                  onClick={() => setIsBriefOpen(true)}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-[#D9455D] hover:bg-[#FFEDF1] bg-[#FFF5F7] border border-[#FFDADA] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#FF788D]" />
                    <span>Doctor Brief</span>
                  </div>
                  <span className="text-[10px] bg-white text-[#FF788D] px-1.5 py-0.5 rounded border border-[#FFDADA]">
                    PDF Ready
                  </span>
                </button>

                <button
                  onClick={() => setIsKitchenOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-[#735E65] hover:text-[#2D2226] hover:bg-[#FFF5F7] transition-colors cursor-pointer"
                >
                  <Utensils className="w-4 h-4 text-[#FF788D]" />
                  <span>Kitchen & Nutrition</span>
                </button>

                <button
                  onClick={() => setIsBreathingOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-[#735E65] hover:text-[#2D2226] hover:bg-[#FFF5F7] transition-colors cursor-pointer"
                >
                  <Wind className="w-4 h-4 text-[#FF788D]" />
                  <span>Nervous System Reset</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Rail User & Security Bar */}
        <div className="p-3 border-t border-[#FFDADA] space-y-2 bg-white">
          {!isRailCollapsed ? (
            <>
              <div className="flex items-center justify-between px-2 py-1 text-xs">
                <button
                  onClick={toggleDiscreetMode}
                  className="flex items-center gap-2 text-[#735E65] hover:text-[#2D2226] transition-colors cursor-pointer"
                  title="Mask sensitive biological terms in public"
                >
                  {user.discreetMode ? (
                    <EyeOff className="w-3.5 h-3.5 text-[#FF788D]" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-[#8E7A81]" />
                  )}
                  <span className="text-[11px] font-medium">Discreet Mode</span>
                </button>
                <button
                  onClick={toggleDiscreetMode}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer ${
                    user.discreetMode
                      ? "bg-[#FFDADA] text-[#D9455D] border border-[#FF788D]/40"
                      : "bg-[#FFF5F7] text-[#8E7A81] border border-[#FFDADA]"
                  }`}
                >
                  {user.discreetMode ? "ON" : "OFF"}
                </button>
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-[#FFF5F7] hover:bg-[#FFEDF1] border border-[#FFDADA] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#FF788D] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                      {user.name[0] || "U"}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-[#2D2226] truncate">{user.name}</p>
                      <p className="text-[10px] text-[#8E7A81] truncate">Encrypted Vault · Pro</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8E7A81]" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-9 h-9 rounded-xl bg-[#FF788D] text-white flex items-center justify-center font-bold text-xs shadow-xs"
                title={`${user.name} - Settings`}
              >
                {user.name[0] || "U"}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN APP VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#FFF9FA] relative">
        {/* SCROLLABLE APP VIEWPORT (Native App Framing with Bottom Tab Safe Area) */}
        <main className="flex-1 overflow-y-auto no-scrollbar px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-28 md:pb-8 bg-[#FFF9FA] overscroll-contain">
          <div className="max-w-7xl mx-auto w-full">
            {activeTab === "dashboard" && (
              <DashboardView
                onOpenLifeMap={() => setIsLifeMapOpen(true)}
                onOpenTrack={() => setActiveTab("track")}
                onOpenCopilot={handleOpenCopilotWithPrompt}
                onOpenBrief={() => setIsBriefOpen(true)}
                onOpenVault={() => setActiveTab("vault")}
                onOpenBreathing={() => setIsBreathingOpen(true)}
                onOpenKitchen={() => setIsKitchenOpen(true)}
              />
            )}

            {activeTab === "track" && (
              <TrackView onSaved={() => setActiveTab("dashboard")} />
            )}

            {activeTab === "timeline" && <TimelineView />}

            {activeTab === "vault" && <VaultView />}

            {activeTab === "copilot" && (
              <CopilotView
                initialPrompt={copilotInitialPrompt}
                onOpenBrief={() => setIsBriefOpen(true)}
              />
            )}

            {activeTab === "privacy" && <PrivacyCenterView />}
          </div>
        </main>

        {/* 3. NATIVE MOBILE BOTTOM TAB BAR (App Dock) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#FFDADA] px-2 py-1.5 shadow-lg">
          <nav className="flex items-center justify-around relative">
            {primaryNavTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isCenterLog = tab.id === "track";

              if (isCenterLog) {
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex flex-col items-center justify-center -mt-5 cursor-pointer group"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 ${
                        isActive
                          ? "bg-gradient-to-tr from-[#E85C71] to-[#FF788D] text-white ring-4 ring-[#FFDADA]"
                          : "bg-[#FF788D] text-white hover:bg-[#E85C71]"
                      }`}
                    >
                      <Plus className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#D9455D] mt-0.5">
                      Log
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "copilot") setCopilotInitialPrompt(undefined);
                    setActiveTab(tab.id);
                  }}
                  className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
                    isActive ? "text-[#D9455D]" : "text-[#8E7A81] hover:text-[#2D2226]"
                  }`}
                >
                  <div className="relative">
                    {tab.icon}
                    {tab.badge && (
                      <span className="absolute -top-1 -right-2 text-[8px] bg-[#FF788D] text-white px-1 py-0.2 rounded-full font-bold">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      isActive ? "font-bold text-[#D9455D]" : "font-medium"
                    }`}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF788D] mt-0.5" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 4. MOBILE ACTION SHEET / MORE DRAWER */}
      {isMoreSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMoreSheetOpen(false)}
          />

          {/* Sheet Body */}
          <div className="relative bg-white rounded-t-3xl border-t border-[#FFDADA] p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-5">
            {/* Sheet Handle */}
            <div className="w-10 h-1 rounded-full bg-[#FFDADA] mx-auto mb-2" />

            <div className="flex items-center justify-between border-b border-[#FFDADA] pb-3">
              <div className="flex items-center gap-2.5">
                <VeloraBrandEmblem size="sm" />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2D2226]">Velora Tools</h3>
                  <p className="text-[11px] text-[#8E7A81]">Quick access clinical services</p>
                </div>
              </div>
              <button
                onClick={() => setIsMoreSheetOpen(false)}
                className="p-1.5 rounded-full bg-[#FFF5F7] text-[#8E7A81] hover:text-[#2D2226]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Grid Actions */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setIsBriefOpen(true);
                  setIsMoreSheetOpen(false);
                }}
                className="p-3 rounded-2xl bg-[#FFF5F7] border border-[#FFDADA] text-left hover:bg-[#FFEDF1] transition-all cursor-pointer"
              >
                <FileText className="w-5 h-5 text-[#FF788D] mb-1.5" />
                <div className="text-xs font-bold text-[#2D2226]">Doctor Brief</div>
                <div className="text-[10px] text-[#8E7A81]">1-page clinician PDF summary</div>
              </button>

              <button
                onClick={() => {
                  setIsLifeMapOpen(true);
                  setIsMoreSheetOpen(false);
                }}
                className="p-3 rounded-2xl bg-[#FFF5F7] border border-[#FFDADA] text-left hover:bg-[#FFEDF1] transition-all cursor-pointer"
              >
                <Compass className="w-5 h-5 text-[#FF788D] mb-1.5" />
                <div className="text-xs font-bold text-[#2D2226]">Women's Life Map™</div>
                <div className="text-[10px] text-[#8E7A81]">Switch life stages</div>
              </button>

              <button
                onClick={() => {
                  setIsKitchenOpen(true);
                  setIsMoreSheetOpen(false);
                }}
                className="p-3 rounded-2xl bg-[#FFF5F7] border border-[#FFDADA] text-left hover:bg-[#FFEDF1] transition-all cursor-pointer"
              >
                <Utensils className="w-5 h-5 text-[#FF788D] mb-1.5" />
                <div className="text-xs font-bold text-[#2D2226]">Nutrition & Kitchen</div>
                <div className="text-[10px] text-[#8E7A81]">Stage-specific recipes</div>
              </button>

              <button
                onClick={() => {
                  setIsBreathingOpen(true);
                  setIsMoreSheetOpen(false);
                }}
                className="p-3 rounded-2xl bg-[#FFF5F7] border border-[#FFDADA] text-left hover:bg-[#FFEDF1] transition-all cursor-pointer"
              >
                <Wind className="w-5 h-5 text-[#FF788D] mb-1.5" />
                <div className="text-xs font-bold text-[#2D2226]">Nervous System</div>
                <div className="text-[10px] text-[#8E7A81]">Guided breath cycle</div>
              </button>
            </div>

            {/* Privacy & Settings Links */}
            <div className="space-y-1.5 pt-2 border-t border-[#FFDADA]">
              <button
                onClick={() => {
                  setActiveTab("privacy");
                  setIsMoreSheetOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF5F7] text-xs font-semibold text-[#735E65]"
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-[#FF788D]" />
                  <span>Privacy Center & Audit Logs</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8E7A81]" />
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMoreSheetOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF5F7] text-xs font-semibold text-[#735E65]"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-[#8E7A81]" />
                  <span>Profile & App Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8E7A81]" />
              </button>

              <button
                onClick={() => {
                  setIsMoreSheetOpen(false);
                  setIsLogoutConfirmOpen(true);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer border border-rose-200 mt-2"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Velora</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. APP MODALS & OVERLAYS */}
      <LifeMapModal
        isOpen={isLifeMapOpen}
        onClose={() => setIsLifeMapOpen(false)}
      />

      <DoctorBriefModal
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
      />

      <KitchenNutritionModal
        isOpen={isKitchenOpen}
        onClose={() => setIsKitchenOpen(false)}
      />

      <BreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <LogoutConfirmationModal
        isOpen={isLogoutConfirmOpen}
        userName={user.name}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          logout();
        }}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useHealth();
  if (!isAuthenticated) {
    return <AuthView />;
  }
  return <MainAppLayout />;
};

export default function App() {
  return (
    <HealthProvider>
      <AppContent />
    </HealthProvider>
  );
}

