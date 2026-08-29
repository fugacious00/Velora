import React, { useEffect } from "react";
import { LogOut, X, AlertTriangle, ShieldCheck } from "lucide-react";

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  userName?: string;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  userName,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#FFDADA] space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon & Close */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 id="logout-title" className="text-base font-serif font-bold text-[#2D2226]">
                Sign Out of Velora?
              </h3>
              <p className="text-xs text-[#735E65]">Confirm account session termination</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-[#8E7A81] hover:text-[#2D2226] hover:bg-[#FFF5F7] rounded-xl transition-colors cursor-pointer"
            aria-label="Cancel and close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#FFDADA] space-y-2">
          <p className="text-xs text-[#2D2226] font-medium leading-relaxed">
            {userName ? (
              <>
                Are you sure you want to sign out, <strong className="text-[#D9455D]">{userName}</strong>?
              </>
            ) : (
              "Are you sure you really want to sign out of your account?"
            )}
          </p>
          <p className="text-[11px] text-[#735E65] leading-normal flex items-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Your encrypted health vault remains safe on this device. You will need to verify your credentials to access your records again.
            </span>
          </p>
        </div>

        {/* Action Buttons: Cancel vs Really Want To / Confirm */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#FFDADA] bg-white hover:bg-[#FFF5F7] text-xs font-bold text-[#735E65] hover:text-[#2D2226] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Yes, Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
