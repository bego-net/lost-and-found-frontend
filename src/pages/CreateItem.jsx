import { useState, useContext } from "react";
import api from "../api/axios";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MapPicker from "../components/MapPicker";
import { 
  Upload, 
  MapPin, 
  Type, 
  Tag, 
  FileText, 
  PlusCircle, 
  Sparkles, 
  X,
  AlertCircle
} from "lucide-react";

/* NEW AI IMPORT */
import AIMatchPopup from "../components/AIMatchPopup";

function CreateItem() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "lost",
    category: "other",
    location: "",
    images: [],
  });

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  /* NEW AI STATES */
  const [matches, setMatches] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previews.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setForm({ ...form, images: [...form.images, ...files] });

    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...previewUrls]);
  };

  const removeImage = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newImages = form.images.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    setForm({ ...form, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please login to post an item ❌");
      return;
    }

    if (!location.lat || !location.lng) {
      toast.warning("Please pin the location on the map 📍");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("type", form.type);
    formData.append("category", form.category);
    formData.append("location", form.location);
    formData.append("latitude", location.lat);
    formData.append("longitude", location.lng);

    form.images.forEach((img) => {
      formData.append("images", img);
    });

    const createPromise = api.post("/items", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.promise(createPromise, {
      loading: "Publishing your listing...",
      success: "Successfully posted!",
      error: "Could not create listing ❌",
    });

    try {
      const res = await createPromise;
      if (res.data.matches && res.data.matches.length > 0) {
        setMatches(res.data.matches);
        setShowPopup(true);
      } else {
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full p-4 mt-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 ring-blue-500/50 outline-none transition-all text-slate-900 dark:text-white font-medium";
  const labelStyle = "flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-500/30 text-white">
            <PlusCircle size={28} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Post New Item</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Provide details to help someone find what they've lost.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTION 1: BASIC INFO */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <label className={labelStyle}><Type size={16}/> Item Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Blue Leather Wallet"
                  className={inputStyle}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}><AlertCircle size={16}/> Listing Type</label>
                <select name="type" className={inputStyle} onChange={handleChange}>
                  <option value="lost">I Lost Something</option>
                  <option value="found">I Found Something</option>
                </select>
              </div>

              <div>
                <label className={labelStyle}><Tag size={16}/> Category</label>
                <select name="category" className={inputStyle} onChange={handleChange}>
                  <option value="other">Other</option>
                  <option value="wallet">Wallet</option>
                  <option value="phone">Phone</option>
                  <option value="bag">Bag</option>
                  <option value="id">ID Card/Documents</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={labelStyle}><FileText size={16}/> Detailed Description</label>
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Describe unique marks, contents, or specific details..."
                  className={inputStyle}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: LOCATION */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800">
            <label className={labelStyle + " mb-4"}><MapPin size={16}/> Location Details</label>
            <input
              type="text"
              name="location"
              placeholder="Area name (e.g. Central Park, Main St Cafe)"
              className={inputStyle + " mb-6"}
              onChange={handleChange}
              required
            />
            <div className="rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-inner">
              <MapPicker location={location} setLocation={setLocation} />
            </div>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1 italic">
               <Sparkles size={12}/> Click on the map to set the exact point
            </p>
          </div>

          {/* SECTION 3: MEDIA */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800">
            <label className={labelStyle + " mb-4"}><Upload size={16}/> Photos</label>
            
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <p className="font-bold text-slate-700 dark:text-slate-300">Click or drag to upload</p>
              <p className="text-xs text-slate-400 mt-1">Up to 5 high-quality images</p>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-6">
                {previews.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                    <img src={src} className="h-full w-full object-cover" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[2rem] text-xl font-black shadow-2xl shadow-blue-500/30 disabled:opacity-60 disabled:hover:translate-y-0 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <PlusCircle size={24} />
                Publish Listing
              </>
            )}
          </button>
        </form>

        {/* AI MATCH POPUP */}
        {showPopup && (
          <AIMatchPopup
            matches={matches}
            onClose={() => setShowPopup(false)}
          />
        )}
      </div>
    </div>
  );
}

export default CreateItem;
