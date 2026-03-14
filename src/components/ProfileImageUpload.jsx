import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import api, { API_BASE_URL } from "../api/axios";
import { toast } from "sonner";

export default function ProfileImageUpload({ onUploaded }) {
  const { token, user, setUser } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(
    user?.profileImage
      ? user.profileImage.startsWith("http")
        ? user.profileImage
        : `${API_BASE_URL}${user.profileImage}`
      : ""
  );
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const img = e.target.files?.[0];
    if (!img) return;
    if (!img.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (img.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setFile(img);
    setPreview(URL.createObjectURL(img));
  };

  const handleUpload = async () => {
    if (!token) {
      toast.error("Please login first");
      return;
    }
    if (!file) {
      toast.warning("Please choose an image");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const res = await api.put("/auth/update-profile-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res?.data?.user) {
        setUser(res.data.user);
        if (onUploaded) onUploaded(res.data.user);
      }

      toast.success("Profile image updated");
      setFile(null);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to upload image";
      console.error("Profile image upload error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden border border-slate-200 shadow-sm">
        <img
          src={
            preview ||
            "https://cdn-icons-png.flaticon.com/512/847/847969.png"
          }
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>

      <label className="cursor-pointer bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-semibold">
        Choose Image
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </label>

      <button
        type="button"
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-60"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
