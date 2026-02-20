import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "sonner"; // ✅ ADD THIS

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);

  const handleChange = (e) => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);

    if (e.target.name === "password") {
      updateStrength(e.target.value);
    }
  };

  // Password strength logic
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
    setMessage("");

    try {
      await api.post("/auth/register", form);

      // ✅ TOAST SUCCESS
      toast.success("Account created successfully 🎉", {
        duration: 2500,
      });

      setMessage("Account created! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      // ✅ TOAST ERROR
      toast.error("Registration failed ❌", {
        duration: 2500,
      });

      setMessage("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E7E7E7] dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl
                  border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-[#103B66] dark:text-white">
          Create Account
        </h2>

        {message && (
          <p className="p-3 text-center mb-4 rounded bg-blue-100 text-blue-700 
                        dark:bg-blue-900 dark:text-blue-300">
            {message}
          </p>
        )}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full p-3 border rounded-lg mb-4 bg-gray-100 dark:bg-gray-700 
                     dark:text-white outline-none"
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          className="w-full p-3 border rounded-lg mb-4 bg-gray-100 dark:bg-gray-700 
                     dark:text-white outline-none"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-3 border rounded-lg mb-2 bg-gray-100 dark:bg-gray-700 
                     dark:text-white outline-none"
          onChange={handleChange}
          required
        />

        {/* 🔥 Password Strength Bar */}
        <div className="h-2 w-full bg-gray-300 dark:bg-gray-600 rounded mb-4">
          <div
            className={`h-2 rounded transition-all ${
              strength <= 1
                ? "bg-red-500 w-1/3"
                : strength <= 3
                ? "bg-yellow-500 w-2/3"
                : "bg-green-500 w-full"
            }`}
          ></div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-[#103B66] text-white py-3 rounded-lg font-semibold 
                     hover:bg-[#0d2f52] transition"
        >
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="text-center mt-4 dark:text-gray-300">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#103B66] dark:text-blue-400 font-semibold"
          >
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
