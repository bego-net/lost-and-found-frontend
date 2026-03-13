import { useEffect, useState, useContext } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthContext from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { 
  ChevronLeft, ChevronRight, MapPin, Tag, Calendar, 
  MessageCircle, Edit3, ArrowLeft, Info, Sparkles, 
  ShieldCheck, Share2, Clock 
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// --- FIXING DAYJS ERROR ---
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime); 
// ---------------------------

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    const fetchItemData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/items/${id}`);
        setItem(res.data.item);
      } catch (error) {
        console.error("Error fetching item:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
    window.scrollTo(0, 0);
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
      <div className="max-w-7xl mx-auto p-6 animate-pulse space-y-10 mt-10">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 aspect-[4/3] bg-slate-200 dark:bg-slate-800 rounded-[3.5rem]" />
          <div className="lg:col-span-5 space-y-6">
             <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-[3rem]" />
             <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-[3rem]" />
          </div>
        </div>
      </div>
    );
  }

  if (!item || !item._id) return <div className="text-center py-20 font-black text-2xl dark:text-white">Item not found</div>;

  const images = item.images || [];
  const ownerId = typeof item.user === "object" ? item.user._id : item.user;
  const hasLocation = typeof item.latitude === "number" && typeof item.longitude === "number";

  const handleBack = () => {
    const from = location.state?.from;
    const paths = { lost: "/lost-items", found: "/found-items", "my-items": "/my-items" };
    navigate(paths[from] || (item.type === "lost" ? "/lost-items" : "/found-items"), { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F1A] pb-24 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={handleBack}
            className="group flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all font-bold"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 transition-all">
            <Share2 size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: IMAGE SECTION */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group aspect-[4/3] bg-white dark:bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
              {images.length > 0 ? (
                <>
                  <img src={`${BASE_URL}${images[sliderIndex]}`} alt={item.title} className="w-full h-full object-cover" />
                  {images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between p-6 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => setSliderIndex((sliderIndex - 1 + images.length) % images.length)} className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl hover:scale-110 text-slate-900 dark:text-white transition-all"><ChevronLeft/></button>
                      <button onClick={() => setSliderIndex((sliderIndex + 1) % images.length)} className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl hover:scale-110 text-slate-900 dark:text-white transition-all"><ChevronRight/></button>
                    </div>
                  )}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 px-4 py-3 bg-black/20 backdrop-blur-lg rounded-3xl">
                    {images.map((img, i) => (
                      <button key={i} onClick={() => setSliderIndex(i)} className={`h-12 w-12 rounded-xl overflow-hidden border-2 transition-all ${i === sliderIndex ? "border-white scale-110" : "border-transparent opacity-50"}`}>
                        <img src={`${BASE_URL}${img}`} className="w-full h-full object-cover" alt="thumb" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                  <Sparkles size={80} strokeWidth={1} className="mb-4" />
                  <span className="font-black text-xl">NO IMAGES</span>
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4 text-blue-600 font-black text-xs uppercase tracking-widest"><Info size={16} /> Details</div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg font-medium">{item.description}</p>
            </div>
          </div>

          {/* RIGHT: SIDEBAR INFO */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
               <div className={`absolute top-0 right-0 px-8 py-2 font-black uppercase tracking-widest text-[10px] rounded-bl-3xl text-white ${item.type === 'lost' ? 'bg-rose-500' : 'bg-emerald-500'}`}>{item.type}</div>
               <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4"><Tag size={12} /> {item.category}</div>
               <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6">{item.title}</h1>
               <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                   <Calendar className="text-rose-500 mb-2" size={20} />
                   <p className="text-sm font-bold dark:text-white">{dayjs(item.dateLostOrFound).format('DD MMM YYYY')}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                   <Clock className="text-blue-500 mb-2" size={20} />
                   <p className="text-sm font-bold dark:text-white">{dayjs(item.createdAt).fromNow()}</p>
                </div>
              </div>
            </div>

            {/* MAP CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 shadow-xl border border-slate-100 dark:border-slate-800 group">
              <div className="h-64 w-full rounded-[2.5rem] overflow-hidden relative">
                {hasLocation ? (
                  <MapContainer center={[item.latitude, item.longitude]} zoom={14} className="h-full w-full z-0">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[item.latitude, item.longitude]} />
                    <EnableZoomOnClick />
                  </MapContainer>
                ) : (
                  <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400">Map Unavailable</div>
                )}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                   <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600"><MapPin size={18}/></div>
                   <p className="text-xs font-black truncate dark:text-white">{item.location || "Coordinates Only"}</p>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="pt-4">
              {user && user._id !== ownerId ? (
                <div className="space-y-4">
                  <Link to={`/conversation/${item._id}/${ownerId}`} className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl transition-all hover:-translate-y-1">
                    <MessageCircle size={24} /> Message Finder
                  </Link>
                  <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest"><ShieldCheck className="inline mr-1 text-emerald-500" size={14}/> Secure Chat Protected</p>
                </div>
              ) : user?._id === ownerId ? (
                <div className="grid grid-cols-2 gap-4">
                  <Link to={`/item/edit/${item._id}`} className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-[2rem] font-black hover:opacity-90">Edit</Link>
                  <Link to={`/my-items/${item._id}/messages`} className="relative flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 py-5 rounded-[2rem] font-black hover:bg-slate-50 transition-all">
                    Inquiries {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] w-7 h-7 flex items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900">{unreadCount}</span>}
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="w-full flex items-center justify-center bg-slate-900 dark:bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-xl">Login to Contact</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetails;