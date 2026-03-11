import { useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import { Mail, Send, ArrowLeft, Loader2, Sparkles, ShieldQuestion } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      setLoading(true);
      await axios.post("/auth/forgot-password", { email });
      
      setStatus({ 
        type: "success", 
        message: "Check your inbox! A reset link has been sent." 
      });
    } catch (err) {
      setStatus({ 
        type: "error", 
        message: err.response?.data?.message || "Something went wrong. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFF] dark:bg-[#0B0F1A] px-6 relative overflow-hidden">
      
      {/* 🔮 Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_20%,rgba(244,63,94,0.05),transparent)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Back Link */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-rose-600 transition-colors text-[10px] font-black uppercase tracking-widest mb-6 ml-1"
        >
          <ArrowLeft size={14} /> Back to Login
        </Link>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-slate-200 dark:border-slate-800">
          
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-3xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 mb-6">
              <ShieldQuestion size={36} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Forgot <span className="text-rose-600">Password?</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Enter your email and we'll send you a secure link to reset your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Registered Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="e.g. yourname@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white outline-none ring-2 ring-transparent focus:ring-rose-500/20 transition-all placeholder:font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Status Messages */}
            {status.message && (
              <div className={`p-4 rounded-2xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-1 ${
                status.type === "success" 
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20" 
                : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20"
              }`}>
                {status.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={loading}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 hover:bg-rose-600 hover:text-white shadow-xl shadow-slate-200 dark:shadow-none group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Send Recovery Link <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Decoration */}
          <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 flex items-center justify-center gap-2">
              <Sparkles size={12} /> Secure Account Recovery
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;