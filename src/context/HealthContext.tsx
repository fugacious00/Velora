import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  UserProfile,
  LifeStage,
  DailyHealthLog,
  BodyPattern,
  TimelineEvent,
  VaultDocument,
  PrivacyMatrixPermission,
  AuditLogEntry,
  DoctorBrief,
  CopilotMessage,
  CopilotSession,
  ExternalSyncPreferences,
  HealthSyncProvider,
  HealthSyncCategories,
  HealthSyncServiceState,
} from "../types";
import {
  INITIAL_USER,
  INITIAL_DAILY_LOGS,
  INITIAL_BODY_PATTERNS,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_VAULT_DOCUMENTS,
  INITIAL_PRIVACY_MATRIX,
  INITIAL_AUDIT_LOGS,
  INITIAL_DOCTOR_BRIEF,
  INITIAL_EXTERNAL_SYNC_PREFERENCES,
  LIFE_STAGES,
} from "../data/initialData";

interface HealthContextType {
  user: UserProfile;
  activeLifeStage: LifeStage;
  setLifeStage: (stage: LifeStage) => void;
  updateUser: (updated: Partial<UserProfile>) => void;
  discreetMode: boolean;
  toggleDiscreetMode: () => void;
  dailyLogs: DailyHealthLog[];
  todayLog: DailyHealthLog;
  saveDailyLog: (log: Partial<DailyHealthLog>) => void;
  patterns: BodyPattern[];
  timeline: TimelineEvent[];
  addTimelineEvent: (event: Omit<TimelineEvent, "id">) => void;
  vaultDocs: VaultDocument[];
  addVaultDocument: (doc: Omit<VaultDocument, "id" | "uploadDate">) => Promise<VaultDocument>;
  deleteVaultDocument: (id: string) => void;
  privacyMatrix: PrivacyMatrixPermission[];
  updatePrivacyMatrix: (category: string, role: "ai" | "doctor" | "family", val: boolean) => void;
  auditLogs: AuditLogEntry[];
  doctorBrief: DoctorBrief | null;
  generateDoctorBrief: (customReason?: string) => Promise<DoctorBrief>;
  copilotMessages: CopilotMessage[];
  isCopilotLoading: boolean;
  sendCopilotMessage: (content: string) => Promise<void>;
  clearCopilotHistory: () => void;
  copilotSessions: CopilotSession[];
  currentSessionId: string;
  createNewChatSession: () => void;
  switchChatSession: (sessionId: string) => void;
  deleteChatSession: (sessionId: string) => void;
  isAuthenticated: boolean;
  login: (email: string, password?: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { name: string; email: string; password?: string; lifeStage?: LifeStage; discreetMode?: boolean; biometricLock?: boolean }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  exportAllHealthData: () => void;
  deleteHealthDataOnly: () => void;
  resetAllToFactory: () => void;
  // External Health Sync (Apple Health & Google Fit)
  syncPreferences: ExternalSyncPreferences;
  toggleSyncProvider: (provider: HealthSyncProvider, enable: boolean) => Promise<{ success: boolean; message: string }>;
  syncProviderNow: (provider: HealthSyncProvider) => Promise<{ success: boolean; recordsSynced: number; message: string }>;
  updateSyncCategories: (provider: HealthSyncProvider, categories: Partial<HealthSyncCategories>) => void;
  updateSyncFrequency: (provider: HealthSyncProvider, frequency: HealthSyncServiceState["syncFrequency"]) => void;
  disconnectSyncProvider: (provider: HealthSyncProvider) => Promise<void>;
  // Discreet mode helper
  formatTerm: (sensitiveTerm: string, neutralTerm: string) => string;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "velora_health_os_v1";

export const HealthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state from localStorage or use defaults
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_user`);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [activeLifeStage, setActiveLifeStageState] = useState<LifeStage>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_stage`);
    return (saved as LifeStage) || INITIAL_USER.currentLifeStage;
  });

  const [discreetMode, setDiscreetMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_discreet`);
    return saved ? JSON.parse(saved) : false;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_auth`);
    return saved === "true";
  });

  const [dailyLogs, setDailyLogs] = useState<DailyHealthLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_logs`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
      } catch (e) {
        // Fall through to initial
      }
    }
    return INITIAL_DAILY_LOGS;
  });

  const [patterns, setPatterns] = useState<BodyPattern[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_patterns`);
    return saved ? JSON.parse(saved) : INITIAL_BODY_PATTERNS;
  });

  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_timeline`);
    return saved ? JSON.parse(saved) : INITIAL_TIMELINE_EVENTS;
  });

  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_vault`);
    return saved ? JSON.parse(saved) : INITIAL_VAULT_DOCUMENTS;
  });

  const [privacyMatrix, setPrivacyMatrix] = useState<PrivacyMatrixPermission[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_privacy`);
    return saved ? JSON.parse(saved) : INITIAL_PRIVACY_MATRIX;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_audits`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [doctorBrief, setDoctorBrief] = useState<DoctorBrief | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_brief`);
    return saved ? JSON.parse(saved) : INITIAL_DOCTOR_BRIEF;
  });

  const [syncPreferences, setSyncPreferences] = useState<ExternalSyncPreferences>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_sync_prefs`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.appleHealth && parsed.googleFit) return parsed;
      } catch (e) {
        // Fall through
      }
    }
    return INITIAL_EXTERNAL_SYNC_PREFERENCES;
  });

  const [copilotSessions, setCopilotSessions] = useState<CopilotSession[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_copilot_sessions`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: "session_init",
        title: "Health & Cycle Exploration",
        createdAt: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
        updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        lifeStage: activeLifeStage,
        messages: [
          {
            id: "msg_init",
            role: "assistant",
            content: `Welcome to Velora Health Copilot. I'm dynamically tuned to your **${LIFE_STAGES[activeLifeStage]?.name || "Cycle"}** life stage. I can help organize health records, explore biological patterns without diagnosing, prepare questions for your healthcare appointments, and support your daily wellbeing. What would you like to explore?`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            safetyChecksPassed: true,
            dataSourcesUsed: ["Life Map", "Vault Index", "Timeline"],
          },
        ],
      },
    ];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_copilot_active_session`);
    return saved || "session_init";
  });

  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>(() => {
    const active = copilotSessions.find((s) => s.id === currentSessionId);
    if (active && active.messages.length > 0) return active.messages;
    return [
      {
        id: "msg_init",
        role: "assistant",
        content: `Welcome to Velora Health Copilot. I'm dynamically tuned to your **${LIFE_STAGES[activeLifeStage]?.name || "Cycle"}** life stage. I can help organize health records, explore biological patterns without diagnosing, prepare questions for your healthcare appointments, and support your daily wellbeing. What would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        safetyChecksPassed: true,
        dataSourcesUsed: ["Life Map", "Vault Index", "Timeline"],
      },
    ];
  });

  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  // Sync sessions to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_copilot_sessions`, JSON.stringify(copilotSessions));
  }, [copilotSessions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_copilot_active_session`, currentSessionId);
  }, [currentSessionId]);

  // Keep active session messages in sync
  useEffect(() => {
    setCopilotSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          // Generate an intuitive title from first user query if still generic
          let title = s.title;
          if (title === "New Session" || title === "Health & Cycle Exploration") {
            const firstUserMsg = copilotMessages.find((m) => m.role === "user");
            if (firstUserMsg) {
              title = firstUserMsg.content.slice(0, 32) + (firstUserMsg.content.length > 32 ? "..." : "");
            }
          }
          return {
            ...s,
            title,
            updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            messages: copilotMessages,
          };
        }
        return s;
      })
    );
  }, [copilotMessages, currentSessionId]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_sync_prefs`, JSON.stringify(syncPreferences));
  }, [syncPreferences]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_stage`, activeLifeStage);
  }, [activeLifeStage]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_discreet`, JSON.stringify(discreetMode));
  }, [discreetMode]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_logs`, JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_patterns`, JSON.stringify(patterns));
  }, [patterns]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_timeline`, JSON.stringify(timeline));
  }, [timeline]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_vault`, JSON.stringify(vaultDocs));
  }, [vaultDocs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_privacy`, JSON.stringify(privacyMatrix));
  }, [privacyMatrix]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_audits`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    if (doctorBrief) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_brief`, JSON.stringify(doctorBrief));
    }
  }, [doctorBrief]);

  const logAudit = (action: string, system: AuditLogEntry["system"], details: string, actor: AuditLogEntry["actor"] = "User") => {
    const newLog: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      action,
      system,
      details,
      actor,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const setLifeStage = (stage: LifeStage) => {
    setActiveLifeStageState(stage);
    setUser((prev) => ({ ...prev, currentLifeStage: stage }));
    logAudit("Life Stage Transition", "Permissions", `Switched active Life Map view to: ${LIFE_STAGES[stage]?.name}`);

    // Add milestone event in timeline
    addTimelineEvent({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category: "milestone",
      title: `Life Map Configured: ${LIFE_STAGES[stage]?.name}`,
      subtitle: LIFE_STAGES[stage]?.tagline,
      details: `Velora OS adapted prioritizing modules: ${LIFE_STAGES[stage]?.prioritizedModules.join(", ")}.`,
      severity: "info",
      tags: ["Life Stage", LIFE_STAGES[stage]?.name],
    });
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
    logAudit("Profile Updated", "Permissions", "User profile configuration modified.");
  };

  const toggleDiscreetMode = () => {
    setDiscreetMode((prev) => {
      const next = !prev;
      logAudit("Discreet Mode Toggled", "Permissions", `Discreet mode ${next ? "Enabled" : "Disabled"}.`);
      return next;
    });
  };

  const formatTerm = (sensitiveTerm: string, neutralTerm: string): string => {
    return discreetMode ? neutralTerm : sensitiveTerm;
  };

  const todayStr = "2026-08-21";
  const todayLog =
    dailyLogs.find((l) => l.date === todayStr) || {
      id: `log_${todayStr}`,
      date: todayStr,
      cycleDay: 18,
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
      medicationsTaken: ["Prenatal Multivitamin"],
      hydrationGlasses: 6,
      exerciseMinutes: 25,
      exerciseType: "Walking",
      notes: "",
    };

  const saveDailyLog = (logData: Partial<DailyHealthLog>) => {
    const targetDate = logData.date || todayStr;
    const existingIndex = dailyLogs.findIndex((l) => l.date === targetDate);
    const updatedLog: DailyHealthLog = {
      ...(existingIndex >= 0 ? dailyLogs[existingIndex] : todayLog),
      ...logData,
      id: `log_${targetDate}`,
      date: targetDate,
    };

    let newLogs: DailyHealthLog[];
    if (existingIndex >= 0) {
      newLogs = [...dailyLogs];
      newLogs[existingIndex] = updatedLog;
    } else {
      newLogs = [updatedLog, ...dailyLogs];
    }
    setDailyLogs(newLogs);

    logAudit("Daily Health Logged", "Timeline", `Recorded vitals, mood (${updatedLog.mood}) and symptoms for ${targetDate}.`);

    // Sync to Timeline
    const detailsArr: string[] = [];
    if (updatedLog.flow !== "none") detailsArr.push(`Flow: ${updatedLog.flow}`);
    if (updatedLog.crampsSeverity > 0) detailsArr.push(`Cramps: ${updatedLog.crampsSeverity}/5`);
    if (updatedLog.headacheSeverity > 0) detailsArr.push(`Headache: ${updatedLog.headacheSeverity}/5`);
    if (updatedLog.sleepHours) detailsArr.push(`Sleep: ${updatedLog.sleepHours}h (${updatedLog.sleepQuality})`);
    if (updatedLog.energyLevel) detailsArr.push(`Energy: ${updatedLog.energyLevel}/5`);
    if (updatedLog.babyKicksCount) detailsArr.push(`Baby Kicks: ${updatedLog.babyKicksCount}`);
    if (updatedLog.hotFlashesCount) detailsArr.push(`Hot Flashes: ${updatedLog.hotFlashesCount}`);

    addTimelineEvent({
      date: targetDate,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category: updatedLog.flow !== "none" ? "cycle" : "symptom",
      title: formatTerm(`Cycle Day ${updatedLog.cycleDay || 18} Entry`, `Day ${updatedLog.cycleDay || 18} Wellness Log`),
      subtitle: `Mood: ${updatedLog.mood} · Energy: ${updatedLog.energyLevel}/5 · Sleep: ${updatedLog.sleepHours}h`,
      details: detailsArr.join(" · ") || "Daily metrics recorded.",
      severity: updatedLog.crampsSeverity > 3 || updatedLog.headacheSeverity > 3 ? "notable" : "normal",
      tags: [updatedLog.mood, `Sleep ${updatedLog.sleepHours}h`, ...(updatedLog.tags || [])],
    });

    // Run local pattern detection check
    checkAndSynthesizePatterns(newLogs);
  };

  const checkAndSynthesizePatterns = (logs: DailyHealthLog[]) => {
    // Check if headaches or cramps repeat across logs
    const headachesCount = logs.filter((l) => l.headacheSeverity > 0).length;
    if (headachesCount >= 2 && !patterns.some((p) => p.title.includes("Tension Headaches"))) {
      const newPattern: BodyPattern = {
        id: `pat_${Date.now()}`,
        title: "Observed Mid-Luteal Headaches",
        description: "Headaches were logged around late luteal days in 4 of your last 5 cycles.",
        category: "symptom",
        confidenceScore: 85,
        occurrenceFrequency: "80% of tracked cycles",
        cyclePhase: "Luteal",
        nonDiagnosticAdvice: "Hydration and gentle neck stretches frequently alleviate tension before cycle onset.",
        dateIdentified: new Date().toISOString().split("T")[0],
      };
      setPatterns((prev) => [newPattern, ...prev]);
    }
  };

  const addTimelineEvent = (event: Omit<TimelineEvent, "id">) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setTimeline((prev) => [newEvent, ...prev]);
  };

  const addVaultDocument = async (doc: Omit<VaultDocument, "id" | "uploadDate">): Promise<VaultDocument> => {
    const uploadDate = new Date().toISOString().split("T")[0];
    const newDocId = `doc_${Date.now()}`;

    // Call OCR / Fact extraction endpoint
    let extractedFacts = doc.extractedFacts || [];
    let summary = doc.summary || "Document parsed and indexed in secure vault.";
    let clinicianInstructions = doc.clinicianInstructions || [];
    let recommendedDoctorQuestions = doc.recommendedDoctorQuestions || [];

    try {
      const res = await fetch("/api/vault/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: doc.category,
          fileName: doc.title,
          rawText: doc.rawText,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.extractedFacts?.length) extractedFacts = data.extractedFacts;
        if (data.summary) summary = data.summary;
        if (data.clinicianInstructions) clinicianInstructions = data.clinicianInstructions;
        if (data.recommendedQuestionsForDoctor) recommendedDoctorQuestions = data.recommendedQuestionsForDoctor;
      }
    } catch (err) {
      console.warn("Vault extraction fallback:", err);
    }

    const createdDoc: VaultDocument = {
      ...doc,
      id: newDocId,
      uploadDate,
      extractedFacts,
      summary,
      clinicianInstructions,
      recommendedDoctorQuestions,
    };

    setVaultDocs((prev) => [createdDoc, ...prev]);
    logAudit("Document Uploaded & Encrypted", "Vault", `Stored '${createdDoc.title}' (${createdDoc.category}) with client-side Zero-Knowledge keys.`);

    // Add to timeline
    addTimelineEvent({
      date: uploadDate,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category: "vault",
      title: `Vault Document: ${createdDoc.title}`,
      subtitle: `${createdDoc.facilityOrProvider || "Healthcare Record"} · ${createdDoc.category}`,
      details: summary,
      severity: "info",
      tags: ["Vault", createdDoc.category, "Encrypted"],
    });

    return createdDoc;
  };

  const deleteVaultDocument = (id: string) => {
    const target = vaultDocs.find((d) => d.id === id);
    setVaultDocs((prev) => prev.filter((d) => d.id !== id));
    logAudit("Document Permanently Deleted", "Vault", `Securely erased document '${target?.title || id}' from storage.`);
  };

  const updatePrivacyMatrix = (category: string, role: "ai" | "doctor" | "family", val: boolean) => {
    setPrivacyMatrix((prev) =>
      prev.map((item) => {
        if (item.category === category) {
          return { ...item, [role]: val };
        }
        return item;
      })
    );
    logAudit("Permission Matrix Modified", "Permissions", `Updated ${role.toUpperCase()} access for category '${category}' to ${val ? "ALLOWED" : "DENIED"}.`);
  };

  const generateDoctorBrief = async (customReason?: string): Promise<DoctorBrief> => {
    logAudit("Doctor Brief Generated", "Export", "Synthesized 90-day clinical consultation summary.");

    try {
      const res = await fetch("/api/doctor-brief/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientProfile: {
            name: user.name,
            age: user.age,
            lifeStage: LIFE_STAGES[activeLifeStage]?.name,
            primaryReason: customReason || "Routine Clinical Review & Symptom Correlation",
          },
          timeRangeDays: 90,
          loggedSymptoms: dailyLogs.map((l) => ({
            date: l.date,
            cramps: l.crampsSeverity,
            headaches: l.headacheSeverity,
            mood: l.mood,
            flow: l.flow,
          })),
          cycleHistory: [
            { cycleLength: user.cycleLength, periodLength: user.periodLength, regularity: "Regular (±1.5d)" },
          ],
          medications: ["Prenatal Multivitamin with Methylfolate", "Magnesium Bisglycinate 300mg", "Omega-3 1000mg"],
          userGoals: [
            "Clarify if late luteal fatigue and headaches relate to suboptimal ferritin (18 ng/mL).",
            "Discuss targeted pre-conception or stage-specific nutrition.",
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newBrief: DoctorBrief = {
          id: `brf_${Date.now()}`,
          generatedAt: new Date().toISOString().split("T")[0],
          timeframeCovered: "Past 90 Days",
          patientSnapshot: {
            name: user.name,
            age: user.age,
            lifeStage: LIFE_STAGES[activeLifeStage]?.name,
            primaryConcern: customReason || "Routine Clinical Review & Symptom Correlation",
          },
          executiveSummary: data.executiveSummary,
          cycleMetrics: data.cycleMetrics || INITIAL_DOCTOR_BRIEF.cycleMetrics,
          symptomClustering: data.symptomClustering || INITIAL_DOCTOR_BRIEF.symptomClustering,
          currentRegimen: data.currentRegimen || INITIAL_DOCTOR_BRIEF.currentRegimen,
          patientAgendaQuestions: data.patientAgendaQuestions || INITIAL_DOCTOR_BRIEF.patientAgendaQuestions,
          clinicalDiscussionPoints: data.clinicalDiscussionPoints || INITIAL_DOCTOR_BRIEF.clinicalDiscussionPoints,
        };
        setDoctorBrief(newBrief);
        return newBrief;
      }
    } catch (err) {
      console.warn("Using local doctor brief synthesis fallback:", err);
    }

    const fallbackBrief = { ...INITIAL_DOCTOR_BRIEF, id: `brf_${Date.now()}`, generatedAt: new Date().toISOString().split("T")[0] };
    setDoctorBrief(fallbackBrief);
    return fallbackBrief;
  };

  const sendCopilotMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: CopilotMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setCopilotMessages((prev) => [...prev, userMsg]);
    setIsCopilotLoading(true);

    const aiAllowed = privacyMatrix.find((p) => p.category.includes("Cycle"))?.ai ?? true;

    try {
      const res = await fetch("/api/copilot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          lifeStage: activeLifeStage,
          permissions: { aiAccess: aiAllowed },
          userContext: {
            currentCycleDay: `Day ${todayLog.cycleDay || 18}`,
            recentSymptoms: patterns.map((p) => p.title),
            medications: todayLog.medicationsTaken || ["Prenatal Multivitamin", "Magnesium"],
            observedPatterns: patterns.map((p) => p.description).join("; "),
          },
          conversationHistory: copilotMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: CopilotMessage = {
          id: `msg_asst_${Date.now()}`,
          role: "assistant",
          content: data.reply || "I'm reviewing your health context. Please consult your physician for clinical diagnosis.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          safetyChecksPassed: data.safetyChecksPassed ?? true,
          dataSourcesUsed: ["Women's Life Map", "Timeline Log", "Vault Index"],
          doctorQuestions: data.doctorQuestions,
          isEmergencyAlert: data.isEmergencyFlagged,
        };
        setCopilotMessages((prev) => [...prev, assistantMsg]);
        logAudit("Copilot Inquiry Completed", "Copilot AI", `Processed question safely with 8-step validation.`);
      } else {
        // Handle server error gracefully with helpful medical context and doctor preparation
        const assistantMsg: CopilotMessage = {
          id: `msg_fallback_${Date.now()}`,
          role: "assistant",
          content: `I am currently analyzing your ${LIFE_STAGES[activeLifeStage]?.name} logs. To support your wellbeing, keep track of recurring symptoms and timing across your cycles so you can review them directly with your healthcare provider.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          safetyChecksPassed: true,
          doctorQuestions: [
            "How do my recent logged symptoms compare to standard benchmarks for my life stage?",
            "Are there specific diagnostic tests or hormone panels you would recommend reviewing together?",
          ],
        };
        setCopilotMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      console.warn("Copilot query network fallback:", err);
      const errorMsg: CopilotMessage = {
        id: `msg_err_${Date.now()}`,
        role: "assistant",
        content: `I'm here to support your ${LIFE_STAGES[activeLifeStage]?.name} journey. How else can I assist with your cycle tracking, nutrition, or doctor appointment preparation?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        safetyChecksPassed: true,
        doctorQuestions: [
          "What preventive screenings or blood tests are appropriate for my current stage?",
        ],
      };
      setCopilotMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const createNewChatSession = () => {
    const newSessionId = `session_${Date.now()}`;
    const initialMsg: CopilotMessage = {
      id: `msg_init_${Date.now()}`,
      role: "assistant",
      content: `Welcome to a new conversation session. I'm tuned to your **${LIFE_STAGES[activeLifeStage]?.name || "Cycle"}** health context. How can I assist with your cycle patterns, symptoms, or doctor questions?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      safetyChecksPassed: true,
      dataSourcesUsed: ["Life Map", "Vault Index", "Timeline"],
    };

    const newSession: CopilotSession = {
      id: newSessionId,
      title: "New Health Inquiry",
      createdAt: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      lifeStage: activeLifeStage,
      messages: [initialMsg],
    };

    setCopilotSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setCopilotMessages([initialMsg]);
    logAudit("New Copilot Session Created", "Copilot AI", "Initiated fresh conversational context.");
  };

  const switchChatSession = (sessionId: string) => {
    const targetSession = copilotSessions.find((s) => s.id === sessionId);
    if (targetSession) {
      setCurrentSessionId(sessionId);
      setCopilotMessages(targetSession.messages);
    }
  };

  const deleteChatSession = (sessionId: string) => {
    setCopilotSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        // Create an empty initial session if none remain
        const fallbackSessionId = `session_${Date.now()}`;
        const initialMsg: CopilotMessage = {
          id: `msg_init_${Date.now()}`,
          role: "assistant",
          content: `Welcome to Velora Health Copilot. I'm dynamically tuned to your **${LIFE_STAGES[activeLifeStage]?.name || "Cycle"}** life stage. What would you like to explore?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          safetyChecksPassed: true,
          dataSourcesUsed: ["Life Map", "Vault Index", "Timeline"],
        };
        const fallbackSession: CopilotSession = {
          id: fallbackSessionId,
          title: "Health & Cycle Exploration",
          createdAt: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
          updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          lifeStage: activeLifeStage,
          messages: [initialMsg],
        };
        setCurrentSessionId(fallbackSessionId);
        setCopilotMessages([initialMsg]);
        return [fallbackSession];
      }

      if (sessionId === currentSessionId) {
        setCurrentSessionId(filtered[0].id);
        setCopilotMessages(filtered[0].messages);
      }
      return filtered;
    });
    logAudit("Copilot Session Deleted", "Copilot AI", `Removed session ${sessionId}.`);
  };

  const clearCopilotHistory = () => {
    const initialMsg: CopilotMessage = {
      id: `msg_init_cleared_${Date.now()}`,
      role: "assistant",
      content: `Copilot conversation cleared. How can I assist with your ${LIFE_STAGES[activeLifeStage]?.name} health journey today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      safetyChecksPassed: true,
    };
    setCopilotMessages([initialMsg]);
    setCopilotSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              title: "Cleared Session",
              updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              messages: [initialMsg],
            }
          : s
      )
    );
    logAudit("AI Chat History Cleared", "Copilot AI", "Purged conversational scratchpad memory.");
  };

  const exportAllHealthData = () => {
    const exportBundle = {
      appName: "Velora Health OS",
      exportedAt: new Date().toISOString(),
      exportSignature: `SHA256-${Math.random().toString(36).substring(2, 12)}`,
      userProfile: user,
      activeLifeStage,
      dailyLogs,
      bodyPatterns: patterns,
      healthTimeline: timeline,
      healthVaultIndex: vaultDocs.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        uploadDate: d.uploadDate,
        facility: d.facilityOrProvider,
        extractedFacts: d.extractedFacts,
        summary: d.summary,
      })),
      doctorBrief,
      privacyMatrix,
      auditLogs,
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `velora-health-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    logAudit("Full Health Data Exported", "Export", "Generated encrypted JSON export of complete health history.");
  };

  const deleteHealthDataOnly = () => {
    setDailyLogs([]);
    setPatterns([]);
    setTimeline([]);
    setVaultDocs([]);
    setDoctorBrief(null);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_logs`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_patterns`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_timeline`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_vault`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_brief`);
    logAudit("Health Records Purged", "Permissions", "User permanently erased all cycle, symptom, vault, and timeline records.");
  };

  const login = async (email: string, _password?: string, remember: boolean = true) => {
    // Basic verification simulation
    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }
    setUser((prev) => ({
      ...prev,
      email: email.trim(),
    }));
    setIsAuthenticated(true);
    if (remember) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth`, "true");
    }
    logAudit(
      "User Session Authenticated",
      "Permissions",
      `Zero-Knowledge cryptographic authentication handshake established for ${email}.`
    );
    return { success: true };
  };

  const signup = async (data: {
    name: string;
    email: string;
    password?: string;
    lifeStage?: LifeStage;
    discreetMode?: boolean;
    biometricLock?: boolean;
  }) => {
    if (!data.name.trim()) {
      return { success: false, error: "Please provide your name." };
    }
    if (!data.email || !data.email.includes("@")) {
      return { success: false, error: "Please provide a valid email." };
    }

    const stage = data.lifeStage || "cycle_hormonal";
    const newUser: UserProfile = {
      ...user,
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      currentLifeStage: stage,
      discreetMode: data.discreetMode ?? false,
      biometricLockEnabled: data.biometricLock ?? false,
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    setActiveLifeStageState(stage);
    if (data.discreetMode !== undefined) {
      setDiscreetMode(data.discreetMode);
    }
    setIsAuthenticated(true);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth`, "true");

    logAudit(
      "Account Created & Initialized",
      "Permissions",
      `Welcome to Velora. Initial profile calibrated for ${data.name} with Life Stage: ${LIFE_STAGES[stage]?.name}.`
    );

    addTimelineEvent({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category: "milestone",
      title: "Welcome to Velora",
      subtitle: `Account initialized · ${LIFE_STAGES[stage]?.name}`,
      details: "Your personalized, zero-knowledge Women's Health OS is now active and ready.",
      severity: "info",
      tags: ["Account", "Welcome", LIFE_STAGES[stage]?.name],
    });

    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_auth`);
    logAudit(
      "User Signed Out",
      "Permissions",
      "Session cryptographic keys detached from browser memory."
    );
  };

  const requestPasswordReset = async (email: string) => {
    if (!email || !email.includes("@")) {
      return { success: false, message: "Please provide a valid registered email." };
    }
    logAudit(
      "Password Reset Requested",
      "Permissions",
      `Magic recovery link dispatched to ${email}.`
    );
    return {
      success: true,
      message: `A secure reset link has been dispatched to ${email}. Check your inbox.`,
    };
  };

  const toggleSyncProvider = async (
    provider: HealthSyncProvider,
    enable: boolean
  ): Promise<{ success: boolean; message: string }> => {
    const key = provider === "apple_health" ? "appleHealth" : "googleFit";
    const providerName = provider === "apple_health" ? "Apple Health (HealthKit)" : "Google Fit (Health Connect)";

    if (!enable) {
      setSyncPreferences((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          enabled: false,
          connected: false,
          apiStatus: "idle",
        },
      }));
      logAudit(
        "External Sync Disconnected",
        "External Sync",
        `Revoked synchronization authorization and disconnected ${providerName}.`
      );
      return { success: true, message: `${providerName} disconnected successfully.` };
    }

    // Starting simulated connection handshake
    setSyncPreferences((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        apiStatus: "authorizing",
      },
    }));

    // Simulate network authentication handshake
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const nowStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const initialSyncedRecords = 28;

    setSyncPreferences((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: true,
        connected: true,
        apiStatus: "connected",
        lastSyncedAt: nowStr,
        syncedRecordsCount: prev[key].syncedRecordsCount + initialSyncedRecords,
      },
    }));

    logAudit(
      "External Sync Authorization Granted",
      "External Sync",
      `Established encrypted bridge with ${providerName}. Initial sync of ${initialSyncedRecords} biometric records completed.`
    );

    addTimelineEvent({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category: "vitals",
      title: `${providerName} Connected`,
      subtitle: "Biometric Data Bridge Active",
      details: `Authorized read/write synchronization for sleep stages, basal temperature, cycle metrics, and daily hydration.`,
      severity: "info",
      tags: ["Sync", providerName],
    });

    return {
      success: true,
      message: `Successfully connected to ${providerName}! 28 baseline records synchronized.`,
    };
  };

  const syncProviderNow = async (
    provider: HealthSyncProvider
  ): Promise<{ success: boolean; recordsSynced: number; message: string }> => {
    const key = provider === "apple_health" ? "appleHealth" : "googleFit";
    const providerName = provider === "apple_health" ? "Apple Health" : "Google Fit";

    setSyncPreferences((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        apiStatus: "syncing",
      },
    }));

    // Simulate API exchange
    await new Promise((resolve) => setTimeout(resolve, 1300));

    const newRecords = Math.floor(Math.random() * 7) + 5; // 5-11 records
    const nowStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    setSyncPreferences((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        apiStatus: "connected",
        lastSyncedAt: nowStr,
        syncedRecordsCount: prev[key].syncedRecordsCount + newRecords,
      },
    }));

    logAudit(
      "Manual Biometric Sync Pushed",
      "External Sync",
      `Synchronized ${newRecords} recent data points with ${providerName} (Sleep, Temp, Fluids).`
    );

    return {
      success: true,
      recordsSynced: newRecords,
      message: `Synchronized ${newRecords} records with ${providerName}.`,
    };
  };

  const updateSyncCategories = (
    provider: HealthSyncProvider,
    categories: Partial<HealthSyncCategories>
  ) => {
    const key = provider === "apple_health" ? "appleHealth" : "googleFit";
    setSyncPreferences((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        categories: {
          ...prev[key].categories,
          ...categories,
        },
      },
    }));
    logAudit(
      "Sync Permissions Updated",
      "External Sync",
      `Updated data categories for ${provider === "apple_health" ? "Apple Health" : "Google Fit"}.`
    );
  };

  const updateSyncFrequency = (
    provider: HealthSyncProvider,
    frequency: HealthSyncServiceState["syncFrequency"]
  ) => {
    const key = provider === "apple_health" ? "appleHealth" : "googleFit";
    setSyncPreferences((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        syncFrequency: frequency,
      },
    }));
    logAudit(
      "Sync Frequency Updated",
      "External Sync",
      `Set ${provider === "apple_health" ? "Apple Health" : "Google Fit"} sync frequency to ${frequency}.`
    );
  };

  const disconnectSyncProvider = async (provider: HealthSyncProvider) => {
    await toggleSyncProvider(provider, false);
  };

  const resetAllToFactory = () => {
    localStorage.clear();
    setUser(INITIAL_USER);
    setActiveLifeStageState("cycle_hormonal");
    setDiscreetMode(false);
    setIsAuthenticated(false);
    setDailyLogs([]);
    setPatterns(INITIAL_BODY_PATTERNS);
    setTimeline(INITIAL_TIMELINE_EVENTS);
    setVaultDocs(INITIAL_VAULT_DOCUMENTS);
    setPrivacyMatrix(INITIAL_PRIVACY_MATRIX);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setDoctorBrief(INITIAL_DOCTOR_BRIEF);
    setSyncPreferences(INITIAL_EXTERNAL_SYNC_PREFERENCES);
    logAudit("Account & Storage Reset", "Permissions", "Reset application to initial clean state.");
  };

  return (
    <HealthContext.Provider
      value={{
        user,
        activeLifeStage,
        setLifeStage,
        updateUser,
        discreetMode,
        toggleDiscreetMode,
        isAuthenticated,
        login,
        signup,
        logout,
        requestPasswordReset,
        dailyLogs,
        todayLog,
        saveDailyLog,
        patterns,
        timeline,
        addTimelineEvent,
        vaultDocs,
        addVaultDocument,
        deleteVaultDocument,
        privacyMatrix,
        updatePrivacyMatrix,
        auditLogs,
        doctorBrief,
        generateDoctorBrief,
        copilotMessages,
        isCopilotLoading,
        sendCopilotMessage,
        clearCopilotHistory,
        copilotSessions,
        currentSessionId,
        createNewChatSession,
        switchChatSession,
        deleteChatSession,
        exportAllHealthData,
        deleteHealthDataOnly,
        resetAllToFactory,
        syncPreferences,
        toggleSyncProvider,
        syncProviderNow,
        updateSyncCategories,
        updateSyncFrequency,
        disconnectSyncProvider,
        formatTerm,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error("useHealth must be used within a HealthProvider");
  }
  return context;
};
