import React, { useState, useRef, useEffect } from "react";
import { useHealth } from "../context/HealthContext";
import { LIFE_STAGES } from "../data/initialData";
import {
  Sparkles,
  Send,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Plus,
  RefreshCw,
  Trash2,
  Mic,
  ArrowRight,
  Info,
  CheckCircle2,
  History,
  Clock,
  MessageSquare,
  ChevronDown,
  X,
} from "lucide-react";

interface CopilotViewProps {
  initialPrompt?: string;
  onOpenBrief: () => void;
}

// Inline formatting helper for bold text and clean sanitized rendering
function parseInlineFormatting(text: string): React.ReactNode {
  // Strip any stray markdown hashes from the line
  const sanitized = text.replace(/#{1,6}\s*/g, "");
  
  // Split by **bold** markers
  const parts = sanitized.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[#1F151B]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// Formatted Message Renderer that prevents raw hashtags (###) or dividers (---) from rendering as unstyled text
const FormattedMessageContent: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  if (isUser) {
    return <div className="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>;
  }

  // Pre-clean content: convert any raw markdown headings to bold titles, clean dividers
  const cleaned = content
    .replace(/^(#{1,6})\s+(.+)$/gm, "**$2**")
    .replace(/^(\s*[-*_]{3,}\s*)$/gm, "---DIVIDER---");

  const lines = cleaned.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={`spacer-${lineIdx}`} className="h-1.5" />);
      return;
    }

    if (trimmed === "---DIVIDER---") {
      elements.push(<hr key={`div-${lineIdx}`} className="border-t border-[#FFDADA]/60 my-2.5" />);
      return;
    }

    // Bullet points (• or - or *)
    if (trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const bulletText = trimmed.replace(/^[•\-*]\s*/, "");
      elements.push(
        <div key={`bullet-${lineIdx}`} className="flex items-start gap-2 text-sm text-[#2D2226] my-1 ml-0.5">
          <span className="text-[#FF788D] font-bold mt-0.5 text-xs shrink-0">•</span>
          <span className="leading-relaxed">{parseInlineFormatting(bulletText)}</span>
        </div>
      );
      return;
    }

    // Numbered list item: e.g. 1. or 2.
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch && !trimmed.startsWith("**")) {
      elements.push(
        <div key={`num-${lineIdx}`} className="flex items-start gap-2 text-sm text-[#2D2226] my-1 ml-0.5">
          <span className="text-[#D9455D] font-semibold text-xs shrink-0 mt-0.5">{numMatch[1]}.</span>
          <span className="leading-relaxed">{parseInlineFormatting(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Bold title / section header (e.g. **1. Section Title**)
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      const headingText = trimmed.replace(/^\*\*|\*\*$/g, "");
      elements.push(
        <h4 key={`heading-${lineIdx}`} className="text-sm font-bold text-[#2D2226] mt-3 mb-1 font-sans">
          {headingText}
        </h4>
      );
      return;
    }

    // Regular line
    elements.push(
      <p key={`p-${lineIdx}`} className="text-sm text-[#2D2226] leading-relaxed my-0.5">
        {parseInlineFormatting(line)}
      </p>
    );
  });

  return <div className="space-y-0.5">{elements}</div>;
};

export const CopilotView: React.FC<CopilotViewProps> = ({ initialPrompt, onOpenBrief }) => {
  const {
    copilotMessages,
    isCopilotLoading,
    sendCopilotMessage,
    clearCopilotHistory,
    copilotSessions,
    currentSessionId,
    createNewChatSession,
    switchChatSession,
    deleteChatSession,
    activeLifeStage,
    formatTerm,
  } = useHealth();

  const [input, setInput] = useState(initialPrompt || "");
  const [isRecording, setIsRecording] = useState(false);
  const [addedQuestions, setAddedQuestions] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const deleteConfirmRef = useRef<HTMLDivElement>(null);

  const stageConfig = LIFE_STAGES[activeLifeStage] || LIFE_STAGES.cycle_hormonal;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [copilotMessages, isCopilotLoading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  // Click outside listener for History and Delete popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setIsHistoryOpen(false);
      }
      if (deleteConfirmRef.current && !deleteConfirmRef.current.contains(e.target as Node)) {
        setShowDeleteConfirm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isCopilotLoading) return;

    setInput("");
    await sendCopilotMessage(query);
  };

  const handleAddQuestionToBrief = (question: string) => {
    if (!addedQuestions.includes(question)) {
      setAddedQuestions([...addedQuestions, question]);
    }
  };

  const handleStartNewChat = () => {
    createNewChatSession();
    setIsHistoryOpen(false);
    setInput("");
  };

  const handleDeleteCurrentChat = () => {
    deleteChatSession(currentSessionId);
    setShowDeleteConfirm(false);
    setIsHistoryOpen(false);
  };

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInput("Why do I experience headaches and lower energy right before my cycle starts?");
      }, 2000);
    }
  };

  const activeSession = copilotSessions.find((s) => s.id === currentSessionId);

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-white rounded-2xl border border-[#FFDADA] shadow-xs overflow-hidden">
      {/* 1. Header & AI Safety Architecture Ribbon */}
      <div className="p-4 sm:p-5 border-b border-[#FFDADA] bg-[#FFF5F7] relative z-20">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#FF788D] text-white shadow-2xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-serif font-bold text-[#2D2226] truncate">
                  Velora Health Copilot
                </h1>
                <span className="text-[10px] font-semibold bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA] px-2 py-0.5 rounded-full shrink-0 hidden sm:inline">
                  8-Step Safety Guard Active
                </span>
              </div>
              <p className="text-xs text-[#735E65] truncate">
                {activeSession?.title || "Grounding in your longitudinal logs & physiological science"}
              </p>
            </div>
          </div>

          {/* Top Right Action Header: History, Plus / New Chat, and Delete */}
          <div className="flex items-center gap-2 shrink-0">
            {/* History Dropdown Trigger */}
            <div className="relative" ref={historyRef}>
              <button
                type="button"
                onClick={() => {
                  setIsHistoryOpen(!isHistoryOpen);
                  setShowDeleteConfirm(false);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  isHistoryOpen
                    ? "bg-[#FF788D] text-white border-[#FF788D]"
                    : "bg-white hover:bg-[#FFF5F7] text-[#2D2226] border-[#FFDADA]"
                }`}
                title="Chat History"
              >
                <History className="w-4 h-4 text-inherit" />
                <span className="hidden sm:inline">History</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-black/10 rounded-full font-bold">
                  {copilotSessions.length}
                </span>
              </button>

              {/* History Dropdown Panel */}
              {isHistoryOpen && (
                <div className="absolute right-0 mt-2 w-76 sm:w-84 bg-white rounded-2xl border border-[#FFDADA] shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#FFDADA]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#FF788D]" />
                      <span className="text-xs font-bold text-[#2D2226]">Conversation History</span>
                    </div>
                    <button
                      onClick={() => setIsHistoryOpen(false)}
                      className="p-1 text-[#8E7A81] hover:text-[#2D2226] rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                    {copilotSessions.map((session) => {
                      const isActive = session.id === currentSessionId;
                      const msgCount = session.messages.filter((m) => m.role === "user").length;
                      return (
                        <div
                          key={session.id}
                          onClick={() => {
                            switchChatSession(session.id);
                            setIsHistoryOpen(false);
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                            isActive
                              ? "bg-[#FFF5F7] border-[#FF788D] shadow-2xs"
                              : "bg-white hover:bg-[#FAF8F9] border-[#FFDADA]/70"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#FF788D]" : "text-[#8E7A81]"}`} />
                              <p className={`text-xs font-semibold truncate ${isActive ? "text-[#D9455D]" : "text-[#2D2226]"}`}>
                                {session.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8E7A81]">
                              <span>{session.createdAt}</span>
                              <span>·</span>
                              <span>{session.messages.length} messages</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isActive && (
                              <span className="text-[10px] font-bold text-[#FF788D] bg-white px-2 py-0.5 rounded-md border border-[#FFDADA]">
                                Active
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChatSession(session.id);
                              }}
                              title="Delete conversation"
                              className="p-1 text-[#8E7A81] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-2 border-t border-[#FFDADA] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleStartNewChat}
                      className="w-full py-2 bg-[#FF788D] hover:bg-[#E85C71] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Start New Conversation</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Plus / New Chat Session Button */}
            <button
              type="button"
              onClick={handleStartNewChat}
              title="Start a new chat session"
              className="px-3 py-2 bg-[#FF788D] hover:bg-[#E85C71] text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {/* Delete / Clear Active Chat Button */}
            <div className="relative" ref={deleteConfirmRef}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                title="Delete current chat"
                className="p-2 text-[#8E7A81] hover:text-rose-600 hover:bg-rose-50 bg-white border border-[#FFDADA] rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Quick Delete Confirmation Popover */}
              {showDeleteConfirm && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-rose-200 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <p className="text-xs font-bold text-[#2D2226]">Delete this chat?</p>
                  <p className="text-[11px] text-[#735E65] mt-0.5">
                    This will remove the current conversation history.
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2.5 py-1 text-xs text-[#735E65] hover:bg-[#FAF8F9] rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteCurrentChat}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Messages Stream */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
        {copilotMessages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-[#FF788D] text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4 sm:p-5 space-y-3 ${
                  isUser
                    ? "bg-[#FF788D] text-white rounded-tr-xs"
                    : "bg-[#FFF5F7] border border-[#FFDADA] text-[#2D2226] rounded-tl-xs shadow-xs"
                }`}
              >
                {/* Emergency Red-flag banner if detected */}
                {msg.isEmergencyAlert && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-800">Medical Safety Alert</p>
                      <p className="mt-0.5 text-rose-700">
                        These symptoms warrant prompt evaluation by a licensed healthcare professional or urgent care center.
                      </p>
                    </div>
                  </div>
                )}

                {/* Primary Content */}
                <div className="text-sm leading-relaxed">
                  <FormattedMessageContent content={msg.content} isUser={isUser} />
                </div>

                {/* Doctor Questions Recommendations */}
                {msg.doctorQuestions && msg.doctorQuestions.length > 0 && (
                  <div className="pt-2 border-t border-[#FFDADA] space-y-2">
                    <p className="text-xs font-semibold text-[#2D2226] flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#FF788D]" />
                      <span>Questions Recommended For Your Doctor:</span>
                    </p>
                    <div className="space-y-1.5">
                      {msg.doctorQuestions.map((q, idx) => {
                        const isAdded = addedQuestions.includes(q);
                        return (
                          <div
                            key={idx}
                            className="text-xs bg-white p-2.5 rounded-xl border border-[#FFDADA] flex items-center justify-between gap-2"
                          >
                            <span className="text-[#2D2226]">"{q}"</span>
                            <button
                              onClick={() => handleAddQuestionToBrief(q)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors cursor-pointer ${
                                isAdded
                                  ? "bg-[#FFF5F7] text-[#D9455D] border border-[#FFDADA]"
                                  : "bg-white text-[#D9455D] hover:bg-[#FFF5F7] border border-[#FFDADA]"
                              }`}
                            >
                              {isAdded ? "✓ In Doctor Brief" : "+ Add to Brief"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Non-Diagnostic Disclaimer Pill */}
                {!isUser && (
                  <div className="flex items-center justify-between text-[11px] text-[#8E7A81] pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#FF788D]" />
                      <span>Non-Diagnostic Educational Information</span>
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isCopilotLoading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-[#FF788D] text-white flex items-center justify-center shrink-0 mt-1 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-[#FFF5F7] border border-[#FFDADA] rounded-2xl rounded-tl-xs p-4 text-xs text-[#735E65] flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#FF788D] animate-spin" />
              <span>Synthesizing your health context and validating clinical safety rules...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Suggested Prompts Tray */}
      <div className="p-3 bg-[#FFF5F7] border-t border-[#FFDADA] flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-semibold text-[#735E65] uppercase tracking-wider shrink-0">
          Suggested:
        </span>
        {stageConfig.suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isCopilotLoading}
            className="text-xs bg-white hover:bg-[#FFF5F7] hover:text-[#D9455D] text-[#2D2226] px-3 py-1.5 rounded-xl border border-[#FFDADA] whitespace-nowrap transition-colors shrink-0 shadow-2xs cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* 4. Input Bar */}
      <div className="p-4 border-t border-[#FFDADA] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isRecording
                ? "bg-rose-50 border-rose-300 text-rose-600 animate-pulse"
                : "bg-[#FFF5F7] border-[#FFDADA] text-[#735E65] hover:bg-[#FFEDF1]"
            }`}
            title="Simulate Voice Input"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your symptoms, cycle patterns, lab values, or doctor questions..."
            className="flex-1 px-4 py-2.5 text-xs border border-[#FFDADA] rounded-xl bg-[#FFF5F7] focus:outline-none focus:ring-1 focus:ring-[#FF788D] text-[#2D2226] placeholder-[#8E7A81]"
          />

          <button
            type="submit"
            disabled={!input.trim() || isCopilotLoading}
            className="px-4 py-2.5 bg-[#FF788D] hover:bg-[#E85C71] disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
