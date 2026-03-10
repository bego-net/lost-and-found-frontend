import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "sonner";
import { User, Mail, Lock, UserPlus, Loader2, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);

  const handleChange = (e) => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);

    if (e.target.name === "password") {
      updateStrength(e.target.value);
    }
  };

  const updateStrength = (password) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&#]/.test(password)) score++;
    setStrength(score);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      toast.success("Account created successfully! 🎉");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const strengthColor = strength <= 2 ? "bg-red-500" : strength <= 4 ? "bg-amber-500" : "bg-emerald-500";
  const strengthText = strength <= 2 ? "Weak" : strength <= 4 ? "Good" : "Strong";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F1A] px-4 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-5%] right-[-5%] w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md z-10">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-[3rem] shadow-2xl border border-white dark:border-slate-800">
          
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-blue-50 dark:bg-blue-500/10 rounded-3xl mb-4 text-blue-600">
              <UserPlus size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              Join Us
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              Create your account to start reporting items
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800/50 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 border-2 rounded-2xl outline-none transition-all dark:text-white"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800/50 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 border-2 rounded-2xl outline-none transition-all dark:text-white"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800/50 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 border-2 rounded-2xl outline-none transition-all dark:text-white"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Enhanced Password Strength Meter */}
              {form.password && (
                <div className="px-1 pt-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security: {strengthText}</span>
                    {strength >= 5 && <CheckCircle2 size={12} className="text-emerald-500" />}
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${strengthColor}`} 
                      style={{ width: `${(strength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all transform active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-blue-500/20 mt-8"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Already a member?{" "}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 font-black hover:underline ml-1">
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Minimal Footer Badge */}
        <div className="flex items-center justify-center gap-2 mt-8 opacity-40">
           <ShieldCheck size={14} className="dark:text-white" />
           <span className="text-[10px] uppercase font-black tracking-[0.2em] dark:text-white">Secure Registration</span>
        </div>
      </div>
    </div>
  );
}

export default Register;