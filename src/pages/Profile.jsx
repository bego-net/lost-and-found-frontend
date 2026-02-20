import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../api/axios";
import ItemCard from "../components/ItemCard";
import { ChevronDown, Edit, LogOut, Sun, Moon } from "lucide-react";

// ✅ SKELETON IMPORT
import ProfileSkeleton from "../components/skeletons/ProfileSkeleton";

export default function Profile() {
  const { token, user, setUser, logout } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const navigate = useNavigate();

  // Toggle Dark Mode
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  // Fetch user & items
  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        setItems(res.data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  if (!token) {
    return (
      <div className="text-center mt-16">
        <p className="text-xl">You must be logged in to view your profile.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Login
        </button>
      </div>
    );
  }

  /* ✅ SKELETON LOADING (REPLACES TEXT ONLY) */
  if (loading) {
    return (
      <div className="min-h-screen px-6 py-10">
        <ProfileSkeleton />
      </div>
    );
  }

  const profileImg = user?.profileImage
    ? `http://localhost:5000${user.profileImage}`
    : "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 dark:bg-gray-900 dark:text-white">

      {/* ACTION BAR */}
      <div className="flex justify-end mb-6 relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 shadow rounded-xl hover:shadow-lg transition border border-gray-200 dark:border-gray-700"
        >
          <img
            src={profileImg}
            className="w-10 h-10 rounded-full object-cover"
          />
          <ChevronDown className="w-5 h-5" />
        </button>

        {dropdownOpen && (
          <div className="absolute mt-14 right-0 w-56 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 p-2 z-50 animate-fadeIn">
            <Link
              to="/edit-profile"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Edit className="w-4 h-4" /> Edit Profile
            </Link>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-3 p-3 w-full text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start border border-gray-100 dark:border-gray-700">
        <img
          src={profileImg}
          className="w-36 h-36 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 shadow"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{user?.name}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{user?.email}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center mt-6">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl shadow">
              <p className="text-xl font-bold">{items.filter(i => i.type === "lost").length}</p>
              <p className="text-gray-500 text-sm">Lost</p>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl shadow">
              <p className="text-xl font-bold">{items.filter(i => i.type === "found").length}</p>
              <p className="text-gray-500 text-sm">Found</p>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl shadow">
              <p className="text-xl font-bold">{items.length}</p>
              <p className="text-gray-500 text-sm">Total Posts</p>
            </div>
          </div>
        </div>
      </div>

      {/* ITEMS SECTION */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">Your Posted Items</h2>

      {items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">
          You have not posted any items yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {items.map((it) => (
            <ItemCard key={it._id} item={it} />
          ))}
        </div>
      )}
    </div>
  );
}
