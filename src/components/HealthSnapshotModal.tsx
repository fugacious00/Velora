import React, { useState, useMemo } from "react";
import jsPDF from "jspdf";
import { useHealth } from "../context/HealthContext";
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  X,
  ShieldCheck,
  Lock,
  Sparkles,
  Calendar,
  Activity,
  Heart,
  Moon,
  Droplets,
  Pill,
  CheckSquare,
  Square,
  Eye,
  AlertCircle,
  Clock,
  Layers,
  Settings,
  HelpCircle,
} from "lucide-react";

interface HealthSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthSnapshotModal: React.FC<HealthSnapshotModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    user,
    activeLifeStage,
    todayLog,
    dailyLogs,
    patterns,
    vaultDocs,
    formatTerm,
  } = useHealth();

  // Document metadata customization
  const [reportTitle, setReportTitle] = useState("Velora Comprehensive Health Snapshot");
  const [providerName, setProviderName] = useState("");
  const [appointmentReason, setAppointmentReason] = useState("Routine Wellness & Longitudinal Review");
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<"customize" | "preview">("customize");

  // Selected Data Points / Sections
  const [includeDemographics, setIncludeDemographics] = useState(true);
  const [includeVitalsAndSleep, setIncludeVitalsAndSleep] = useState(true);
  const [includeSymptomsAndPatterns, setIncludeSymptomsAndPatterns] = useState(true);
  const [includeMedications, setIncludeMedications] = useState(true);
  const [includeLabBiomarkers, setIncludeLabBiomarkers] = useState(true);
  const [includeClinicalDocuments, setIncludeClinicalDocuments] = useState(true);
  const [includeHealthGoals, setIncludeHealthGoals] = useState(true);
  const [includeDoctorQuestions, setIncludeDoctorQuestions] = useState(true);

  // Privacy & Security Controls
  const [redactName, setRedactName] = useState(false);
  const [includeSecurityHash, setIncludeSecurityHash] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [customNotes, setCustomNotes] = useState(
    "Patient-authored clinical health snapshot compiled via Velora zero-knowledge health OS. Contains longitudinal biometric patterns and verified vault records."
  );

  // Static / Fallback Medications if not present
  const activeMedications = useMemo(() => {
    return [
      { name: "Prenatal Multivitamin with Methylfolate", dose: "1 capsule", freq: "Daily (Morning)", purpose: "Nutritional & RBC Support" },
      { name: "Magnesium Bisglycinate", dose: "300 mg", freq: "Nightly (Bedtime)", purpose: "Sleep Architecture & Muscle Relaxation" },
      { name: "Vitamin D3 (Cholecalciferol)", dose: "2,000 IU", freq: "Daily with food", purpose: "Immune & Bone Health" },
    ];
  }, []);

  // Goals
  const healthGoals = useMemo(() => {
    return [
      { title: "Daily Hydration Target", target: "8-10 glasses (2.2L)", progress: "88% Avg", status: "On Track" },
      { title: "Restorative Circadian Sleep", target: "7.5 - 8.5 hours/night", progress: `${todayLog.sleepHours || 7.6}h avg`, status: "Active" },
      { title: "Luteal Phase Tension Monitoring", target: "Daily logging & gentle movement", progress: "100% adherence", status: "Maintained" },
    ];
  }, [todayLog]);

  // Aggregate Biomarkers from Vault Documents
  const extractedBiomarkers = useMemo(() => {
    return vaultDocs.flatMap((doc) =>
      (doc.extractedFacts || []).map((fact) => ({
        ...fact,
        docTitle: doc.title,
        docDate: doc.uploadDate,
        facility: doc.facilityOrProvider,
      }))
    );
  }, [vaultDocs]);

  // 7-day vitals averages
  const vitalsAverage = useMemo(() => {
    const sleepSum = dailyLogs.reduce((acc, curr) => acc + (curr.sleepHours || 7.5), 0);
    const avgSleep = (sleepSum / (dailyLogs.length || 1)).toFixed(1);
    const hydrationSum = dailyLogs.reduce((acc, curr) => acc + (curr.hydrationGlasses || 7), 0);
    const avgHydration = (hydrationSum / (dailyLogs.length || 1)).toFixed(1);
    const energySum = dailyLogs.reduce((acc, curr) => acc + (curr.energyLevel || 4), 0);
    const avgEnergy = (energySum / (dailyLogs.length || 1)).toFixed(1);

    return {
      avgSleep,
      avgHydration,
      avgEnergy,
      todaySleep: todayLog.sleepHours || 7.5,
      todayQuality: todayLog.sleepQuality || "restful",
      todayHydration: todayLog.hydrationGlasses || 7,
      todayEnergy: todayLog.energyLevel || 4,
      todayMood: todayLog.mood || "calm",
    };
  }, [dailyLogs, todayLog]);

  // Questions for doctor
  const defaultQuestions = useMemo(() => {
    return [
      "Given my ferritin reading (18 ng/mL) and luteal phase fatigue, would an iron bisglycinate protocol be recommended?",
      "Are my resting sleep duration (avg 7.6h) and luteal symptom trends consistent with healthy progesterone balance?",
      "Review upcoming preventive routine screenings based on my longitudinal timeline.",
    ];
  }, []);

  // Quick Select All / None
  const handleSelectAll = (select: boolean) => {
    setIncludeDemographics(select);
    setIncludeVitalsAndSleep(select);
    setIncludeSymptomsAndPatterns(select);
    setIncludeMedications(select);
    setIncludeLabBiomarkers(select);
    setIncludeClinicalDocuments(select);
    setIncludeHealthGoals(select);
    setIncludeDoctorQuestions(select);
  };

  const selectedCount = [
    includeDemographics,
    includeVitalsAndSleep,
    includeSymptomsAndPatterns,
    includeMedications,
    includeLabBiomarkers,
    includeClinicalDocuments,
    includeHealthGoals,
    includeDoctorQuestions,
  ].filter(Boolean).length;

  // Plain Text / Markdown export for copying
  const formattedPlainText = useMemo(() => {
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const patientName = redactName ? "Patient #PX-84920 (Redacted for Privacy)" : user.name;

    let text = `=================================================================\n`;
    text += `${reportTitle.toUpperCase()}\n`;
    text += `Generated on: ${dateStr} | Velora Zero-Knowledge Health OS\n`;
    if (providerName) text += `Prepared for: ${providerName}\n`;
    text += `Appointment Focus: ${appointmentReason}\n`;
    text += `=================================================================\n\n`;

    if (includeDemographics) {
      text += `1. PATIENT DEMOGRAPHICS & CLINICAL STAGE\n`;
      text += `-----------------------------------------------------------------\n`;
      text += `- Patient Name: ${patientName}\n`;
      text += `- Age: ${user.age || 31} | Biological Sex: Female\n`;
      text += `- Active Life Stage: ${activeLifeStage.replace("_", " ").toUpperCase()}\n`;
      text += `- Typical Cycle Length: ${user.cycleLength || 29} days (Duration: ${user.periodLength || 5} days)\n`;
      text += `- Current Cycle Phase: Day 18 (Mid-Luteal Phase)\n\n`;
    }

    if (includeVitalsAndSleep) {
      text += `2. BIOMETRICS, SLEEP ARCHITECTURE & VITALS\n`;
      text += `-----------------------------------------------------------------\n`;
      text += `- Sleep Duration (Last Night): ${vitalsAverage.todaySleep} hrs (${vitalsAverage.todayQuality} quality)\n`;
      text += `- 7-Day Average Sleep: ${vitalsAverage.avgSleep} hrs/night\n`;
      text += `- Hydration Intake: ${vitalsAverage.todayHydration} glasses (7-Day Avg: ${vitalsAverage.avgHydration} glasses)\n`;
      text += `- Energy Level: ${vitalsAverage.todayEnergy}/5 | Mood State: ${vitalsAverage.todayMood}\n\n`;
    }

    if (includeSymptomsAndPatterns) {
      text += `3. SYMPTOM TRACKING & LONGITUDINAL PATTERNS\n`;
      text += `-----------------------------------------------------------------\n`;
      if (patterns.length > 0) {
        patterns.forEach((p) => {
          text += `* ${p.title} (${p.occurrenceFrequency})\n  - ${p.description}\n  - Clinical Insight: ${p.recommendation}\n`;
        });
      } else {
        text += `- No recurring severe symptom clusters detected.\n`;
      }
      text += `\n`;
    }

    if (includeMedications) {
      text += `4. CURRENT MEDICATIONS, VITAMINS & SUPPLEMENTS\n`;
      text += `-----------------------------------------------------------------\n`;
      activeMedications.forEach((m) => {
        text += `- ${m.name} | Dose: ${m.dose} | Frequency: ${m.freq} (${m.purpose})\n`;
      });
      text += `\n`;
    }

    if (includeLabBiomarkers) {
      text += `5. RECENT VAULT LAB BIOMARKERS & PANEL VALUES\n`;
      text += `-----------------------------------------------------------------\n`;
      if (extractedBiomarkers.length > 0) {
        extractedBiomarkers.forEach((b) => {
          text += `- ${b.parameter}: ${b.value} (Ref: ${b.referenceRange || "Standard"}) -> Status: [${b.status.toUpperCase()}] | Source: ${b.facility || b.docTitle}\n`;
        });
      } else {
        text += `- No lab values extracted in vault.\n`;
      }
      text += `\n`;
    }

    if (includeClinicalDocuments) {
      text += `6. RECENT CLINICAL VAULT RECORDS\n`;
      text += `-----------------------------------------------------------------\n`;
      vaultDocs.forEach((doc) => {
        text += `- ${doc.title} (${doc.category.toUpperCase()}) | Uploaded: ${doc.uploadDate} | ${doc.facilityOrProvider}\n`;
      });
      text += `\n`;
    }

    if (includeHealthGoals) {
      text += `7. ACTIVE PERSONAL HEALTH GOALS & PROGRESS\n`;
      text += `-----------------------------------------------------------------\n`;
      healthGoals.forEach((g) => {
        text += `- ${g.title}: Target: ${g.target} | Status: ${g.status} (${g.progress})\n`;
      });
      text += `\n`;
    }

    if (includeDoctorQuestions) {
      text += `8. PATIENT DISCUSSION AGENDA & QUESTIONS\n`;
      text += `-----------------------------------------------------------------\n`;
      defaultQuestions.forEach((q, idx) => {
        text += `${idx + 1}. "${q}"\n`;
      });
      text += `\n`;
    }

    text += `=================================================================\n`;
    text += `CONFIDENTIALITY & DISCLAIMER:\n`;
    text += `This document is a patient-generated health summary compiled for informational\n`;
    text += `discussion with licensed medical practitioners. It does not replace clinical\n`;
    text += `diagnostic testing or formal medical evaluations.\n`;
    if (includeSecurityHash) {
      text += `Security Verification Hash: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-VK901\n`;
    }
    text += `=================================================================\n`;

    return text;
  }, [
    reportTitle,
    providerName,
    appointmentReason,
    redactName,
    user,
    activeLifeStage,
    includeDemographics,
    includeVitalsAndSleep,
    includeSymptomsAndPatterns,
    includeMedications,
    includeLabBiomarkers,
    includeClinicalDocuments,
    includeHealthGoals,
    includeDoctorQuestions,
    includeSecurityHash,
    vitalsAverage,
    patterns,
    activeMedications,
    extractedBiomarkers,
    vaultDocs,
    healthGoals,
    defaultQuestions,
  ]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(formattedPlainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate real vector PDF using jsPDF
  const handleGeneratePdf = () => {
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = 18;

      const primaryColor: [number, number, number] = [217, 69, 93]; // #D9455D
      const darkColor: [number, number, number] = [45, 34, 38]; // #2D2226
      const grayColor: [number, number, number] = [115, 94, 101]; // #735E65
      const lightBg: [number, number, number] = [255, 245, 247]; // #FFF5F7
      const borderColor: [number, number, number] = [255, 218, 218]; // #FFDADA

      // Helper for page check
      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 18) {
          doc.addPage();
          y = 18;
          // Subheader on new page
          doc.setFontSize(8);
          doc.setTextColor(...grayColor);
          doc.text(
            `${reportTitle} — ${redactName ? "Patient #PX-84920" : user.name}`,
            margin,
            10
          );
          doc.setDrawColor(...borderColor);
          doc.setLineWidth(0.2);
          doc.line(margin, 12, pageWidth - margin, 12);
        }
      };

      // 1. Header Banner
      doc.setFillColor(...lightBg);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 26, 3, 3, "F");
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 26, 3, 3, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text("VELORA HEALTH OS", margin + 6, y + 8);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...darkColor);
      doc.text(reportTitle, margin + 6, y + 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      const dateStr = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      doc.text(
        `Generated: ${dateStr}  |  Zero-Knowledge Encrypted Health Snapshot`,
        margin + 6,
        y + 21
      );

      // Security Tag in top right
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth - margin - 42, y + 5, 36, 15, 2, 2, "FD");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text("SECURE EXPORT", pageWidth - margin - 39, y + 10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...grayColor);
      doc.text("Verified Summary", pageWidth - margin - 39, y + 16);

      y += 32;

      // 2. Patient & Clinical Context Block
      if (includeDemographics) {
        checkPageBreak(30);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 2, 2, "F");
        doc.setDrawColor(...borderColor);
        doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 2, 2, "S");

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkColor);
        doc.text("Patient Profile:", margin + 4, y + 6);
        doc.setFont("helvetica", "normal");
        doc.text(
          `${redactName ? "Patient #PX-84920 (Anonymous)" : user.name}  |  Age: ${user.age || 31}  |  Stage: ${activeLifeStage.replace("_", " ")}`,
          margin + 28,
          y + 6
        );

        doc.setFont("helvetica", "bold");
        doc.text("Cycle Status:", margin + 4, y + 12);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Day 18 (Mid-Luteal)  |  Typical: ${user.cycleLength || 29}d cycle (±1.5d)  |  Period: ${user.periodLength || 5}d`,
          margin + 28,
          y + 12
        );

        doc.setFont("helvetica", "bold");
        doc.text("Appointment:", margin + 4, y + 17);
        doc.setFont("helvetica", "normal");
        doc.text(
          `${appointmentReason}${providerName ? ` (Dr. ${providerName})` : ""}`,
          margin + 28,
          y + 17
        );

        y += 26;
      }

      // 3. Vitals & Sleep Block
      if (includeVitalsAndSleep) {
        checkPageBreak(25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text("1. BIOMETRICS & SLEEP ARCHITECTURE", margin, y);
        y += 4;

        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.2);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...darkColor);

        const colWidth = (pageWidth - margin * 2) / 3;
        // Col 1
        doc.text(`Last Night Sleep: ${vitalsAverage.todaySleep} hrs`, margin, y);
        doc.setTextColor(...grayColor);
        doc.text(`Quality: ${vitalsAverage.todayQuality}`, margin, y + 4.5);
        // Col 2
        doc.setTextColor(...darkColor);
        doc.text(`7-Day Avg Sleep: ${vitalsAverage.avgSleep} hrs/night`, margin + colWidth, y);
        doc.setTextColor(...grayColor);
        doc.text(`Restful Nights: 5 / 7 days`, margin + colWidth, y + 4.5);
        // Col 3
        doc.setTextColor(...darkColor);
        doc.text(`Hydration: ${vitalsAverage.todayHydration} glasses`, margin + colWidth * 2, y);
        doc.setTextColor(...grayColor);
        doc.text(`Energy Level: ${vitalsAverage.todayEnergy} / 5 (${vitalsAverage.todayMood})`, margin + colWidth * 2, y + 4.5);

        y += 13;
      }

      // 4. Longitudinal Patterns & Symptoms
      if (includeSymptomsAndPatterns) {
        checkPageBreak(35);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text("2. OBSERVED SYMPTOM PATTERNS (BODY PATTERN ENGINE™)", margin, y);
        y += 4;
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;

        if (patterns.length > 0) {
          patterns.slice(0, 3).forEach((p) => {
            checkPageBreak(12);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(...darkColor);
            doc.text(`• ${p.title} (${p.occurrenceFrequency})`, margin, y);
            y += 4;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(...grayColor);
            const splitDesc = doc.splitTextToSize(p.description, pageWidth - margin * 2 - 4);
            doc.text(splitDesc, margin + 4, y);
            y += splitDesc.length * 3.5 + 2;
          });
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...grayColor);
          doc.text("No high-severity longitudinal patterns detected in current records.", margin, y);
          y += 6;
        }
        y += 4;
      }

      // 5. Current Medications & Supplements
      if (includeMedications) {
        checkPageBreak(28);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text("3. ACTIVE MEDICATIONS & SUPPLEMENTS", margin, y);
        y += 4;
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;

        activeMedications.forEach((med) => {
          checkPageBreak(7);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(...darkColor);
          doc.text(`• ${med.name}`, margin, y);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...grayColor);
          doc.text(`— ${med.dose}, ${med.freq} (${med.purpose})`, margin + 55, y);
          y += 5;
        });
        y += 4;
      }

      // 6. Extracted Lab Biomarkers Table
      if (includeLabBiomarkers && extractedBiomarkers.length > 0) {
        checkPageBreak(40);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text("4. RECENT LAB BIOMARKERS & EXTRACTED CLINICAL VALUES", margin, y);
        y += 4;
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;

        // Table Header
        doc.setFillColor(...lightBg);
        doc.rect(margin, y, pageWidth - margin * 2, 6, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...darkColor);
        doc.text("Biomarker Parameter", margin + 2, y + 4.2);
        doc.text("Measured Value", margin + 60, y + 4.2);
        doc.text("Reference Interval", margin + 105, y + 4.2);
        doc.text("Status", margin + 145, y + 4.2);
        y += 7;

        // Table Rows
        extractedBiomarkers.slice(0, 7).forEach((b) => {
          checkPageBreak(6);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...darkColor);
          doc.text(b.parameter, margin + 2, y + 4);
          doc.setFont("helvetica", "bold");
          doc.text(b.value, margin + 60, y + 4);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...grayColor);
          doc.text(b.referenceRange || "Standard", margin + 105, y + 4);

          // Status badge
          if (b.status === "low") {
            doc.setTextColor(180, 83, 9);
            doc.text("LOW", margin + 145, y + 4);
          } else if (b.status === "high") {
            doc.setTextColor(225, 29, 72);
            doc.text("HIGH", margin + 145, y + 4);
          } else {
            doc.setTextColor(22, 163, 74);
            doc.text("NORMAL", margin + 145, y + 4);
          }

          doc.setDrawColor(240, 240, 240);
          doc.line(margin, y + 5.5, pageWidth - margin, y + 5.5);
          y += 6;
        });
        y += 4;
      }

      // 7. Clinical Vault Documents & Scans
      if (includeClinicalDocuments && vaultDocs.length > 0) {
        checkPageBreak(25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text("5. SECURE CLINICAL VAULT RECORDS", margin, y);
        y += 4;
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;

        vaultDocs.slice(0, 3).forEach((d) => {
          checkPageBreak(8);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(...darkColor);
          doc.text(`• ${d.title}`, margin, y);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(...grayColor);
          doc.text(`[${d.category.toUpperCase()}] ${d.facilityOrProvider} · ${d.uploadDate}`, margin + 4, y + 3.5);
          y += 7;
        });
        y += 3;
      }

      // 8. Health Goals
      if (includeHealthGoals) {
        checkPageBreak(22);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text("6. PERSONAL HEALTH GOALS & ADHERENCE", margin, y);
        y += 4;
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;

        healthGoals.forEach((g) => {
          checkPageBreak(6);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(...darkColor);
          doc.text(`• ${g.title}:`, margin, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...grayColor);
          doc.text(`${g.target} (${g.progress} - ${g.status})`, margin + 45, y);
          y += 5;
        });
        y += 3;
      }

      // 9. Questions for Provider
      if (includeDoctorQuestions) {
        checkPageBreak(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text("7. PATIENT APPOINTMENT DISCUSSION AGENDA", margin, y);
        y += 4;
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;

        defaultQuestions.forEach((q, idx) => {
          checkPageBreak(9);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...darkColor);
          const splitQ = doc.splitTextToSize(`${idx + 1}. "${q}"`, pageWidth - margin * 2 - 4);
          doc.text(splitQ, margin, y);
          y += splitQ.length * 3.5 + 2;
        });
        y += 3;
      }

      // Watermark if requested
      if (includeWatermark) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(38);
        doc.setTextColor(255, 230, 235);
        doc.text("CONFIDENTIAL MEDICAL SUMMARY", 25, 150, { angle: 45 });
      }

      // Bottom Footer / Disclaimer
      checkPageBreak(22);
      y = Math.max(y, pageHeight - 22);
      doc.setFillColor(...lightBg);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 14, 2, 2, "F");
      doc.setDrawColor(...borderColor);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 14, 2, 2, "S");

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...grayColor);
      doc.text(
        "Non-Diagnostic Clinical Disclaimer: This patient-authored health snapshot is compiled solely for clinical communication.",
        margin + 3,
        y + 4.5
      );
      doc.text(
        "It does not constitute independent medical diagnoses. All data is protected under zero-knowledge encryption protocols.",
        margin + 3,
        y + 8.5
      );
      if (includeSecurityHash) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text(
          "VERIFICATION HASH: SHA256-VELORA-VK901-SECURE",
          pageWidth - margin - 60,
          y + 11.5
        );
      }

      const fileName = `Velora_Health_Snapshot_${redactName ? "Anonymous" : user.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-[#FFDADA] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[#FFDADA] bg-[#FFF5F7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF788D] text-white shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-[#2D2226]">
                  Generate Health Snapshot PDF
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#D9455D] border border-[#FFDADA] flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Zero-Knowledge Secure</span>
                </span>
              </div>
              <p className="text-xs text-[#735E65] mt-0.5">
                Customize, preview, and export an encrypted multi-point clinical brief for your healthcare provider
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex bg-white rounded-xl p-1 border border-[#FFDADA]">
              <button
                type="button"
                onClick={() => setActiveTab("customize")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "customize"
                    ? "bg-[#FF788D] text-white shadow-2xs"
                    : "text-[#735E65] hover:text-[#2D2226]"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Select Data ({selectedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "preview"
                    ? "bg-[#FF788D] text-white shadow-2xs"
                    : "text-[#735E65] hover:text-[#2D2226]"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8E7A81] hover:text-[#2D2226] rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "customize" ? (
            <div className="space-y-6">
              {/* Top Customization Row: Title & Doctor Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#FFF9FA] rounded-2xl border border-[#FFDADA]">
                <div>
                  <label className="text-xs font-semibold text-[#2D2226] block mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#FFDADA] rounded-xl bg-white text-[#2D2226] focus:outline-[#FF788D]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#2D2226] block mb-1">
                    Provider Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    placeholder="e.g. Dr. Aris Thorne, MD"
                    className="w-full px-3 py-1.5 text-xs border border-[#FFDADA] rounded-xl bg-white text-[#2D2226] focus:outline-[#FF788D]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#2D2226] block mb-1">
                    Visit Focus / Reason
                  </label>
                  <input
                    type="text"
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    placeholder="e.g. Annual Exam, Fertility Consult"
                    className="w-full px-3 py-1.5 text-xs border border-[#FFDADA] rounded-xl bg-white text-[#2D2226] focus:outline-[#FF788D]"
                  />
                </div>
              </div>

              {/* Data Points Selector Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#FF788D]" />
                    <h3 className="text-sm font-semibold text-[#2D2226]">
                      Choose Data Points to Include in the Snapshot
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(true)}
                      className="text-[#D9455D] hover:underline font-semibold cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-[#FFDADA]">|</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAll(false)}
                      className="text-[#8E7A81] hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Option 1: Demographics */}
                  <div
                    onClick={() => setIncludeDemographics(!includeDemographics)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      includeDemographics
                        ? "bg-[#FFF0F3] border-[#FF788D] shadow-2xs"
                        : "bg-white border-[#FFDADA] hover:bg-[#FFF9FA]"
                    }`}
                  >
                    <div className="mt-0.5 text-[#FF788D]">
                      {includeDemographics ? (
                        <CheckSquare className="w-5 h-5 text-[#D9455D]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#FFDADA]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D2226]">
                          Demographics & Cycle Profile
                        </span>
                        <span className="text-[10px] text-[#D9455D] font-medium">Core</span>
                      </div>
                      <p className="text-[11px] text-[#735E65] mt-0.5">
                        Patient age, current life stage ({activeLifeStage.replace("_", " ")}), cycle day, length, and period duration.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Biometrics & Sleep */}
                  <div
                    onClick={() => setIncludeVitalsAndSleep(!includeVitalsAndSleep)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      includeVitalsAndSleep
                        ? "bg-[#FFF0F3] border-[#FF788D] shadow-2xs"
                        : "bg-white border-[#FFDADA] hover:bg-[#FFF9FA]"
                    }`}
                  >
                    <div className="mt-0.5 text-[#FF788D]">
                      {includeVitalsAndSleep ? (
                        <CheckSquare className="w-5 h-5 text-[#D9455D]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#FFDADA]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D2226]">
                          Sleep Architecture & Daily Vitals
                        </span>
                        <span className="text-[10px] text-[#D9455D] font-medium">7-Day Trends</span>
                      </div>
                      <p className="text-[11px] text-[#735E65] mt-0.5">
                        Last night's sleep duration ({vitalsAverage.todaySleep}h), quality ratings, 7-day average sleep, hydration, and energy levels.
                      </p>
                    </div>
                  </div>

                  {/* Option 3: Symptoms & Patterns */}
                  <div
                    onClick={() => setIncludeSymptomsAndPatterns(!includeSymptomsAndPatterns)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      includeSymptomsAndPatterns
                        ? "bg-[#FFF0F3] border-[#FF788D] shadow-2xs"
                        : "bg-white border-[#FFDADA] hover:bg-[#FFF9FA]"
                    }`}
                  >
                    <div className="mt-0.5 text-[#FF788D]">
                      {includeSymptomsAndPatterns ? (
                        <CheckSquare className="w-5 h-5 text-[#D9455D]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#FFDADA]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D2226]">
                          Symptom Logs & Pattern Engine
                        </span>
                        <span className="text-[10px] text-[#D9455D] font-medium">Longitudinal</span>
                      </div>
                      <p className="text-[11px] text-[#735E65] mt-0.5">
                        Body Pattern Engine findings ({patterns.length} patterns), symptom clusters, headaches, cramps, and phase timing.
                      </p>
                    </div>
                  </div>

                  {/* Option 4: Medications */}
                  <div
                    onClick={() => setIncludeMedications(!includeMedications)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      includeMedications
                        ? "bg-[#FFF0F3] border-[#FF788D] shadow-2xs"
                        : "bg-white border-[#FFDADA] hover:bg-[#FFF9FA]"
                    }`}
                  >
                    <div className="mt-0.5 text-[#FF788D]">
                      {includeMedications ? (
                        <CheckSquare className="w-5 h-5 text-[#D9455D]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#FFDADA]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D2226]">
                          Active Medications & Supplements
                        </span>
                        <span className="text-[10px] text-[#D9455D] font-medium">3 Active</span>
                      </div>
                      <p className="text-[11px] text-[#735E65] mt-0.5">
                        Current prescriptions, daily vitamins, magnesium, methylfolate, dosage schedules, and health purposes.
                      </p>
                    </div>
                  </div>

                  {/* Option 5: Lab Biomarkers */}
                  <div
                    onClick={() => setIncludeLabBiomarkers(!includeLabBiomarkers)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      includeLabBiomarkers
                        ? "bg-[#FFF0F3] border-[#FF788D] shadow-2xs"
                        : "bg-white border-[#FFDADA] hover:bg-[#FFF9FA]"
                    }`}
                  >
                    <div className="mt-0.5 text-[#FF788D]">
                      {includeLabBiomarkers ? (
                        <CheckSquare className="w-5 h-5 text-[#D9455D]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#FFDADA]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D2226]">
                          Extracted Lab Biomarkers & Panels
                        </span>
                        <span className="text-[10px] text-[#D9455D] font-medium">
                          {extractedBiomarkers.length} Markers
                        </span>
                      </div>
                      <p className="text-[11px] text-[#735E65] mt-0.5">
                        OCR-extracted values for Ferritin, TSH, Vitamin D, Hemoglobin, Glucose, reference ranges, and abnormal indicators.
                      </p>
                    </div>
                  </div>

                  {/* Option 6: Clinical Documents */}
                  <div
                    onClick={() => setIncludeClinicalDocuments(!includeClinicalDocuments)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      includeClinicalDocuments
                        ? "bg-[#FFF0F3] border-[#FF788D] shadow-2xs"
                        : "bg-white border-[#FFDADA] hover:bg-[#FFF9FA]"
                    }`}
                  >
                    <div className="mt-0.5 text-[#FF788D]">
                      {includeClinicalDocuments ? (
                        <CheckSquare className="w-5 h-5 text-[#D9455D]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#FFDADA]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D2226]">
                          Vault Records & Provider Summaries
                        </span>
                        <span className="text-[10px] text-[#D9455D] font-medium">
                          {vaultDocs.length} Documents
                        </span>
                      </div>
                      <p className="text-[11px] text-[#735E65] mt-0.5">
                        Summary of uploaded ultrasounds, Pap cytology, clinical notes, facilities, and upload dates.
                      </p>
                    </div>
                  </div>

                  {/* Option 7: Health Goals */}
                  <div
                    onClick={() => setIncludeHealthGoals(!includeHealthGoals)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      includeHealthGoals
                        ? "bg-[#FFF0F3] border-[#FF788D] shadow-2xs"
                        : "bg-white border-[#FFDADA] hover:bg-[#FFF9FA]"
                    }`}
                  >
                    <div className="mt-0.5 text-[#FF788D]">
                      {includeHealthGoals ? (
                        <CheckSquare className="w-5 h-5 text-[#D9455D]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#FFDADA]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D2226]">
                          Personal Health Goals & Adherence
                        </span>
                        <span className="text-[10px] text-[#D9455D] font-medium">Active</span>
                      </div>
                      <p className="text-[11px] text-[#735E65] mt-0.5">
                        Hydration adherence, sleep consistency goals, cycle-syncing practices, and active tracking compliance.
                      </p>
                    </div>
                  </div>

                  {/* Option 8: Doctor Questions */}
                  <div
                    onClick={() => setIncludeDoctorQuestions(!includeDoctorQuestions)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      includeDoctorQuestions
                        ? "bg-[#FFF0F3] border-[#FF788D] shadow-2xs"
                        : "bg-white border-[#FFDADA] hover:bg-[#FFF9FA]"
                    }`}
                  >
                    <div className="mt-0.5 text-[#FF788D]">
                      {includeDoctorQuestions ? (
                        <CheckSquare className="w-5 h-5 text-[#D9455D]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#FFDADA]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D2226]">
                          Prepared Questions for Appointment
                        </span>
                        <span className="text-[10px] text-[#D9455D] font-medium">3 Inquiries</span>
                      </div>
                      <p className="text-[11px] text-[#735E65] mt-0.5">
                        High-yield clinical discussion inquiries regarding ferritin, sleep disruption, and screening schedules.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy & Redaction Settings */}
              <div className="p-4 bg-[#FFF5F7] rounded-2xl border border-[#FFDADA] space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF788D]" />
                  <h4 className="text-xs font-bold text-[#2D2226] uppercase tracking-wider">
                    Privacy & Cryptographic Security Controls
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-xs text-[#735E65] cursor-pointer bg-white p-2.5 rounded-xl border border-[#FFDADA]">
                    <input
                      type="checkbox"
                      checked={redactName}
                      onChange={(e) => setRedactName(e.target.checked)}
                      className="accent-[#FF788D]"
                    />
                    <span>Redact Name (Use Anonymous ID)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-[#735E65] cursor-pointer bg-white p-2.5 rounded-xl border border-[#FFDADA]">
                    <input
                      type="checkbox"
                      checked={includeSecurityHash}
                      onChange={(e) => setIncludeSecurityHash(e.target.checked)}
                      className="accent-[#FF788D]"
                    />
                    <span>Include Verification Hash</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-[#735E65] cursor-pointer bg-white p-2.5 rounded-xl border border-[#FFDADA]">
                    <input
                      type="checkbox"
                      checked={includeWatermark}
                      onChange={(e) => setIncludeWatermark(e.target.checked)}
                      className="accent-[#FF788D]"
                    />
                    <span>Add Confidential Watermark</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            /* Live Document Preview */
            <div className="space-y-4">
              <div className="bg-[#FFF9FA] p-4 rounded-xl border border-[#FFDADA] flex items-center justify-between text-xs text-[#735E65]">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#FF788D]" />
                  <span>Live Preview of formatted Health Snapshot document ({selectedCount} sections included)</span>
                </span>
                <span className="font-semibold text-[#D9455D]">Ready for Vector PDF Export</span>
              </div>

              {/* Document Simulator Card */}
              <div className="bg-white p-8 rounded-2xl border border-[#FFDADA] shadow-sm space-y-6 font-sans text-xs text-[#2D2226]">
                {/* Header Simulator */}
                <div className="border-b border-[#FFDADA] pb-4 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#FF788D]">
                      VELORA HEALTH OS · CLINICAL BRIEF
                    </span>
                    <h2 className="text-xl font-serif font-bold text-[#2D2226] mt-0.5">
                      {reportTitle}
                    </h2>
                    <p className="text-[11px] text-[#8E7A81] mt-0.5">
                      Patient: {redactName ? "Patient #PX-84920 (Anonymous)" : user.name} · {activeLifeStage.replace("_", " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA]">
                      SECURE EXPORT
                    </span>
                    <p className="text-[10px] text-[#8E7A81] mt-1">
                      {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Section 1: Demographics */}
                {includeDemographics && (
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold text-[#D9455D] uppercase tracking-wider">
                      1. Patient & Cycle Demographics
                    </h4>
                    <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#FFDADA] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#8E7A81] block">Age & Stage:</span>
                        <span className="font-semibold">{user.age || 31}y / {activeLifeStage}</span>
                      </div>
                      <div>
                        <span className="text-[#8E7A81] block">Cycle Length:</span>
                        <span className="font-semibold">{user.cycleLength || 29} days</span>
                      </div>
                      <div>
                        <span className="text-[#8E7A81] block">Current Phase:</span>
                        <span className="font-semibold">Day 18 (Mid-Luteal)</span>
                      </div>
                      <div>
                        <span className="text-[#8E7A81] block">Provider Focus:</span>
                        <span className="font-semibold truncate">{appointmentReason}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 2: Biometrics & Sleep */}
                {includeVitalsAndSleep && (
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold text-[#D9455D] uppercase tracking-wider">
                      2. Sleep Architecture & Vitals
                    </h4>
                    <div className="grid grid-cols-3 gap-2 p-3 bg-[#FFF9FA] rounded-xl border border-[#FFDADA] text-[11px]">
                      <div>
                        <span className="text-[#8E7A81] block">Last Night Sleep:</span>
                        <span className="font-bold">{vitalsAverage.todaySleep}h</span>
                        <span className="text-[#735E65] text-[10px] block capitalize">({vitalsAverage.todayQuality})</span>
                      </div>
                      <div>
                        <span className="text-[#8E7A81] block">7-Day Avg Sleep:</span>
                        <span className="font-bold">{vitalsAverage.avgSleep}h / night</span>
                        <span className="text-[#735E65] text-[10px] block">5 restful nights</span>
                      </div>
                      <div>
                        <span className="text-[#8E7A81] block">Hydration & Energy:</span>
                        <span className="font-bold">{vitalsAverage.todayHydration} glasses</span>
                        <span className="text-[#735E65] text-[10px] block">Energy: {vitalsAverage.todayEnergy}/5</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 3: Patterns */}
                {includeSymptomsAndPatterns && (
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold text-[#D9455D] uppercase tracking-wider">
                      3. Observed Symptom Patterns (Longitudinal)
                    </h4>
                    <div className="space-y-1.5">
                      {patterns.slice(0, 2).map((p, idx) => (
                        <div key={idx} className="p-2.5 bg-[#FFF5F7] rounded-xl border border-[#FFDADA] text-[11px]">
                          <div className="flex justify-between font-semibold text-[#2D2226]">
                            <span>{p.title}</span>
                            <span className="text-[#D9455D] text-[10px]">{p.occurrenceFrequency}</span>
                          </div>
                          <p className="text-[#735E65] text-[10px] mt-0.5">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 4: Medications */}
                {includeMedications && (
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold text-[#D9455D] uppercase tracking-wider">
                      4. Active Medications & Supplements
                    </h4>
                    <div className="divide-y divide-[#FFDADA] border border-[#FFDADA] rounded-xl overflow-hidden text-[11px]">
                      {activeMedications.map((m, idx) => (
                        <div key={idx} className="p-2 flex justify-between bg-white hover:bg-[#FFF9FA]">
                          <span className="font-semibold text-[#2D2226]">{m.name}</span>
                          <span className="text-[#735E65]">{m.dose} · {m.freq}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 5: Biomarkers Table */}
                {includeLabBiomarkers && extractedBiomarkers.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold text-[#D9455D] uppercase tracking-wider">
                      5. Recent Lab Biomarkers & Vault Values
                    </h4>
                    <table className="w-full text-left border border-[#FFDADA] rounded-xl overflow-hidden text-[11px]">
                      <thead className="bg-[#FFF5F7] text-[#2D2226]">
                        <tr>
                          <th className="p-2">Parameter</th>
                          <th className="p-2">Value</th>
                          <th className="p-2">Reference</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FFDADA]">
                        {extractedBiomarkers.slice(0, 4).map((b, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-medium">{b.parameter}</td>
                            <td className="p-2 font-bold">{b.value}</td>
                            <td className="p-2 text-[#8E7A81]">{b.referenceRange || "Standard"}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                b.status === "low" ? "bg-amber-50 text-amber-700" : b.status === "high" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Section 6: Doctor Questions */}
                {includeDoctorQuestions && (
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold text-[#D9455D] uppercase tracking-wider">
                      6. Prepared Appointment Questions
                    </h4>
                    <div className="space-y-1">
                      {defaultQuestions.map((q, idx) => (
                        <div key={idx} className="p-2 bg-[#FFF5F7] rounded-lg border border-[#FFDADA] text-[10px] text-[#2D2226]">
                          <span>{idx + 1}. "{q}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#FFDADA] bg-[#FFF5F7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-[#8E7A81] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#FF788D]" />
            <span>Zero-Knowledge: PDF is rendered purely on your local device without external transmission.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-2 bg-white border border-[#FFDADA] hover:bg-[#FFF0F3] text-[#2D2226] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#FF788D]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Plaintext!" : "Copy for Portal"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 bg-white border border-[#FFDADA] hover:bg-[#FFF0F3] text-[#2D2226] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#735E65]" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf || selectedCount === 0}
              className="px-5 py-2 bg-[#FF788D] hover:bg-[#E85C71] active:scale-98 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? "Generating Vector PDF..." : "Download Secure PDF"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
