import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../api/axios";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, KeyRound } from "lucide-react";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  // States
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    // Validation
    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/auth/reset-password/${token}`, { password });
      
      setStatus({ type: "success", message: "Password updated! Redirecting to login..." });
      
      // Redirect after success
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setStatus({ 
        type: "error", 
        message: err.response?.data?.message || "Link expired or invalid." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFF] dark:bg-[#0B0F1A] px-6 relative overflow-hidden">
      
      {/* 🔮 Background Aesthetic */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_20%,rgba(244,63,94,0.05),transparent)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-slate-200 dark:border-slate-800">
          
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-3xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 mb-6">
              <KeyRound size={36} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              New <span className="text-rose-600">Password</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Please enter and confirm your new secure password below.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            
            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white outline-none ring-2 ring-transparent focus:ring-rose-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white outline-none ring-2 ring-transparent focus:ring-rose-500/20 transition-all"
                />
              </div>
            </div>

            {/* Status Messages */}
            {status.message && (
              <div className={`flex items-center gap-3 p-4 rounded-2xl text-xs font-bold animate-in fade-in slide-in-from-top-1 ${
                status.type === "success" 
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20" 
                : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20"
              }`}>
                {status.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {status.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={loading}
              className="w-full py-4 mt-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 hover:bg-rose-600 hover:text-white shadow-xl shadow-slate-200 dark:shadow-none"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;