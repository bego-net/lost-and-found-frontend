import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthContext from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { toast } from "sonner";
import BackButton from "../components/BackButton";
import "leaflet/dist/leaflet.css";

function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "lost",
    category: "other",
    location: "",
    latitude: 9.0108,
    longitude: 38.7613,
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ITEM ================= */
  useEffect(() => {
    if (!user || !token) return;

    const fetchItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        const item = res.data.item;

        const ownerId =
          typeof item.user === "object" ? item.user._id : item.user;

        if (ownerId !== user._id) {
          navigate("/");
          return;
        }

        setForm({
          title: item.title,
          description: item.description,
          type: item.type,
          category: item.category,
          location: item.location,
          latitude: item.latitude,
          longitude: item.longitude,
        });

        const normalizedImages = (item.images || []).map((img) =>
          typeof img === "string" ? { url: img, public_id: null } : img
        );

        setExistingImages(normalizedImages);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load item");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, user, token, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= ADD NEW IMAGES ================= */
  const handleImages = (e) => {
    setNewImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  /* ================= DELETE SINGLE IMAGE ================= */
  const deleteImage = async () => {
    const img = existingImages[sliderIndex];
    if (!img || !img.public_id) {
      toast.warning("This image cannot be deleted");
      return;
    }

    try {
      await api.delete(`/items/${id}/image`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { public_id: img.public_id },
      });

      const updated = existingImages.filter((_, i) => i !== sliderIndex);
      setExistingImages(updated);
      setSliderIndex((i) => (i > 0 ? i - 1 : 0));

      toast.success("Image deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete image");
    }
  };

  /* ================= MAP PICKER ================= */
  function LocationPicker() {
    useMapEvents({
      click(e) {
        setForm((prev) => ({
          ...prev,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        }));
      },
    });
    return null;
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    newImages.forEach((img) => formData.append("images", img));

    try {
      await api.put(`/items/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Item updated successfully");
      setTimeout(() => navigate(`/item/${id}`), 1200);
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 dark:text-white">

      {/* ✅ BACK BUTTON */}
      <BackButton />

      <h1 className="text-3xl font-bold mb-6 text-center">
        Edit Item
      </h1>

      {/* ================= IMAGE SLIDER ================= */}
      {existingImages.length > 0 && (
        <div className="relative mb-6 bg-black rounded-xl overflow-hidden">
          <img
            src={existingImages[sliderIndex]?.url}
            alt="Item"
            className="h-64 w-full object-contain bg-black"
          />

          <button
            type="button"
            onClick={() =>
              setSliderIndex(
                (sliderIndex - 1 + existingImages.length) %
                  existingImages.length
              )
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-2 rounded"
          >
            ◀
          </button>

          <button
            type="button"
            onClick={() =>
              setSliderIndex((sliderIndex + 1) % existingImages.length)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-2 rounded"
          >
            ▶
          </button>

          <button
            type="button"
            onClick={deleteImage}
            className="absolute bottom-3 right-3 bg-red-600 text-white px-4 py-2 rounded"
          >
            🗑 Delete
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-100 dark:bg-gray-800"
          placeholder="Title"
          required
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="3"
          className="w-full p-3 rounded bg-gray-100 dark:bg-gray-800"
          required
        />

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImages}
        />

        <MapContainer
          center={[form.latitude, form.longitude]}
          zoom={14}
          className="h-60 rounded-xl"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[form.latitude, form.longitude]} />
          <LocationPicker />
        </MapContainer>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditItem;
