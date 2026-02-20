import { Link, useNavigate } from "react-router-dom";
import { Search, Layers, MapPin, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");    

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (keyword) params.append("query", keyword);
    if (category) params.append("category", category);
    if (location) params.append("location", location);
    if (date) params.append("date", date);
    if (type) params.append("type", type);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-white">

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-[#E7E7E7] dark:bg-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-[#103B66]/80 to-[#1A4A80]/70 dark:from-gray-900/80 dark:to-gray-800/70"></div>

        <div className="relative text-center max-w-5xl mx-auto py-28 px-6">

          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
            Find What Matters Most.
          </h1>

          <p className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl mx-auto">
            A smart and modern platform to help you reconnect with your lost belongings — fast, friendly and reliable.
          </p>

          {/* ======= ADVANCED SEARCH UI ======= */}
          <div className="mt-10 max-w-3xl mx-auto bg-white/95 dark:bg-gray-900/80 backdrop-blur-xl
          border border-white/40 dark:border-gray-700 p-6 rounded-2xl shadow-2xl">

            {/* TOP: KEYWORD */}
            <div className="flex items-center gap-3 pb-4 border-b dark:border-gray-700">
              <Search size={26} className="text-gray-700 dark:text-gray-300" />
              <input
                type="text"
                placeholder="Search items…"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-grow bg-transparent outline-none text-lg text-gray-900 dark:text-white"
              />
            </div>

            {/* FILTER GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

              {/* CATEGORY */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl border dark:border-gray-700"
              >
                <option value="">Select Category</option>
                <option value="electronics">Electronics</option>
                <option value="documents">Documents</option>
                <option value="clothes">Clothes</option>
                <option value="bags">Bags</option>
                <option value="accessories">Accessories</option>
              </select>

              {/* LOCATION */}
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl border dark:border-gray-700"
              />

              {/* DATE */}
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl border dark:border-gray-700"
              />

              {/* LOST/FOUND */}
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl border dark:border-gray-700"
              >
                <option value="">Lost or Found?</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>

            {/* SEARCH BUTTON */}
            <button
              onClick={handleSearch}
              className="mt-6 w-full bg-[#103B66] text-white py-3 rounded-xl
              font-semibold text-lg hover:bg-[#0d3356] transition-all"
            >
              Search Items
            </button>
          </div>

          {/* CTA BUTTONS */}
          <div className="mt-10 flex justify-center gap-5">
            <Link
              to="/lost-items"
              className="bg-white text-[#103B66] px-8 py-3 rounded-xl font-semibold 
              text-lg shadow-md hover:scale-105 hover:shadow-xl transition-all"
            >
              Browse Items
            </Link>

            <Link
              to="/create"
              className="px-8 py-3 rounded-xl text-lg font-semibold border border-white/40 
              text-white backdrop-blur-md hover:bg-white/20 transition-all"
            >
              Post an Item
            </Link>
          </div>
        </div>
      </section>


      {/* ===== FEATURES ===== */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
          Why Choose Our Platform?
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

          <div className="p-8 bg-[#E7E7E7] dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            <Layers size={42} className="text-[#103B66] dark:text-blue-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Post Items Easily</h3>
            <p>Create listings for lost or found items with a smooth form.</p>
          </div>

          <div className="p-8 bg-[#E7E7E7] dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            <MapPin size={42} className="text-[#103B66] dark:text-blue-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Location-Based Search</h3>
            <p>Quickly find items near you using smart filters.</p>
          </div>

          <div className="p-8 bg-[#E7E7E7] dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            <ShieldCheck size={42} className="text-[#103B66] dark:text-blue-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Verified Community</h3>
            <p>We ensure safe interactions and trusted item recovery.</p>
          </div>

        </div>
      </section>

    </div>
  );
}
