import { Link, useNavigate } from "react-router-dom";
import { Search, Layers, MapPin, ShieldCheck, SlidersHorizontal, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.append("query", keyword);
    if (category) params.append("category", category);
    if (location) params.append("location", location);
    
    if (type) params.append("type", type);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] transition-colors duration-500">
      
      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 dark:bg-blue-500/5 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 dark:bg-indigo-500/5 blur-[120px]" />
        </div>

        <div className="relative text-center max-w-6xl mx-auto px-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm font-medium mb-8">
            <Sparkles size={16} />
            <span>Smart Lost & Found Network</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
            Find What <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Matters Most.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
            The modern way to reconnect with your belongings. Fast, secure, and community-driven recovery.
          </p>

          {/* ======= SEARCH PANEL (GLASSMORPHISM) ======= */}
          <div className="max-w-5xl mx-auto backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 p-3 md:p-4 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white dark:border-slate-800 transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              
              {/* Keyword Input */}
              <div className="lg:col-span-4 flex items-center px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 focus-within:ring-2 ring-blue-500/50 transition-all">
                <Search size={20} className="text-slate-400 mr-3" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-transparent outline-none font-medium text-slate-900 dark:text-white"
                />
              </div>

              {/* Filters */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 outline-none font-medium text-slate-600 dark:text-slate-300 focus:ring-2 ring-blue-500/50 transition-all cursor-pointer"
                >
                  <option value="">Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="documents">Documents</option>
                  <option value="clothes">Clothes</option>
                  <option value="bags">Bags</option>
                  <option value="accessories">Accessories</option>
                </select>

                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="px-4 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 outline-none font-medium text-slate-900 dark:text-white focus:ring-2 ring-blue-500/50 transition-all"
                />

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="px-4 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 outline-none font-medium text-slate-600 dark:text-slate-300 focus:ring-2 ring-blue-500/50 transition-all cursor-pointer"
                >
                  <option value="">Status</option>
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                </select>
              </div>

              {/* Action Button */}
              <div className="lg:col-span-2">
                <button
                  onClick={handleSearch}
                  className="w-full h-full py-4 lg:py-0 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Search size={18} />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* CTA BUTTONS */}
          <div className="mt-12 flex flex-col sm:row justify-center items-center gap-6">
            <div className="flex gap-4">
               <Link
                to="/lost-items"
                className="group flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                Browse Items
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/create"
                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold border border-slate-200 dark:border-slate-700 transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Post an Item
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Layers size={32} />, 
                title: "Post Items Easily", 
                desc: "Create listings for lost or found items with our optimized, high-speed forms.",
                color: "blue"
              },
              { 
                icon: <MapPin size={32} />, 
                title: "Smart Location", 
                desc: "Quickly find items near you using our advanced geospatial filtering system.",
                color: "indigo"
              },
              { 
                icon: <ShieldCheck size={32} />, 
                title: "Verified Community", 
                desc: "We ensure safe interactions and trusted recovery through identity checks.",
                color: "emerald"
              }
            ].map((feature, i) => (
              <div key={i} className="group p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300">
                <div className={`mb-6 inline-block p-4 rounded-2xl bg-${feature.color}-50 dark:bg-${feature.color}-500/10 text-${feature.color}-600 dark:text-${feature.color}-400 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}