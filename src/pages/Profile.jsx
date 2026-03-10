import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../api/axios";
import ItemCard from "../components/ItemCard";
import { 
  Settings, 
  MapPin, 
  Mail, 
  Calendar, 
  PlusCircle, 
  Package, 
  Search,
  CheckCircle2
} from "lucide-react";

// ✅ SKELETON IMPORT
import ProfileSkeleton from "../components/skeletons/ProfileSkeleton";

export default function Profile() {
  const { token, user, setUser } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        console.error("Failed to fetch profile data:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, setUser]);

  if (!token) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
          <Settings className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold dark:text-white">Authentication Required</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
          Please log in to your account to manage your listings and profile settings.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
        >
          Sign In
        </button>
      </div>
    );
  }

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 dark:bg-[#0B0F1A]">
      
      {/* 1. MODERN HEADER / HERO SECTION */}
      <div className="relative mb-12">
        {/* Background Decorative Element */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-500/5 dark:to-purple-500/5 h-48 rounded-[3rem] -z-10" />
        
        <div className="pt-8 px-4 sm:px-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative group">
            <img
              src={profileImg}
              alt="Profile"
              className="w-40 h-40 rounded-3xl object-cover border-8 border-white dark:border-slate-900 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-white dark:border-slate-900 w-8 h-8 rounded-full" title="Active Account" />
          </div>

          <div className="flex-1 text-center md:text-left pb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {user?.name}
              </h1>
              <Link
                to="/edit-profile"
                className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                <Settings size={14} /> Edit Profile
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 dark:text-slate-400 font-medium text-sm">
              <span className="flex items-center gap-1.5">
                <Mail size={16} className="text-blue-500" /> {user?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={16} className="text-purple-500" /> Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. QUICK STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Lost Items", value: items.filter(i => i.type === "lost").length, icon: <Search className="text-orange-500" />, color: "bg-orange-50 dark:bg-orange-500/5" },
          { label: "Found Items", value: items.filter(i => i.type === "found").length, icon: <CheckCircle2 className="text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-500/5" },
          { label: "Total Posts", value: items.length, icon: <Package className="text-blue-500" />, color: "bg-blue-50 dark:bg-blue-500/5" },
          { label: "Resolved", value: "0", icon: <MapPin className="text-purple-500" />, color: "bg-purple-50 dark:bg-purple-500/5" },
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.color} p-6 rounded-[2rem] border border-white dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1`}>
            <div className="mb-3">{stat.icon}</div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 3. CONTENT SECTION */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Activity</h2>
          <p className="text-slate-500 text-sm font-medium">Manage and track your reported items</p>
        </div>
        <Link 
          to="/create" 
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-2xl font-bold text-sm transition-opacity hover:opacity-90"
        >
          <PlusCircle size={18} /> New Report
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-20 text-center">
          <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="text-slate-300 w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No listings found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8 max-w-sm mx-auto">
            You haven't posted any items yet. When you report something lost or found, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((it) => (
            <div key={it._id} className="transition-transform duration-300 hover:scale-[1.02]">
               <ItemCard item={it} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}