import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/axios";
import AuthContext from "../context/AuthContext";
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* GOOGLE LOGIN FUNCTION */
  const googleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loginPromise = api.post("/auth/login", form);

    toast.promise(loginPromise, {
      loading: "Authenticating...",
      success: "Welcome back!",
      error: (err) => err.response?.data?.message || "Invalid credentials ❌",
    });

    try {
      const res = await loginPromise;
      const userData = res.data;

      setToken(userData.token);
      setUser(userData);

      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData));

      setTimeout(() => {
        if (userData.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F1A] px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md z-10">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-[3rem] shadow-2xl border border-white dark:border-slate-800">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              Enter your details to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800/50 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 border-2 rounded-2xl outline-none transition-all dark:text-white"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-100 dark:bg-slate-800/50 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 border-2 rounded-2xl outline-none transition-all dark:text-white"
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all transform active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-blue-500/20 mt-8"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* --- MODERN GOOGLE UI --- */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-4 text-slate-400 font-black tracking-widest">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={googleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 py-4 rounded-2xl font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform active:scale-[0.98] shadow-sm"
          >
            <img 
              src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" 
              alt="Google" 
              className="w-5 h-5 object-contain"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Logo.png"
              }}
            />
            Continue with Google
          </button>
          {/* ----------------------- */}

          <div className="mt-10 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 dark:text-blue-400 font-black hover:underline ml-1"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
          Securely encrypted & SSL Protected
        </p>
      </div>
    </div>
  );
}

export default Login;