import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import api from "../api/axios";

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  // 🔥 Store user including profile image
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync token → localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  // Sync user → localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // If token exists but user missing → fetch profile
  useEffect(() => {
    const loadUser = async () => {
      if (!token || user) return;

      setLoading(true);

      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
