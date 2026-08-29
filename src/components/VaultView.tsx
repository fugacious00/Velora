import React, { useState } from "react";
import { useHealth } from "../context/HealthContext";
import { VaultCategory, VaultDocument } from "../types";
import { HealthSnapshotModal } from "./HealthSnapshotModal";
import {
  ShieldCheck,
  FileText,
  Upload,
  Plus,
  Lock,
  Trash2,
  Eye,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  AlertCircle,
  X,
  FilePlus,
  Filter,
  Download,
  FileDown,
  Layers,
  Calendar,
} from "lucide-react";

export const VaultView: React.FC = () => {
  const { vaultDocs, addVaultDocument, deleteVaultDocument, formatTerm } = useHealth();
  const [selectedCategory, setSelectedCategory] = useState<VaultCategory | "all">("all");
  const [activeDoc, setActiveDoc] = useState<VaultDocument | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);

  // New Document Upload State
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState<VaultCategory>("lab_report");
  const [facility, setFacility] = useState("");
  const [rawText, setRawText] = useState("");
  const [aiAccess, setAiAccess] = useState(true);
  const [doctorShare, setDoctorShare] = useState(true);

  const categories: { id: VaultCategory | "all"; label: string }[] = [
    { id: "all", label: "All Records" },
    { id: "lab_report", label: "Lab Reports" },
    { id: "prescription", label: "Prescriptions" },
    { id: "scan", label: "Ultrasound & Scans" },
    { id: "doctor_notes", label: "Doctor Notes" },
    { id: "vaccination", label: "Vaccines" },
    { id: "allergies", label: "Allergies & Sensitivities" },
  ];

  const filteredDocs = vaultDocs.filter(
    (d) => selectedCategory === "all" || d.category === selectedCategory
  );

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    setIsProcessingOcr(true);

    try {
      const created = await addVaultDocument({
        title: docTitle,
        category: docCategory,
        fileType: "PDF",
        fileSize: "1.2 MB",
        facilityOrProvider: facility || "General Clinical Health Network",
        isEncrypted: true,
        rawText: rawText || undefined,
        extractedFacts: [],
        summary: "Extracted and encrypted securely.",
        accessPolicy: {
          userAccess: true,
          aiAccess,
          doctorShare,
          familyShare: false,
        },
      });

      setIsUploadModalOpen(false);
      setDocTitle("");
      setFacility("");
      setRawText("");
      setActiveDoc(created);
    } finally {
      setIsProcessingOcr(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#D9455D] bg-[#FFF5F7] px-2.5 py-0.5 rounded-full border border-[#FFDADA] flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#FF788D]" />
              <span>Zero-Knowledge Encryption</span>
            </span>
            <span className="text-xs text-[#8E7A81]">Encrypted Health Vault</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2D2226] mt-1">
            Velora Health Vault
          </h1>
          <p className="text-xs text-[#735E65] mt-1 max-w-xl">
            Secure storage for lab panels, prescriptions, ultrasounds, and clinical records with objective OCR fact extraction.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsSnapshotModalOpen(true)}
            className="px-4 py-2.5 bg-[#FFF0F3] hover:bg-[#FFE5E9] active:scale-98 text-[#D9455D] border border-[#FFDADA] hover:border-[#FF788D] text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-[#FF788D]" />
            <span>Generate Health Snapshot (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 bg-[#FF788D] hover:bg-[#E85C71] active:scale-98 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Health Snapshot Quick-Generator Hero Card */}
      <div className="bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF9FA] p-6 rounded-2xl border border-[#FFDADA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FF788D] text-white tracking-wider uppercase shadow-2xs">
              Clinical Export Suite
            </span>
            <span className="text-xs font-semibold text-[#735E65] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF788D]" />
              <span>Multi-Data Point Selective PDF Compiler</span>
            </span>
          </div>

          <div>
            <h2 className="text-lg font-serif font-bold text-[#2D2226]">
              Comprehensive Health Snapshot & Provider Brief
            </h2>
            <p className="text-xs text-[#735E65] mt-1 leading-relaxed">
              Compile your longitudinal biometrics, sleep architecture, symptom patterns, active medications, and vault lab panels into an encrypted, vector PDF formatted for healthcare consultations and patient portals.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {[
              "Demographics & Cycle Phase",
              "Sleep & 7-Day Vitals",
              "Symptom Patterns",
              "Medications & Doses",
              "Extracted Biomarkers",
              "Vault Documents",
              "Personal Goals",
              "Doctor Questions",
            ].map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium bg-white text-[#735E65] px-2.5 py-1 rounded-lg border border-[#FFDADA] shadow-2xs"
              >
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 relative z-10">
          <button
            type="button"
            onClick={() => setIsSnapshotModalOpen(true)}
            className="px-5 py-3 bg-[#FF788D] hover:bg-[#E85C71] active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Customize & Download PDF</span>
          </button>
          <div className="text-[10px] text-center text-[#8E7A81] flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-[#FF788D]" />
            <span>Local Vector Rendering · Zero Cloud Leaks</span>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 bg-white p-3 rounded-2xl border border-[#FFDADA] shadow-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-[#FF788D] text-white border-[#FF788D] shadow-2xs font-semibold"
                : "bg-[#FFF5F7] border-[#FFDADA] text-[#735E65] hover:bg-[#FFEDF1]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setActiveDoc(doc)}
            className="bg-white rounded-2xl p-5 border border-[#FFDADA] hover:border-[#FF788D] hover:shadow-xs transition-all cursor-pointer space-y-4 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="p-2.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] group-hover:bg-[#FFEDF1] transition-colors">
                  <FileText className="w-5 h-5 text-[#FF788D]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold bg-[#FFF5F7] text-[#D9455D] px-2 py-0.5 rounded-md uppercase border border-[#FFDADA]">
                    {doc.fileType}
                  </span>
                  <span className="text-[10px] text-[#D9455D] bg-[#FFF5F7] border border-[#FFDADA] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Encrypted</span>
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#2D2226] group-hover:text-[#FF788D] line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-[#735E65] mt-1">
                  {doc.facilityOrProvider}
                </p>
                <p className="text-[11px] text-[#8E7A81] mt-0.5">
                  Uploaded on {doc.uploadDate} · {doc.fileSize}
                </p>
              </div>

              {doc.extractedFacts && doc.extractedFacts.length > 0 && (
                <div className="bg-[#FFF5F7] p-2.5 rounded-xl border border-[#FFDADA] space-y-1">
                  <p className="text-[10px] font-semibold text-[#8E7A81] uppercase tracking-wider">
                    Key Extracted Facts ({doc.extractedFacts.length})
                  </p>
                  <div className="space-y-0.5">
                    {doc.extractedFacts.slice(0, 2).map((fact, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-[#735E65] truncate max-w-[120px]">
                          {fact.parameter}
                        </span>
                        <span
                          className={`font-semibold ${
                            fact.status === "low"
                              ? "text-amber-700"
                              : fact.status === "high"
                              ? "text-rose-700"
                              : "text-[#2D2226]"
                          }`}
                        >
                          {fact.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#FFDADA] text-xs">
              <span className="text-[#FF788D] font-semibold group-hover:underline flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>View Extracted Facts</span>
              </span>
              <span className="text-[#8E7A81] text-[10px]">
                {doc.accessPolicy.aiAccess ? "AI Enabled" : "Private Only"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Document Detail Preview Drawer / Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-[#FFDADA] space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#FFDADA] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA] px-2.5 py-0.5 rounded-full uppercase">
                    {activeDoc.category.replace("_", " ")}
                  </span>
                  <span className="text-xs text-[#8E7A81]">
                    {activeDoc.facilityOrProvider} · {activeDoc.uploadDate}
                  </span>
                </div>
                <h2 className="text-xl font-serif font-bold text-[#2D2226]">
                  {activeDoc.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveDoc(null)}
                className="p-1.5 text-[#8E7A81] hover:text-[#2D2226] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Non-Diagnostic Safety Callout */}
            <div className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#FFDADA] text-xs text-[#735E65] space-y-1">
              <div className="flex items-center gap-1.5 text-[#2D2226] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#FF788D]" />
                <span>Objective Fact Extraction (Strict Non-Diagnostic Policy)</span>
              </div>
              <p>
                Velora extracts documented numerical parameters and clinician notes verbatim. It does not generate medical diagnoses. Discuss these values with your healthcare provider.
              </p>
            </div>

            {/* Summary */}
            {activeDoc.summary && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#2D2226] uppercase tracking-wider">
                  Document Overview
                </h4>
                <p className="text-xs text-[#735E65] leading-relaxed bg-[#FFF5F7] p-3 rounded-xl border border-[#FFDADA]">
                  {activeDoc.summary}
                </p>
              </div>
            )}

            {/* Extracted Facts Table */}
            {activeDoc.extractedFacts && activeDoc.extractedFacts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#2D2226] uppercase tracking-wider">
                  Extracted Biomarkers & Clinical Parameters
                </h4>
                <div className="border border-[#FFDADA] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#FFF5F7] text-[#2D2226] border-b border-[#FFDADA]">
                      <tr>
                        <th className="p-2.5 font-semibold">Parameter</th>
                        <th className="p-2.5 font-semibold">Measured Value</th>
                        <th className="p-2.5 font-semibold">Standard Reference</th>
                        <th className="p-2.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FFDADA]">
                      {activeDoc.extractedFacts.map((fact, idx) => (
                        <tr key={idx} className="hover:bg-[#FFF5F7]/50">
                          <td className="p-2.5 font-medium text-[#2D2226]">{fact.parameter}</td>
                          <td className="p-2.5 font-bold text-[#2D2226]">{fact.value}</td>
                          <td className="p-2.5 text-[#8E7A81]">{fact.referenceRange || "—"}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                fact.status === "low"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : fact.status === "high"
                                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                                  : "bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA]"
                              }`}
                            >
                              {fact.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Clinician Instructions */}
            {activeDoc.clinicianInstructions && activeDoc.clinicianInstructions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#2D2226] uppercase tracking-wider">
                  Documented Clinician Follow-ups
                </h4>
                <ul className="space-y-1">
                  {activeDoc.clinicianInstructions.map((inst, idx) => (
                    <li key={idx} className="text-xs text-[#735E65] flex items-start gap-2 bg-[#FFF5F7] p-2 rounded-lg border border-[#FFDADA]">
                      <span className="text-[#FF788D] font-bold">•</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Questions for Doctor */}
            {activeDoc.recommendedDoctorQuestions && activeDoc.recommendedDoctorQuestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#2D2226] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF788D]" />
                  <span>Suggested Doctor Agenda Inquiries</span>
                </h4>
                <div className="space-y-1.5">
                  {activeDoc.recommendedDoctorQuestions.map((q, idx) => (
                    <div key={idx} className="text-xs text-[#2D2226] bg-[#FFF5F7] border border-[#FFDADA] p-2.5 rounded-lg">
                      <span>"{q}"</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#FFDADA]">
              <button
                onClick={() => {
                  deleteVaultDocument(activeDoc.id);
                  setActiveDoc(null);
                }}
                className="text-xs font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 p-2 rounded-lg hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Document</span>
              </button>

              <button
                onClick={() => setActiveDoc(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#FF788D] hover:bg-[#E85C71] rounded-xl cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#FFDADA] space-y-4">
            <div className="flex items-center justify-between border-b border-[#FFDADA] pb-3">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#2D2226]">
                  Upload & Encrypt Health Document
                </h2>
                <p className="text-xs text-[#8E7A81]">
                  OCR automatically extracts lab values and clinician notes
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-[#8E7A81] hover:text-[#2D2226] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#2D2226] block mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Comprehensive Hormone & Ferritin Panel"
                  className="w-full px-3 py-2 text-sm border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#2D2226] block mb-1">
                    Category
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as VaultCategory)}
                    className="w-full px-3 py-2 text-sm border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226]"
                  >
                    <option value="lab_report">Lab Report</option>
                    <option value="prescription">Prescription</option>
                    <option value="scan">Ultrasound / Scan</option>
                    <option value="doctor_notes">Doctor Visit Notes</option>
                    <option value="vaccination">Vaccination Record</option>
                    <option value="allergies">Allergy Documentation</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#2D2226] block mb-1">
                    Lab / Provider Clinic
                  </label>
                  <input
                    type="text"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    placeholder="e.g. Quest Diagnostics"
                    className="w-full px-3 py-2 text-sm border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#2D2226] block mb-1">
                  Document Text / Lab Values (Optional Raw Paste or Simulation)
                </label>
                <textarea
                  rows={4}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste test results: Ferritin 18 ng/mL, TSH 2.1 mIU/L, Vitamin D 28 ng/mL..."
                  className="w-full p-2.5 text-xs border border-[#FFDADA] rounded-xl placeholder-[#8E7A81] bg-[#FFF5F7] text-[#2D2226]"
                />
              </div>

              {/* Granular Permissions for this Document */}
              <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#FFDADA] space-y-2">
                <span className="text-xs font-semibold text-[#2D2226] block">
                  Document Privacy Controls
                </span>
                <label className="flex items-center gap-2 text-xs text-[#735E65] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiAccess}
                    onChange={(e) => setAiAccess(e.target.checked)}
                    className="accent-[#FF788D]"
                  />
                  <span>Allow Velora Copilot to read this document for pattern analysis</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#735E65] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doctorShare}
                    onChange={(e) => setDoctorShare(e.target.checked)}
                    className="accent-[#FF788D]"
                  />
                  <span>Include key markers in generated Doctor Briefs</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#FFDADA]">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#8E7A81] hover:bg-[#FFF5F7] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingOcr}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#FF788D] hover:bg-[#E85C71] rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isProcessingOcr ? "Extracting Facts..." : "Encrypt & Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive Health Snapshot Modal */}
      <HealthSnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
      />
    </div>
  );
};
