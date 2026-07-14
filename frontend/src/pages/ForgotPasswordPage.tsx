import React from "react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-[520px] bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-sm text-slate-500 mt-2">
            Forgot Password functionality will be connected after the backend is deployed.
          </p>
        </div>
        <div className="text-center text-xs text-slate-500">
          This is a temporary frontend-only placeholder.
        </div>
      </div>
    </div>
  );
}

