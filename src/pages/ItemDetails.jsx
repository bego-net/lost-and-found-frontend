import { useEffect, useState, useContext } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthContext from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { ChevronLeft, ChevronRight, MapPin, Tag, Calendar, MessageCircle, Edit3, ArrowLeft, Info, Sparkles, ShieldCheck } from "lucide-react";
import "leaflet/dist/leaflet.css";

function EnableZoomOnClick() {
  const map = useMap();
  useEffect(() => {
    map.scrollWheelZoom.disable();
    const enableZoom = () => { map.scrollWheelZoom.enable(); };
    map.on("click", enableZoom);
    return () => { map.off("click", enableZoom); };
  }, [map]);
  return null;
}

function ItemDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        setItem(res.data.item);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const { data } = await api.get("/messages/unread/count");
          setUnreadCount(data.count);
        } catch (err) {
          console.error("Unread fetch error:", err);
        }
      };
      fetchUnread();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-pulse space-y-8">
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-[2.5rem]" />
        <div className="aspect-video w-full bg-slate-200 dark:bg-slate-800 rounded-[2.5rem]" />
      </div>
    );
  }

  if (!item || !item._id) return <div className="text-center py-20 font-bold text-xl">Item not found</div>;

  const images = item.images || [];
  const ownerId = typeof item.user === "object" ? item.user._id : item.user;
  const hasLocation = typeof item.latitude === "number" && typeof item.longitude === "number";

  const handleBack = () => {
    const from = location.state?.from;
    const paths = { lost: "/lost-items", found: "/found-items", "my-items": "/my-items" };
    navigate(paths[from] || (item.type === "lost" ? "/lost-items" : "/found-items"), { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Navigation */}
        <button 
          onClick={handleBack}
          className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Listings
        </button>

        <div className="flex flex-col gap-8">
          
          {/* 1. TOP SECTION: ITEM INFO */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${item.type === 'lost' ? 'bg-red-100 text-red-600 dark:bg-red-500/10' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10'}`}>
                {item.type}
              </span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <Tag size={14} />
                {item.category}
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
              {item.title}
            </h1>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700">
              <div className="flex gap-3 mb-2 text-blue-600 font-bold text-xs uppercase tracking-tighter">
                <Info size={16} /> Item Description
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                {item.description}
              </p>
            </div>
          </div>

          {/* 2. MIDDLE SECTION: PHOTO SLIDER */}
          <div className="relative group aspect-video bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            {images.length > 0 ? (
              <>
                <img
                  src={images[sliderIndex]?.url || images[sliderIndex]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setSliderIndex((sliderIndex - 1 + images.length) % images.length)} className="p-3 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-xl hover:scale-110 transition-transform">
                      <ChevronLeft className="text-slate-900 dark:text-white" />
                    </button>
                    <button onClick={() => setSliderIndex((sliderIndex + 1) % images.length)} className="p-3 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-xl hover:scale-110 transition-transform">
                      <ChevronRight className="text-slate-900 dark:text-white" />
                    </button>
                  </div>
                )}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === sliderIndex ? "w-6 bg-blue-600" : "w-1.5 bg-white/50 backdrop-blur-md"}`} />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <Sparkles size={48} className="opacity-20" />
                <span className="font-bold">No images provided</span>
              </div>
            )}
          </div>

          {/* 3. BOTTOM SECTION: MAP & SPECS */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Specs */}
              <div className="md:col-span-1 space-y-4">
                  <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600"><Calendar size={20} /></div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Posted On</p>
                      <p className="text-sm font-bold">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600"><MapPin size={20} /></div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] uppercase font-black text-slate-400">Area</p>
                      <p className="text-sm font-bold truncate">{item.location}</p>
                    </div>
                  </div>
              </div>

              {/* Map */}
              <div className="md:col-span-2 rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                {hasLocation ? (
                  <div className="h-64 w-full relative">
                      <MapContainer center={[item.latitude, item.longitude]} zoom={14} className="h-full w-full z-0">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[item.latitude, item.longitude]} />
                        <EnableZoomOnClick />
                      </MapContainer>
                      <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-2">
                        <MapPin size={14} className="text-blue-600" /> Interaction Enabled
                      </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[256px] flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 text-slate-400 font-bold">Map unavailable for this item</div>
                )}
              </div>
            </div>

            {/* 4. CONTACT ACTIONS (BELOW EVERYTHING) */}
            <div className="pt-4">
              {user && user._id !== ownerId ? (
                <div className="space-y-4">
                  <Link
                    to={`/conversation/${item._id}/${ownerId}`}
                    className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:scale-95"
                  >
                    <MessageCircle size={24} />
                    Contact
                  </Link>
                  <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Secure Community Communication
                  </div>
                </div>
              ) : user?._id === ownerId ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to={`/item/edit/${item._id}`}
                    className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-3xl font-bold transition-all hover:opacity-90"
                  >
                    <Edit3 size={18} /> Edit Listing
                  </Link>
                  <Link
                    to={`/my-items/${item._id}/messages`}
                    className="relative flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 py-4 rounded-3xl font-bold hover:bg-slate-50 transition-all"
                  >
                    <MessageCircle size={18} /> View Inquiries
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </div>
              ) : (
                <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] text-center">
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">Interested in this item?</p>
                  <Link to="/login" className="inline-block bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20">
                    Login to Contact
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ItemDetails;