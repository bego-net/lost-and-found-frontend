import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/axios";
import AuthContext from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const loginPromise = api.post("/auth/login", form);

  toast.promise(loginPromise, {
    loading: "Signing in...",
    success: "Login successful 🎉",
    error: "Invalid email or password ❌",
  });

  try {
    const res = await loginPromise;

    // 🔥 Backend now returns flat object
    setToken(res.data.token);
    setUser(res.data);

    // 🔥 Save full user (including token) to localStorage
    localStorage.setItem("user", JSON.stringify(res.data));

    setTimeout(() => navigate("/"), 1200);
  } catch {
    // error already handled by toast
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-[#E7E7E7] dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-gray-800 p-8
                   rounded-xl shadow-2xl backdrop-blur-md border border-gray-200 
                   dark:border-gray-700 transition"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-[#103B66] dark:text-white">
          Welcome Back
        </h2>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          className="w-full p-3 border rounded-lg mb-4 bg-gray-100 dark:bg-gray-700 
                     outline-none dark:text-white"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-3 border rounded-lg mb-4 bg-gray-100 dark:bg-gray-700 
                     outline-none dark:text-white"
          onChange={handleChange}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-[#103B66] text-white py-3 rounded-lg font-semibold 
                     hover:bg-[#0d2f52] transition disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="text-center mt-4 text-gray-700 dark:text-gray-300">
          New here?{" "}
          <Link
            to="/register"
            className="text-[#103B66] dark:text-blue-400 font-semibold"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
