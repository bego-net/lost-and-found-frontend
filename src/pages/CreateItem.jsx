import { useState, useContext, useEffect } from "react";
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
  X,
  AlertCircle,
} from "lucide-react";

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
    dateLostOrFound: "",
    images: [],
  });

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [matches, setMatches] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* IMAGE UPLOAD */
  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files allowed");
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return false;
      }

      return true;
    });

    if (validFiles.length + previews.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));

    const previewUrls = validFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews((prev) => [...prev, ...previewUrls]);
  };

  const removeImage = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newImages = form.images.filter((_, i) => i !== index);

    setPreviews(newPreviews);

    setForm((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  /* FORM SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setSubmitError("");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    const missing = [];

    if (!form.title.trim()) missing.push("title");
    if (!form.description.trim()) missing.push("description");
    if (!form.type) missing.push("type");
    if (!form.category) missing.push("category");
    if (!form.location.trim()) missing.push("location");
    if (!form.dateLostOrFound) missing.push("date");

    if (missing.length > 0) {
      const msg = "Please fill: " + missing.join(", ");
      toast.warning(msg);
      setSubmitError(msg);
      return;
    }

    if (location.lat == null || location.lng == null) {
      toast.warning("Please select map location");
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
    formData.append("dateLostOrFound", form.dateLostOrFound);

    form.images.forEach((img) => {
      formData.append("images", img);
    });

    try {
      const request = api.post("/items", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.promise(request, {
        loading: "Publishing item...",
        success: "Item posted successfully",
        error: "Failed to create item",
      });

      const res = await request;

      if (res?.data?.matches?.length > 0) {
        setMatches(res.data.matches);
        setShowPopup(true);
      } else {
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (Array.isArray(err?.response?.data?.errors)
          ? err.response.data.errors.join(", ")
          : null) ||
        err?.message ||
        "Server error";

      console.error("Create item error:", err);

      setSubmitError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full p-4 mt-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700";

  const labelStyle =
    "flex items-center gap-2 text-sm font-bold text-slate-500 uppercase";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600 text-white mb-4">
            <PlusCircle size={28} />
          </div>

          <h1 className="text-4xl font-black">Post New Item</h1>
          <p className="text-slate-500 mt-2">
            Provide details to help someone recover their item
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* TITLE */}
          <div>
            <label className={labelStyle}>
              <Type size={16} />
              Item Title
            </label>

            <input
              type="text"
              name="title"
              placeholder="Example: Black Wallet"
              className={inputStyle}
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* DATE */}
          <div>
            <label className={labelStyle}>
              <AlertCircle size={16} />
              Date Lost or Found
            </label>

            <input
              type="date"
              name="dateLostOrFound"
              className={inputStyle}
              value={form.dateLostOrFound}
              onChange={handleChange}
              required
            />
          </div>

          {/* TYPE */}
          <div>
            <label className={labelStyle}>
              <Tag size={16} />
              Type
            </label>

            <select
              name="type"
              className={inputStyle}
              value={form.type}
              onChange={handleChange}
              required
            >
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className={labelStyle}>
              <Tag size={16} />
              Category
            </label>

            <select
              name="category"
              className={inputStyle}
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="other">Other</option>
              <option value="documents">Documents</option>
              <option value="electronics">Electronics</option>
              <option value="keys">Keys</option>
              <option value="clothing">Clothing</option>
              <option value="bags">Bags</option>
              <option value="pets">Pets</option>
              <option value="jewelry">Jewelry</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className={labelStyle}>
              <FileText size={16} />
              Description
            </label>

            <textarea
              name="description"
              rows="4"
              className={inputStyle}
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* LOCATION */}
          <div>
            <label className={labelStyle}>
              <MapPin size={16} />
              Location
            </label>

            <input
              name="location"
              placeholder="Area name"
              className={inputStyle}
              value={form.location}
              onChange={handleChange}
              required
            />

            <div className="mt-4 rounded-3xl overflow-hidden">
              <MapPicker location={location} setLocation={setLocation} />
            </div>
          </div>

          {/* IMAGES */}
          <div>
            <label className={labelStyle}>
              <Upload size={16} />
              Images
            </label>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImages}
              className="mt-3"
            />

            {previews.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mt-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <img
                      src={src}
                      className="w-full h-20 object-cover rounded-lg"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {submitError && (
            <div className="text-red-500 text-sm">{submitError}</div>
          )}

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold"
          >
            {loading ? "Publishing..." : "Publish Listing"}
          </button>
        </form>

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
