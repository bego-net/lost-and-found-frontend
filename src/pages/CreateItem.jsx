import { useState, useContext } from "react";
import api from "../api/axios";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MapPicker from "../components/MapPicker";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setForm({ ...form, images: files });

    const previewUrls = files.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviews(previewUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("You must be logged in ❌");
      return;
    }

    if (!location.lat || !location.lng) {
      toast.warning("Please choose a location on the map 📍");
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
        "Content-Type": "multipart/form-data",
      },
    });

    toast.promise(createPromise, {
      loading: "Posting item...",
      success: "Item posted successfully ✅",
      error: "Failed to create item ❌",
    });

    try {
      await createPromise;
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl backdrop-blur-xl 
                   bg-white/70 dark:bg-gray-900/60
                   p-8 rounded-2xl shadow-xl border dark:border-gray-700"
      >
        <h1 className="text-3xl font-bold text-center mb-6 dark:text-white">
          Create Lost / Found Item
        </h1>

        {/* TITLE */}
        <div className="mb-4">
          <label className="font-semibold dark:text-gray-200">Item Title</label>
          <input
            type="text"
            name="title"
            className="w-full p-3 mt-1 rounded-xl bg-gray-100 dark:bg-gray-800"
            onChange={handleChange}
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div className="mb-4">
          <label className="font-semibold dark:text-gray-200">Description</label>
          <textarea
            name="description"
            rows="3"
            className="w-full p-3 mt-1 rounded-xl bg-gray-100 dark:bg-gray-800"
            onChange={handleChange}
            required
          />
        </div>

        {/* LOCATION NAME */}
        <div className="mb-4">
          <label className="font-semibold dark:text-gray-200">Location Name</label>
          <input
            type="text"
            name="location"
            className="w-full p-3 mt-1 rounded-xl bg-gray-100 dark:bg-gray-800"
            onChange={handleChange}
            required
          />
        </div>

        {/* MAP PICKER */}
        <label className="font-semibold dark:text-gray-200">
          Pick Exact Location on Map
        </label>
        <div className="mt-2 mb-3 rounded-xl overflow-hidden shadow border dark:border-gray-700">
          <MapPicker location={location} setLocation={setLocation} />
        </div>

        {/* TYPE */}
        <div className="mt-4">
          <label className="font-semibold dark:text-gray-200">Type</label>
          <select
            name="type"
            className="w-full p-3 mt-1 rounded-xl bg-gray-100 dark:bg-gray-800"
            onChange={handleChange}
          >
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </div>

        {/* CATEGORY */}
        <div className="mt-4">
          <label className="font-semibold dark:text-gray-200">Category</label>
          <select
            name="category"
            className="w-full p-3 mt-1 rounded-xl bg-gray-100 dark:bg-gray-800"
            onChange={handleChange}
          >
            <option value="other">Other</option>
            <option value="wallet">Wallet</option>
            <option value="phone">Phone</option>
            <option value="bag">Bag</option>
            <option value="id">ID Card</option>
          </select>
        </div>

        {/* IMAGES */}
        <div className="mt-5">
          <label className="font-semibold dark:text-gray-200">
            Upload Images (max 5)
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            className="w-full mt-2"
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {previews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className="h-24 w-full object-cover rounded-lg shadow"
                />
              ))}
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <button
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 
                     text-white py-3 rounded-xl text-lg
                     disabled:opacity-60"
        >
          {loading ? "Posting..." : "Post Item"}
        </button>
      </form>
    </div>
  );
}

export default CreateItem;
