export type LifeStage =
  | "teen"
  | "cycle_hormonal"
  | "ttc"
  | "pregnant"
  | "postpartum"
  | "perimenopause"
  | "menopause";

export interface LifeStageConfig {
  id: LifeStage;
  name: string;
  tagline: string;
  description: string;
  accentColor: string;
  prioritizedModules: string[];
  suggestedPrompts: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  currentLifeStage: LifeStage;
  cycleLength: number; // e.g. 29 days
  periodLength: number; // e.g. 5 days
  lastPeriodStartDate: string; // YYYY-MM-DD
  pregnancyWeek?: number; // for pregnant
  postpartumWeeks?: number; // for postpartum
  discreetMode: boolean; // privacy mode with neutral terms
  biometricLockEnabled: boolean;
  avatarSeed?: string;
  createdAt: string;
}

export type FlowLevel = "none" | "spotting" | "light" | "medium" | "heavy";
export type MoodType = "calm" | "joyful" | "focused" | "sensitive" | "anxious" | "low" | "irritable" | "exhausted";
export type CervicalMucus = "dry" | "sticky" | "creamy" | "egg_white" | "watery";
export type OvulationTestResult = "negative" | "faint" | "positive" | "peak";

export interface DailyHealthLog {
  id: string;
  date: string; // YYYY-MM-DD
  cycleDay: number;
  flow: FlowLevel;
  crampsSeverity: number; // 0 to 5
  headacheSeverity: number; // 0 to 5
  energyLevel: number; // 1 to 5
  mood: MoodType;
  sleepHours: number;
  sleepQuality: "restful" | "average" | "disturbed" | "poor" | "excellent";
  sleepRating?: number; // 1 to 5 stars
  sleepFactors?: string[]; // e.g. ["night_sweats", "vivid_dreams", "rested", "insomnia"]
  basalBodyTemp?: number; // e.g. 97.8 F or 36.6 C
  cervicalMucus?: CervicalMucus;
  ovulationTest?: OvulationTestResult;
  acne: boolean;
  bloating: boolean;
  breastTenderness: boolean;
  hotFlashesCount?: number; // Perimenopause/Menopause
  babyKicksCount?: number; // Pregnancy
  maternalBloodPressure?: string; // e.g. "118/76"
  postpartumRecovery?: {
    painScore: number; // 0-5
    bleedingLochia: "none" | "light" | "moderate" | "heavy";
    pelvicFloorSoreness: boolean;
    feedingsCount: number;
    pumpingVolumeOz: number;
    supportScore: number; // 1-5
  };
  medicationsTaken: string[];
  hydrationGlasses: number;
  exerciseMinutes: number;
  exerciseType?: string;
  notes?: string;
  tags?: string[];
}

export interface BodyPattern {
  id: string;
  title: string;
  description: string; // e.g. "Headaches were logged on Days 21-24 in 4 of your last 5 cycles."
  category: "symptom" | "cycle" | "sleep" | "mood" | "energy";
  confidenceScore: number; // 0 to 100%
  occurrenceFrequency: string; // e.g. "80% of tracked cycles"
  cyclePhase: "Follicular" | "Ovulatory" | "Luteal" | "Menstrual";
  nonDiagnosticAdvice: string;
  dateIdentified: string;
}

export type TimelineCategory =
  | "cycle"
  | "symptom"
  | "appointment"
  | "medication"
  | "vault"
  | "mood"
  | "vitals"
  | "milestone";

export interface TimelineEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category: TimelineCategory;
  title: string;
  subtitle?: string;
  details?: string;
  severity?: "info" | "normal" | "notable" | "elevated";
  tags?: string[];
  metadata?: Record<string, any>;
}

export type VaultCategory =
  | "lab_report"
  | "prescription"
  | "scan"
  | "vaccination"
  | "doctor_notes"
  | "allergies"
  | "family_history";

export interface ExtractedFact {
  parameter: string;
  value: string;
  referenceRange?: string;
  status: "normal" | "low" | "high" | "noted";
}

export interface VaultDocument {
  id: string;
  title: string;
  category: VaultCategory;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  facilityOrProvider: string;
  isEncrypted: boolean;
  extractedFacts: ExtractedFact[];
  clinicianInstructions?: string[];
  recommendedDoctorQuestions?: string[];
  summary: string;
  rawText?: string;
  accessPolicy: {
    userAccess: boolean;
    aiAccess: boolean;
    doctorShare: boolean;
    familyShare: boolean;
  };
}

export interface DoctorBrief {
  id: string;
  generatedAt: string;
  timeframeCovered: string;
  patientSnapshot: {
    name: string;
    age: number;
    lifeStage: string;
    primaryConcern: string;
  };
  executiveSummary: string;
  cycleMetrics: {
    averageLength: string;
    variation: string;
    flowCharacteristics: string;
  };
  symptomClustering: {
    symptom: string;
    frequency: string;
    cycleTiming: string;
    impactScore: string;
  }[];
  currentRegimen: string[];
  patientAgendaQuestions: string[];
  clinicalDiscussionPoints: string[];
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  safetyChecksPassed?: boolean;
  dataSourcesUsed?: string[];
  doctorQuestions?: string[];
  isEmergencyAlert?: boolean;
}

export interface CopilotSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lifeStage: LifeStage;
  messages: CopilotMessage[];
}

export interface PrivacyMatrixPermission {
  category: "Cycle & Periods" | "Symptoms & Patterns" | "Medical Records & Vault" | "Mood & Mental Wellbeing" | "Fitness & Movement" | "Nutrition & Vitals";
  user: boolean; // always true
  ai: boolean; // can copilot read
  doctor: boolean; // include in exported doctor brief
  family: boolean; // share with partner/trusted caregiver
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  system: "Vault" | "Copilot AI" | "Timeline" | "Export" | "Auth" | "Permissions" | "External Sync";
  details: string;
  actor: "User" | "Velora Health Copilot" | "System Engine";
}

export type HealthSyncProvider = "apple_health" | "google_fit";

export interface HealthSyncCategories {
  cycleAndMenstruation: boolean;
  sleepAnalysis: boolean;
  basalBodyTemperature: boolean;
  hydrationAndWater: boolean;
  activityAndSteps: boolean;
  vitalSigns: boolean;
}

export interface HealthSyncServiceState {
  provider: HealthSyncProvider;
  name: string;
  enabled: boolean;
  connected: boolean;
  lastSyncedAt?: string;
  syncFrequency: "realtime" | "hourly" | "daily" | "manual";
  syncedRecordsCount: number;
  categories: HealthSyncCategories;
  apiStatus: "idle" | "authorizing" | "syncing" | "connected" | "error";
  accountIdentifier?: string;
  syncError?: string;
}

export interface ExternalSyncPreferences {
  appleHealth: HealthSyncServiceState;
  googleFit: HealthSyncServiceState;
}

export type HealthInsightType =
  | "sleep_drop"
  | "sleep_disruption"
  | "hydration_deficit"
  | "headache_cluster"
  | "energy_dip"
  | "cramps_escalation"
  | "hot_flashes_surge"
  | "vitality_optimal";

export type HealthInsightSeverity = "subtle" | "notable" | "elevated";

export interface DailyTrendPoint {
  date: string;
  dayLabel: string;
  value: number;
  unit?: string;
  label?: string;
  target?: number;
  isToday?: boolean;
}

export interface HealthInsightAlert {
  id: string;
  type: HealthInsightType;
  title: string;
  subtitle: string;
  severity: HealthInsightSeverity;
  confidenceScore: number;
  detectedMetric: string;
  summary: string;
  detailedAnalysis: string;
  biologicalContext: string;
  actionItems: string[];
  copilotPromptSuggestion: string;
  history7Days: DailyTrendPoint[];
  changeMetric: {
    value: number;
    percentage: number;
    direction: "down" | "up" | "neutral";
    unit: string;
    description: string;
  };
  category: "sleep" | "hydration" | "symptom" | "energy" | "vitals";
  detectedAt: string;
  isDismissed?: boolean;
}

export interface ActiveTabState {
  view: "home" | "timeline" | "track" | "copilot" | "vault" | "privacy" | "brief" | "settings";
}

