import React, { useState } from "react";
import { useHealth } from "../context/HealthContext";
import { TimelineCategory, TimelineEvent } from "../types";
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Droplets,
  Activity,
  UserCheck,
  Pill,
  FileText,
  Heart,
  Sparkles,
  CheckCircle2,
  X,
  Clock,
  Tag,
} from "lucide-react";

export const TimelineView: React.FC = () => {
  const { timeline, addTimelineEvent, formatTerm } = useHealth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TimelineCategory | "all">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newCategory, setNewCategory] = useState<TimelineCategory>("appointment");
  const [newDate, setNewDate] = useState("2026-08-21");
  const [newDetails, setNewDetails] = useState("");
  const [newTags, setNewTags] = useState("");

  const categories: { id: TimelineCategory | "all"; label: string }[] = [
    { id: "all", label: "All Events" },
    { id: "cycle", label: "Cycle & Flow" },
    { id: "symptom", label: "Symptoms" },
    { id: "appointment", label: "Doctor Appointments" },
    { id: "medication", label: "Medications" },
    { id: "vault", label: "Vault Records" },
    { id: "vitals", label: "Vitals & Temp" },
    { id: "milestone", label: "Milestones" },
  ];

  const getCategoryIcon = (cat: TimelineCategory) => {
    switch (cat) {
      case "cycle":
        return <Droplets className="w-4 h-4 text-rose-500" />;
      case "symptom":
        return <Activity className="w-4 h-4 text-amber-500" />;
      case "appointment":
        return <UserCheck className="w-4 h-4 text-teal-600" />;
      case "medication":
        return <Pill className="w-4 h-4 text-indigo-500" />;
      case "vault":
        return <FileText className="w-4 h-4 text-sky-600" />;
      case "vitals":
        return <Heart className="w-4 h-4 text-emerald-500" />;
      case "milestone":
        return <Sparkles className="w-4 h-4 text-violet-500" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredTimeline = timeline.filter((evt) => {
    const matchesCategory = selectedCategory === "all" || evt.category === selectedCategory;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.subtitle && evt.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.details && evt.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.tags && evt.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTimelineEvent({
      date: newDate,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category: newCategory,
      title: newTitle,
      subtitle: newSubtitle || undefined,
      details: newDetails || undefined,
      severity: "normal",
      tags: newTags
        ? newTags.split(",").map((t) => t.trim()).filter(Boolean)
        : [newCategory],
    });

    setIsAddModalOpen(false);
    setNewTitle("");
    setNewSubtitle("");
    setNewDetails("");
    setNewTags("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#FFDADA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#D9455D] bg-[#FFF5F7] px-2.5 py-0.5 rounded-full border border-[#FFDADA]">
              Longitudinal Health Journey
            </span>
            <span className="text-xs text-[#8E7A81]">Continuous Chronological Record</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2D2226] mt-1">
            Velora Health Timeline
          </h1>
          <p className="text-xs text-[#735E65] mt-1">
            A continuous historical record of your cycle events, symptom patterns, appointments, medications, and clinical documents.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#FF788D] hover:bg-[#E85C71] active:scale-98 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#FFDADA] shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E7A81] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms, appointments, medications, lab tests..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226] placeholder-[#8E7A81] focus:outline-none focus:ring-2 focus:ring-[#FF788D]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#FF788D] text-white border-[#FF788D] shadow-2xs font-semibold"
                  : "bg-[#FFF5F7] border-[#FFDADA] text-[#735E65] hover:bg-[#FFEDF1]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-4">
        {filteredTimeline.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#FFDADA] p-8 space-y-3 shadow-xs">
            <Calendar className="w-10 h-10 text-[#8E7A81] mx-auto opacity-50" />
            <h3 className="text-sm font-semibold text-[#2D2226]">No Events Found</h3>
            <p className="text-xs text-[#8E7A81] max-w-sm mx-auto">
              No health entries match your current filter. Log a daily check-in or add a custom appointment.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#FFDADA] space-y-4">
            {filteredTimeline.map((evt) => (
              <div
                key={evt.id}
                className="relative bg-white rounded-2xl p-5 border border-[#FFDADA] shadow-xs hover:border-[#FF788D] transition-all space-y-2 group"
              >
                {/* Visual Dot */}
                <div className="absolute -left-6 sm:-left-8 top-5 w-4 h-4 rounded-full bg-white border-2 border-[#FF788D] ring-4 ring-[#FFF9FA] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF788D]" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#FFDADA] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-[#FFF5F7] border border-[#FFDADA]">
                      {getCategoryIcon(evt.category)}
                    </span>
                    <h3 className="text-sm font-semibold text-[#2D2226]">
                      {evt.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#8E7A81] font-medium">
                    <span>{evt.date}</span>
                    {evt.time && <span>· {evt.time}</span>}
                  </div>
                </div>

                {evt.subtitle && (
                  <p className="text-xs font-medium text-[#2D2226]">
                    {evt.subtitle}
                  </p>
                )}

                {evt.details && (
                  <p className="text-xs text-[#735E65] leading-relaxed bg-[#FFF5F7] p-2.5 rounded-lg border border-[#FFDADA]">
                    {evt.details}
                  </p>
                )}

                {evt.tags && evt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {evt.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-[#FFF5F7] text-[#D9455D] px-2 py-0.5 rounded-md border border-[#FFDADA]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#FFDADA] space-y-4">
            <div className="flex items-center justify-between border-b border-[#FFDADA] pb-3">
              <h2 className="text-lg font-serif font-bold text-[#2D2226]">
                Add Health Timeline Event
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#8E7A81] hover:text-[#2D2226] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-[#2D2226] block mb-1">
                  Event Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as TimelineCategory)}
                  className="w-full px-3 py-2 text-sm border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226]"
                >
                  <option value="appointment">Doctor Appointment / Visit</option>
                  <option value="medication">Medication / Prescription Change</option>
                  <option value="symptom">Symptom Cluster</option>
                  <option value="vault">Lab Result / Scan Note</option>
                  <option value="vitals">Vital Signs / Measurements</option>
                  <option value="milestone">Life Milestone</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[#2D2226] block mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. OB/GYN Pelvic Consultation, Thyroid Check..."
                  className="w-full px-3 py-2 text-sm border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#2D2226] block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#2D2226] block mb-1">
                    Provider / Clinic (Optional)
                  </label>
                  <input
                    type="text"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    placeholder="e.g. Dr. Thorne, Cascade Labs"
                    className="w-full px-3 py-2 text-sm border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#2D2226] block mb-1">
                  Clinical Notes & Discussion Points
                </label>
                <textarea
                  rows={3}
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Instructions from clinician, dosage changes, questions discussed..."
                  className="w-full p-2.5 text-xs border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#2D2226] block mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. OBGYN, Routine, Iron"
                  className="w-full px-3 py-1.5 text-xs border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#FFDADA]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#8E7A81] hover:bg-[#FFF5F7] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#FF788D] hover:bg-[#E85C71] rounded-xl cursor-pointer shadow-xs"
                >
                  Save to Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
