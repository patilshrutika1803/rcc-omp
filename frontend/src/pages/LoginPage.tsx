import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";


function AuthHeader() {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
          {/* keep icon consistent with original */}
          <svg width="1" height="1" style={{ display: "none" }} />
        </div>
        <div className="text-left">
          <div className="text-xl font-bold text-slate-900 tracking-tight leading-none">RCC OMP</div>
          <div className="text-[10px] text-slate-500 tracking-widest font-bold mt-0.5">PORTAL</div>
        </div>
      </div>
    </div>
  );
}

function AuthContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans">
      <AuthHeader />
      <div className="w-full max-w-[420px] bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 relative overflow-hidden">
        {children}
      </div>
      <footer className="mt-12 text-center text-xs text-slate-500 font-medium">
        © 2026 Rajaram Consumer Care Pvt. Ltd.<br />Internal Use Only
      </footer>
    </div>
  );
}

function InputField({ label, type = "text", placeholder, icon: Icon }: any) {
  return (
    <div className="mb-4">
      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full h-11 ${Icon ? "pl-10" : "pl-3"} pr-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400`}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as any;


  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <AuthContainer>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
        <p className="text-sm text-slate-500 mt-2">Sign in to your enterprise account.</p>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSubmitting(true);
          try {
            await login(email.trim(), password);

            const from = locationState?.from as string | undefined;
            navigate(from && from.startsWith("/") ? from : "/dashboard", { replace: true });


          } catch (err: any) {
            setError(err?.message ?? "Login failed");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div className="mb-4">
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@rajaram.com"
              className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 focus:ring-2" />
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
          </label>
          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </button>
        </div>


        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center disabled:opacity-70"
        >
          {submitting ? "Signing in..." : "Login to Portal"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <span className="text-sm text-slate-500">Don't have an account? </span>
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Create Account
        </button>
      </div>


    </AuthContainer>
  );
}

