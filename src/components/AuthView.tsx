import React, { useState, useEffect, useRef } from "react";
import { useHealth } from "../context/HealthContext";
import { LifeStage } from "../types";
import { LIFE_STAGES } from "../data/initialData";
import { VeloraAppLogo, VeloraEmblem } from "./VeloraAppLogo";
import { VerticalScrollRail } from "./VerticalScrollRail";
import {
  Shield,
  BarChart2,
  Heart,
  Flower2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Key,
  Smartphone,
  Fingerprint,
  RefreshCw,
  Check,
  Clock,
  ShieldCheck,
  QrCode,
  Send,
  Zap,
} from "lucide-react";

// Re-export compatibility logos
export const VeloraLotusLogo = VeloraAppLogo;
export const VeloraBrandEmblem = VeloraEmblem;

export const AuthView: React.FC = () => {
  const { login, signup, requestPasswordReset } = useHealth();

  // Mode: "signin" | "signup" | "forgot"
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">("signin");
  
  // Step: 1 (Credentials/Profile) | 2 (Verification & Biometric Challenge)
  const [authStep, setAuthStep] = useState<1 | 2>(1);

  // Sign In Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  // Sign Up Extra Fields
  const [name, setName] = useState("");
  const [selectedLifeStage, setSelectedLifeStage] = useState<LifeStage>("cycle_hormonal");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [enableBiometricEnrollment, setEnableBiometricEnrollment] = useState(true);

  // Verification (Step 2) state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [demoOtpCode, setDemoOtpCode] = useState<string>("849205");
  const [verificationMethod, setVerificationMethod] = useState<"email_otp" | "biometric" | "authenticator">("email_otp");
  const [resendCountdown, setResendCountdown] = useState<number>(45);
  const [isResendActive, setIsResendActive] = useState<boolean>(false);
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [biometricSuccess, setBiometricSuccess] = useState<boolean>(false);

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [newPassword, setNewPassword] = useState("");

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Input refs for 6-digit OTP
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Countdown Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authStep === 2 && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [authStep, resendCountdown]);

  // Focus the first OTP input when step 2 opens
  useEffect(() => {
    if (authStep === 2 && verificationMethod === "email_otp") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [authStep, verificationMethod]);

  // Generate a realistic demo OTP code whenever step 2 is triggered
  const generateNewDemoCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setDemoOtpCode(code);
    setResendCountdown(45);
    return code;
  };

  // Helper to mask email for verification display
  const getMaskedEmail = (rawEmail: string) => {
    const target = rawEmail.trim() || "maya.lin@velora.health";
    const parts = target.split("@");
    if (parts.length !== 2) return target;
    const namePart = parts[0];
    const domain = parts[1];
    if (namePart.length <= 2) return `${namePart}***@${domain}`;
    return `${namePart.charAt(0)}***${namePart.charAt(namePart.length - 1)}@${domain}`;
  };

  // Calculate password strength
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: "Too short", color: "bg-gray-200" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd) || /[A-Z]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: "Weak", color: "bg-rose-400" };
      case 2:
        return { score: 2, label: "Fair", color: "bg-amber-400" };
      case 3:
        return { score: 3, label: "Good", color: "bg-emerald-400" };
      case 4:
        return { score: 4, label: "Strong & Encrypted", color: "bg-emerald-600" };
      default:
        return { score: 0, label: "Too short", color: "bg-gray-200" };
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, "");
    
    // If multiple digits pasted in one box
    if (numericValue.length > 1) {
      const chars = numericValue.slice(0, 6).split("");
      const newOtp = [...otpDigits];
      chars.forEach((c, idx) => {
        if (idx < 6) newOtp[idx] = c;
      });
      setOtpDigits(newOtp);
      const nextIndex = Math.min(chars.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otpDigits];
    newOtp[index] = numericValue;
    setOtpDigits(newOtp);

    // Auto advance to next input
    if (numericValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasteData) {
      const chars = pasteData.split("");
      const newOtp = ["", "", "", "", "", ""];
      chars.forEach((c, i) => {
        if (i < 6) newOtp[i] = c;
      });
      setOtpDigits(newOtp);
      const nextFocus = Math.min(chars.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
    }
  };

  const handleAutoFillDemoCode = () => {
    const chars = demoOtpCode.split("");
    setOtpDigits(chars);
    setSuccessToast(`Applied 6-digit verification code: ${demoOtpCode}`);
    setTimeout(() => setSuccessToast(null), 3000);
    otpInputRefs.current[5]?.focus();
  };

  const handleResendCode = () => {
    if (resendCountdown > 0) return;
    const newCode = generateNewDemoCode();
    setSuccessToast(`Dispatched new 6-digit verification code: ${newCode}`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // STEP 1 -> STEP 2 (Sign In Transition)
  const handleProceedToSignInVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetEmail = email.trim() || "maya.lin@velora.health";
    if (!targetEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password && email) {
      setErrorMessage("Please enter your password.");
      return;
    }

    const code = generateNewDemoCode();
    setOtpDigits(["", "", "", "", "", ""]);
    setAuthStep(2);
    setSuccessToast(`Security code dispatched to ${getMaskedEmail(targetEmail)}: [${code}]`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // STEP 2 -> COMPLETE SIGN IN
  const handleFinalSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (verificationMethod === "email_otp") {
      const enteredCode = otpDigits.join("");
      if (enteredCode.length < 6) {
        setErrorMessage("Please enter the full 6-digit security code.");
        return;
      }
    }

    setIsLoading(true);
    try {
      const targetEmail = email.trim() || "maya.lin@velora.health";
      const targetPassword = password.trim() || "velora";
      const res = await login(targetEmail, targetPassword, rememberDevice);
      if (!res.success) {
        setErrorMessage(res.error || "Verification failed. Please check your credentials.");
      }
    } catch {
      setErrorMessage("Authentication handshake error. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 1 -> STEP 2 (Sign Up Transition)
  const handleProceedToSignUpVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (!agreeTerms) {
      setErrorMessage("Please accept the privacy terms to proceed.");
      return;
    }

    const code = generateNewDemoCode();
    setOtpDigits(["", "", "", "", "", ""]);
    setAuthStep(2);
    setSuccessToast(`Account activation code sent to ${getMaskedEmail(email)}: [${code}]`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // STEP 2 -> COMPLETE SIGN UP
  const handleFinalSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (verificationMethod === "email_otp") {
      const enteredCode = otpDigits.join("");
      if (enteredCode.length < 6) {
        setErrorMessage("Please enter the complete 6-digit activation code.");
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await signup({
        name,
        email,
        password,
        lifeStage: selectedLifeStage,
        discreetMode: false,
        biometricLock: enableBiometricEnrollment,
      });
      if (!res.success) {
        setErrorMessage(res.error || "Failed to initialize encrypted vault.");
      }
    } catch {
      setErrorMessage("Account creation error.");
    } finally {
      setIsLoading(false);
    }
  };

  // Simulated Biometric Scan (TouchID / FaceID)
  const handleSimulateBiometricScan = () => {
    setBiometricScanning(true);
    setErrorMessage(null);
    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        if (authMode === "signin") {
          handleFinalSignIn();
        } else {
          handleFinalSignUp();
        }
      }, 700);
    }, 1300);
  };

  // Social Auth Handlers
  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await signup({
        name: "Maya Lin",
        email: "maya.lin@velora.health",
        lifeStage: "cycle_hormonal",
        discreetMode: false,
        biometricLock: true,
      });
    } catch {
      setErrorMessage("Google Sign-In failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Flow
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await requestPasswordReset(forgotEmail);
      if (res.success) {
        setForgotMessage(res.message);
        setForgotStep(2);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage("Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div
      id="auth-scroll-viewport"
      className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#FAF0F2] flex items-center justify-center p-3 sm:p-6 md:p-10 font-sans selection:bg-[#FFD3DC] selection:text-[#251A20]"
    >
      {/* MAIN CONTAINER (Rounded luxury card styling) */}
      <div className="w-full max-w-[1180px] bg-white rounded-[28px] md:rounded-[36px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[720px] border border-[#F5E2E6] relative">
        
        {/* ================= LEFT HERO & BRAND COLUMN (5 cols on lg) ================= */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#FFF5F7] via-[#FCF2F4] to-[#FBF0F3] border-b lg:border-b-0 lg:border-r border-[#F3E2E6] flex flex-col justify-between p-6 sm:p-10 lg:p-11 text-[#221820] relative">
          {/* Top Brand Block */}
          <div className="space-y-6">
            {/* Center-aligned Lotus and Title */}
            <div className="flex flex-col items-center text-center space-y-2.5 pt-1">
              <VeloraLotusLogo size={68} className="w-16 h-16 drop-shadow-xs" />
              
              <h1 className="text-4xl sm:text-5xl font-serif font-normal text-[#1E1418] tracking-tight">
                Velora
              </h1>
              
              <p className="text-sm font-medium text-[#6B4D56] tracking-wide">
                Your health. Your body. Your life.
              </p>

              {/* Delicate Divider Line */}
              <div className="w-12 h-[1.5px] bg-[#FFB7C3] rounded-full my-1.5" />

              <p className="text-xs text-[#7A5E67] max-w-[310px] leading-relaxed">
                Velora is your zero-knowledge health companion engineered for every stage of your life.
              </p>
            </div>

            {/* 4 Feature Value Props */}
            <div className="space-y-3.5 pt-3 sm:pt-5">
              {/* 1. Privacy */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#FFF0F3]/95 border border-[#FFD3DC] flex items-center justify-center text-[#FF788D] shrink-0 shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#251A20]">
                    Zero-Knowledge Encryption
                  </h2>
                  <p className="text-[11px] text-[#6E5860] leading-snug mt-0.5">
                    Your health records are client-encrypted with 2-factor hardware keys.
                  </p>
                </div>
              </div>

              {/* 2. Personalization */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#FFF0F3]/95 border border-[#FFD3DC] flex items-center justify-center text-[#FF788D] shrink-0 shadow-2xs">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#251A20]">
                    Adaptive Life Map™
                  </h2>
                  <p className="text-[11px] text-[#6E5860] leading-snug mt-0.5">
                    Dynamically adapts from menstrual cycle to fertility, pregnancy, and menopause.
                  </p>
                </div>
              </div>

              {/* 3. AI Care */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#FFF0F3]/95 border border-[#FFD3DC] flex items-center justify-center text-[#FF788D] shrink-0 shadow-2xs">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#251A20]">
                    Clinical AI Copilot
                  </h2>
                  <p className="text-[11px] text-[#6E5860] leading-snug mt-0.5">
                    Private hormonal insights and doctor-ready clinical summaries.
                  </p>
                </div>
              </div>

              {/* 4. Whole-you Wellbeing */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#FFF0F3]/95 border border-[#FFD3DC] flex items-center justify-center text-[#FF788D] shrink-0 shadow-2xs">
                  <Flower2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#251A20]">
                    Holistic Mind & Body Sync
                  </h2>
                  <p className="text-[11px] text-[#6E5860] leading-snug mt-0.5">
                    Seamless synchronization with Google Health Connect & Fit ecosystems.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance Card */}
          <div className="mt-8 pt-2">
            <div className="bg-white rounded-2xl p-3.5 border border-[#F0DDE2] shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFF0F3] border border-[#FFD3DC] text-[#FF788D] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-[11px] leading-tight">
                <p className="font-semibold text-[#251A20]">Biometric & 2FA Protected</p>
                <p className="text-[#7A5E67] mt-0.5">Only you hold the private decryption keys.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT AUTHENTICATION CARD (7 cols on lg) ================= */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-center relative">
          <div className="max-w-md w-full mx-auto space-y-5">
            
            {/* Header: Title, Stepper Indicator & Subhead */}
            <div className="text-center space-y-2">
              {authMode !== "forgot" && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF5F7] border border-[#FFDADA] text-xs font-semibold text-[#D9455D] mb-1">
                  <span className={`w-2 h-2 rounded-full ${authStep === 1 ? "bg-[#FF788D]" : "bg-emerald-500 animate-pulse"}`} />
                  <span>
                    {authStep === 1 ? "Step 1 of 2: Account Calibration" : "Step 2 of 2: 2-Factor Security Verification"}
                  </span>
                </div>
              )}

              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#1E1418] tracking-tight">
                {authMode === "forgot"
                  ? "Reset Password"
                  : authStep === 2
                  ? authMode === "signin"
                    ? "Two-Factor Verification"
                    : "Activate Your Vault"
                  : authMode === "signin"
                  ? "Welcome Back to Velora"
                  : "Begin Your Health Journey"}
              </h2>

              <p className="text-xs sm:text-sm text-[#7D636B] max-w-sm mx-auto">
                {authMode === "forgot"
                  ? "Enter your email to receive secure recovery credentials"
                  : authStep === 2
                  ? authMode === "signin"
                    ? `Enter the 6-digit security code sent to ${getMaskedEmail(email)}`
                    : `Verify your identity to generate zero-knowledge client keys for ${getMaskedEmail(email)}`
                  : authMode === "signin"
                  ? "Sign in to access your private encrypted health record"
                  : "Create an account to calibrate your personalized health OS"}
              </p>
            </div>

            {/* Success Toast / Notification */}
            {successToast && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium leading-tight">{successToast}</span>
                </div>
                {authStep === 2 && verificationMethod === "email_otp" && (
                  <button
                    type="button"
                    onClick={handleAutoFillDemoCode}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shrink-0 cursor-pointer shadow-2xs"
                  >
                    Auto-fill
                  </button>
                )}
              </div>
            )}

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Mode Switcher Tabs (Sign In / Sign Up) - only on Step 1 */}
            {authMode !== "forgot" && authStep === 1 && (
              <div className="flex border-b border-[#F0DFE3] relative">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthStep(1);
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-3 text-sm font-semibold text-center transition-all cursor-pointer relative ${
                    authMode === "signin"
                      ? "text-[#FF788D]"
                      : "text-[#8E737B] hover:text-[#251A20]"
                  }`}
                >
                  Sign In
                  {authMode === "signin" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF788D] rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthStep(1);
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-3 text-sm font-semibold text-center transition-all cursor-pointer relative ${
                    authMode === "signup"
                      ? "text-[#FF788D]"
                      : "text-[#8E737B] hover:text-[#251A20]"
                  }`}
                >
                  Create Account
                  {authMode === "signup" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF788D] rounded-full" />
                  )}
                </button>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 1. SIGN IN - STEP 1 (Credentials)                             */}
            {/* ------------------------------------------------------------- */}
            {authMode === "signin" && authStep === 1 && (
              <form onSubmit={handleProceedToSignInVerification} className="space-y-4 pt-1">
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#251A20] block">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A08890]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. maya.lin@velora.health"
                      className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-[#FCF8F9] border border-[#EBD6DA] rounded-xl text-[#251A20] placeholder-[#B59DA5] focus:outline-none focus:ring-2 focus:ring-[#FF788D]/30 focus:border-[#FF788D] transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#251A20] block">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A08890]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-11 py-3 text-xs sm:text-sm bg-[#FCF8F9] border border-[#EBD6DA] rounded-xl text-[#251A20] placeholder-[#B59DA5] focus:outline-none focus:ring-2 focus:ring-[#FF788D]/30 focus:border-[#FF788D] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A08890] hover:text-[#251A20] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#735E65]">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#FF788D] rounded"
                    />
                    <span>Remember this device</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("forgot");
                      setForgotStep(1);
                      setErrorMessage(null);
                    }}
                    className="text-xs font-semibold text-[#FF788D] hover:text-[#D9455D] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Proceed to Step 2 Verification Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-[#FF788D] hover:bg-[#EE657B] active:scale-[0.99] text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#FF788D]/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>Continue to Step 2: Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 'or continue with' Separator */}
                <div className="relative flex items-center justify-center py-2">
                  <div className="border-t border-[#F0DFE3] w-full" />
                  <span className="bg-white px-3 text-xs text-[#A08890] font-medium absolute">
                    or instant access
                  </span>
                </div>

                {/* Social Login Options (Google) */}
                <div className="w-full">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-[#FCF8F9] active:scale-[0.99] border border-[#E8D4D8] rounded-xl text-xs font-medium text-[#251A20] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs hover:border-[#D9BDC3]"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>

                {/* Bottom Switcher */}
                <div className="text-center pt-2 text-xs text-[#7D636B]">
                  <span>New to Velora? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setAuthStep(1);
                      setErrorMessage(null);
                    }}
                    className="font-semibold text-[#FF788D] hover:underline cursor-pointer"
                  >
                    Create free account
                  </button>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 2. SIGN UP - STEP 1 (Profile & Calibration)                   */}
            {/* ------------------------------------------------------------- */}
            {authMode === "signup" && authStep === 1 && (
              <form onSubmit={handleProceedToSignUpVerification} className="space-y-3.5 pt-1">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#251A20] block">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A08890]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FCF8F9] border border-[#EBD6DA] rounded-xl text-[#251A20] placeholder-[#B59DA5] focus:outline-none focus:ring-2 focus:ring-[#FF788D]/30 focus:border-[#FF788D]"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#251A20] block">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A08890]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. maya.lin@velora.health"
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FCF8F9] border border-[#EBD6DA] rounded-xl text-[#251A20] placeholder-[#B59DA5] focus:outline-none focus:ring-2 focus:ring-[#FF788D]/30 focus:border-[#FF788D]"
                    />
                  </div>
                </div>

                {/* Password Input with Strength Indicator */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#251A20] block">
                      Password
                    </label>
                    {password && (
                      <span className="text-[10px] font-semibold text-[#735E65]">
                        Strength: <strong className="text-[#D9455D]">{strength.label}</strong>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A08890]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password (min 6 characters)"
                      className="w-full pl-10 pr-11 py-2.5 text-xs sm:text-sm bg-[#FCF8F9] border border-[#EBD6DA] rounded-xl text-[#251A20] placeholder-[#B59DA5] focus:outline-none focus:ring-2 focus:ring-[#FF788D]/30 focus:border-[#FF788D]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A08890] hover:text-[#251A20] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-1 rounded-full transition-all ${
                            step <= strength.score ? strength.color : "bg-gray-100"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Life Stage Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#251A20] block">
                    Starting Life Stage Calibration
                  </label>
                  <select
                    value={selectedLifeStage}
                    onChange={(e) => setSelectedLifeStage(e.target.value as LifeStage)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FCF8F9] border border-[#EBD6DA] rounded-xl text-[#251A20] focus:outline-none focus:ring-2 focus:ring-[#FF788D]/30 focus:border-[#FF788D] cursor-pointer"
                  >
                    {Object.keys(LIFE_STAGES).map((key) => (
                      <option key={key} value={key}>
                        {LIFE_STAGES[key as LifeStage].name} — {LIFE_STAGES[key as LifeStage].tagline}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-[#FF788D] rounded cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-[11px] text-[#6E5860] cursor-pointer leading-tight">
                    I agree to Velora's Zero-Knowledge cryptographic privacy terms and acknowledge that only my device holds decryption keys.
                  </label>
                </div>

                {/* Proceed to Step 2 Verification Button */}
                <button
                  type="submit"
                  disabled={isLoading || !agreeTerms}
                  className="w-full py-3.5 px-4 bg-[#FF788D] hover:bg-[#EE657B] active:scale-[0.99] text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#FF788D]/25 cursor-pointer disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
                >
                  <span>Continue to Step 2: Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Bottom Switcher */}
                <div className="text-center pt-2 text-xs text-[#7D636B]">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setAuthStep(1);
                      setErrorMessage(null);
                    }}
                    className="font-semibold text-[#FF788D] hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: VERIFICATION SECTION (FOR BOTH SIGN IN & SIGN UP)    */}
            {/* ------------------------------------------------------------- */}
            {authMode !== "forgot" && authStep === 2 && (
              <div className="space-y-4 pt-1 animate-in fade-in">
                {/* Back to Step 1 Bar */}
                <div className="flex items-center justify-between pb-1 border-b border-[#F0DFE3]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep(1);
                      setErrorMessage(null);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#8E737B] hover:text-[#251A20] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Credentials</span>
                  </button>

                  <span className="text-[11px] font-medium text-[#735E65]">
                    Destination: <strong className="text-[#2D2226]">{getMaskedEmail(email)}</strong>
                  </span>
                </div>

                {/* Verification Mode Selector Tabs */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FFF5F7] rounded-xl border border-[#FFDADA]">
                  <button
                    type="button"
                    onClick={() => setVerificationMethod("email_otp")}
                    className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      verificationMethod === "email_otp"
                        ? "bg-white text-[#D9455D] shadow-xs border border-[#FFDADA]"
                        : "text-[#735E65] hover:text-[#2D2226]"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>6-Digit Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationMethod("biometric")}
                    className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      verificationMethod === "biometric"
                        ? "bg-white text-[#D9455D] shadow-xs border border-[#FFDADA]"
                        : "text-[#735E65] hover:text-[#2D2226]"
                    }`}
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Face / Touch ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationMethod("authenticator")}
                    className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      verificationMethod === "authenticator"
                        ? "bg-white text-[#D9455D] shadow-xs border border-[#FFDADA]"
                        : "text-[#735E65] hover:text-[#2D2226]"
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Authenticator</span>
                  </button>
                </div>

                {/* Sub-View A: 6-Digit OTP Code */}
                {verificationMethod === "email_otp" && (
                  <div className="space-y-4">
                    {/* Demo Code Helper Chip */}
                    <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#FFDADA] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-[#735E65]">
                        <Zap className="w-3.5 h-3.5 text-[#FF788D]" />
                        <span>
                          Simulated Code: <strong className="text-[#2D2226] tracking-widest">{demoOtpCode}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoFillDemoCode}
                        className="text-[11px] font-bold text-[#D9455D] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Auto-fill Code</span>
                      </button>
                    </div>

                    {/* 6 Digit Input Boxes */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#251A20] block text-center">
                        Enter 6-Digit Verification Code
                      </label>

                      <div className="flex justify-between gap-2 sm:gap-2.5">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => (otpInputRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            onPaste={handleOtpPaste}
                            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border transition-all ${
                              digit
                                ? "bg-white border-[#FF788D] text-[#251A20] ring-2 ring-[#FF788D]/20 shadow-xs"
                                : "bg-[#FCF8F9] border-[#EBD6DA] text-[#251A20] focus:bg-white focus:border-[#FF788D] focus:ring-2 focus:ring-[#FF788D]/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Resend Code & Timer */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-[#735E65]">
                        <Clock className="w-3.5 h-3.5 text-[#FF788D]" />
                        {resendCountdown > 0 ? (
                          <span>Resend code in {resendCountdown}s</span>
                        ) : (
                          <span className="text-emerald-700 font-medium">Ready to resend</span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={resendCountdown > 0}
                        onClick={handleResendCode}
                        className={`font-semibold text-xs cursor-pointer flex items-center gap-1 ${
                          resendCountdown > 0
                            ? "text-[#A08890] cursor-not-allowed opacity-60"
                            : "text-[#FF788D] hover:underline"
                        }`}
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend Code</span>
                      </button>
                    </div>

                    {/* Biometric enrollment checkbox for signup */}
                    {authMode === "signup" && (
                      <div className="p-3 bg-[#FCF8F9] rounded-xl border border-[#EBD6DA] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Fingerprint className="w-4 h-4 text-[#FF788D]" />
                          <div>
                            <p className="text-xs font-semibold text-[#251A20]">Enable Biometric Shield</p>
                            <p className="text-[10px] text-[#735E65]">Require Face ID/Touch ID on future logins</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={enableBiometricEnrollment}
                          onChange={(e) => setEnableBiometricEnrollment(e.target.checked)}
                          className="w-4 h-4 accent-[#FF788D] rounded cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Primary Verify Button */}
                    <button
                      type="button"
                      disabled={isLoading || otpDigits.join("").length < 6}
                      onClick={() => (authMode === "signin" ? handleFinalSignIn() : handleFinalSignUp())}
                      className="w-full py-3.5 px-4 bg-[#FF788D] hover:bg-[#EE657B] active:scale-[0.99] text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#FF788D]/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Establishing Encrypted Session...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{authMode === "signin" ? "Verify & Sign In" : "Verify & Launch Velora OS"}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Sub-View B: Biometric TouchID / FaceID Challenge */}
                {verificationMethod === "biometric" && (
                  <div className="p-6 bg-[#FCF8F9] rounded-2xl border border-[#EBD6DA] text-center space-y-4">
                    <div className="relative inline-flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleSimulateBiometricScan}
                        disabled={biometricScanning || biometricSuccess}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          biometricSuccess
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                            : biometricScanning
                            ? "bg-[#FF788D] text-white animate-pulse ring-4 ring-[#FF788D]/30"
                            : "bg-white text-[#FF788D] border-2 border-[#FFDADA] hover:border-[#FF788D] shadow-md hover:scale-105"
                        }`}
                      >
                        {biometricSuccess ? (
                          <Check className="w-10 h-10 stroke-[3]" />
                        ) : (
                          <Fingerprint className={`w-10 h-10 ${biometricScanning ? "animate-spin" : ""}`} />
                        )}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-[#251A20]">
                        {biometricSuccess
                          ? "Biometric Identity Confirmed"
                          : biometricScanning
                          ? "Reading Hardware Key..."
                          : "Touch Sensor or Look at Camera"}
                      </h3>
                      <p className="text-xs text-[#735E65]">
                        {biometricSuccess
                          ? "Vault key unlocked. Redirecting to your dashboard..."
                          : "Click the sensor above to simulate WebAuthn / Face ID cryptographic verification"}
                      </p>
                    </div>

                    {!biometricScanning && !biometricSuccess && (
                      <button
                        type="button"
                        onClick={handleSimulateBiometricScan}
                        className="py-2.5 px-4 bg-white border border-[#E8D4D8] hover:bg-[#FFF5F7] text-[#251A20] text-xs font-semibold rounded-xl cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-[#FF788D]" />
                        <span>Simulate Instant Touch ID</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Sub-View C: Authenticator App (TOTP) */}
                {verificationMethod === "authenticator" && (
                  <div className="p-4 bg-[#FCF8F9] rounded-2xl border border-[#EBD6DA] space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#FFDADA] flex items-center justify-center text-[#FF788D] shrink-0">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#251A20]">
                          Google Authenticator / 1Password
                        </h4>
                        <p className="text-[11px] text-[#735E65]">
                          Enter the rotating 6-digit TOTP key generated by your authenticator.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between gap-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-10 h-12 text-center text-lg font-bold font-mono rounded-xl border border-[#EBD6DA] bg-white text-[#251A20] focus:ring-2 focus:ring-[#FF788D]/20 focus:border-[#FF788D]"
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={isLoading || otpDigits.join("").length < 6}
                      onClick={() => (authMode === "signin" ? handleFinalSignIn() : handleFinalSignUp())}
                      className="w-full py-3 bg-[#FF788D] hover:bg-[#EE657B] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      Authenticate TOTP Key
                    </button>
                  </div>
                )}

                {/* Privacy Badge Guarantee */}
                <div className="p-2.5 bg-[#FFF5F7] rounded-xl border border-[#FFDADA] flex items-center justify-center gap-1.5 text-[11px] text-[#735E65]">
                  <Lock className="w-3.5 h-3.5 text-[#FF788D]" />
                  <span>Hardware-level Zero-Knowledge Token Active</span>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 3. FORGOT PASSWORD FORM                                       */}
            {/* ------------------------------------------------------------- */}
            {authMode === "forgot" && (
              <div className="space-y-4 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthStep(1);
                    setForgotStep(1);
                    setForgotMessage(null);
                    setErrorMessage(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#FF788D] hover:underline cursor-pointer mb-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to sign in</span>
                </button>

                {forgotStep === 2 ? (
                  <div className="p-4 rounded-2xl bg-[#FFF5F7] border border-[#FFD3DC] space-y-3">
                    <div className="flex items-center gap-2 text-[#D9455D] font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-[#FF788D]" />
                      <span>Password Recovery Dispatched</span>
                    </div>
                    <p className="text-xs text-[#251A20] leading-relaxed">
                      {forgotMessage}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signin");
                        setAuthStep(1);
                        setForgotStep(1);
                        setForgotMessage(null);
                      }}
                      className="w-full py-2.5 bg-[#FF788D] text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-[#EE657B]"
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#251A20] block">
                        Registered Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A08890]">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="e.g. maya.lin@velora.health"
                          className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-[#FCF8F9] border border-[#EBD6DA] rounded-xl text-[#251A20] placeholder-[#B59DA5] focus:outline-none focus:ring-2 focus:ring-[#FF788D]/30 focus:border-[#FF788D]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 bg-[#FF788D] hover:bg-[#EE657B] active:scale-[0.99] text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#FF788D]/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? "Sending recovery link..." : "Send Verification Reset Link"}
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Edge Vertical Scroll Rail (Up Triangle, Track Thumb, Down Triangle) */}
      <VerticalScrollRail />
    </div>
  );
};
