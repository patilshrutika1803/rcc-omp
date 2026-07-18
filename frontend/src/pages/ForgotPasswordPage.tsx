import React, { useEffect, useMemo, useState } from "react";

type Step = "email" | "otp" | "reset";

const REMEMBER_EMAIL_KEY = "rccomp.login.rememberedEmail";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const u = user ?? "";
  const maskedUser =
    u.length <= 2 ? `${u[0] ?? ""}*` : `${u.slice(0, 2)}${"*".repeat(Math.min(10, u.length - 2))}`;
  return `${maskedUser}@${domain}`;
}

function isOtpExpired(expiresAt: number) {
  return Date.now() > expiresAt;
}

function validatePassword(pw: string) {
  // Minimal realistic frontend validation (no backend connected)
  return pw.length >= 8;
}

// Frontend-only mock OTP sender.
// NO API calls. Also prepares for future backend integration by isolating the function.
function sendOtp(email: string): { otp: string; expiresAt: number } {
  // deterministic-ish for same email in a session; still random enough for UX
  const seed = Array.from(email).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const otpNum = (seed * 9301 + 49297) % 1000000;
  const otp = String(otpNum).padStart(6, "0");
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  return { otp, expiresAt };
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string>("");
  const [enteredOtp, setEnteredOtp] = useState<string>("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<number>(0);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Requirement: disable final password reset because backend is not connected.
  const disableReset = true;

  const rememberedEmail = useMemo(() => {
    try {
      return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    if (rememberedEmail && !email) setEmail(rememberedEmail);
  }, [rememberedEmail, email]);

  const gotoStepOtp = () => {
    setError(null);
    setMessage(null);
    setStep("otp");
  };

  const gotoStepReset = () => {
    setError(null);
    setMessage(null);
    setStep("reset");
  };

  const onSendOtp = () => {
    setError(null);
    setMessage(null);

    const normalized = normalizeEmail(email);
    if (!normalized || !normalized.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    const { otp: generatedOtp, expiresAt } = sendOtp(normalized);

    // Clicking Send OTP should NOT call any API.
    setOtp(generatedOtp);
    setOtpExpiresAt(expiresAt);

    setEnteredOtp("");

    setMessage("Backend integration pending. Email service is not connected yet.");
    gotoStepOtp();
  };

  const onVerifyOtp = () => {
    setError(null);
    setMessage(null);

    if (!otp) {
      setError("Please request an OTP first.");
      return;
    }

    if (isOtpExpired(otpExpiresAt)) {
      setError("OTP expired. Please resend OTP.");
      return;
    }

    if (enteredOtp.trim() !== otp) {
      setError("Invalid OTP. Please try again.");
      return;
    }

    gotoStepReset();
  };

  const onResetPassword = () => {
    setError(null);
    setMessage(null);

    if (disableReset) {
      // Backend is not connected: prevent actual reset.
      setMessage("Backend integration pending. Password reset is disabled until backend is connected.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Future backend integration:
    // POST /api/auth/forgot-password/confirm { email, otp, newPassword }
    setMessage("Password reset would be confirmed here after backend integration.");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-[520px] bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-sm text-slate-500 mt-2">Reset your password using OTP verification.</p>
        </div>

        {message && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 font-medium">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        {step === "email" && (
          <div>
            <div className="mb-4">
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@rajaram.com"
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={onSendOtp}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center disabled:opacity-70"
            >
              Send OTP
            </button>

            <div className="mt-4 text-center text-xs text-slate-500">
              Clicking <b>Send OTP</b> will not call any API (frontend-only mock flow).
            </div>
          </div>
        )}

        {step === "otp" && (
          <div>
            <div className="text-center mb-4">
              <div className="text-sm font-medium text-slate-700">
                OTP sent to <span className="font-semibold">{maskEmail(normalizeEmail(email))}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                (Mock OTP for testing: <span className="font-mono">{otp || "------"}</span>)
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">OTP</label>
              <input
                type="text"
                inputMode="numeric"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
              />
              <div className="mt-2 text-xs text-slate-500">
                OTP expires when timer ends (5 minutes). You can navigate back and resend.
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  setStep("email");
                }}
                className="flex-1 h-11 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-lg shadow-sm transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onVerifyOtp}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all"
              >
                Verify OTP
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const normalized = normalizeEmail(email);
                const { otp: generatedOtp, expiresAt } = sendOtp(normalized);
                setOtp(generatedOtp);
                setOtpExpiresAt(expiresAt);
                setEnteredOtp("");
                setMessage("Backend integration pending. Email service is not connected yet.");
                setError(null);
              }}
              className="mt-4 w-full h-11 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-lg shadow-sm transition-all"
            >
              Resend OTP
            </button>
          </div>
        )}

        {step === "reset" && (
          <div>
            <div className="text-center mb-4">
              <div className="text-sm font-medium text-slate-700">
                Create a new password for <span className="font-semibold">{maskEmail(normalizeEmail(email))}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
              />
            </div>

            <div className="mb-5">
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  setStep("otp");
                }}
                className="flex-1 h-11 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-lg shadow-sm transition-all"
              >
                Back
              </button>

              <button
                type="button"
                onClick={onResetPassword}
                disabled={disableReset}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-70"
              >
                Reset Password
              </button>
            </div>

            <div className="mt-4 text-center text-xs text-slate-500">
              Password reset is disabled until backend integration is connected.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


