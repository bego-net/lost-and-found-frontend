import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "sonner";
import BackButton from "../components/BackButton";

function EditProfile() {
  const { user, setUser, token } = useContext(AuthContext);

  // PREVIEW IMAGE
  const initialPreview = user?.profileImage
    ? `http://localhost:5000${user.profileImage}`
    : "";

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || ""); // 🔒 READ ONLY
  const [preview, setPreview] = useState(initialPreview);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ===========================
       HANDLE IMAGE PREVIEW
  ============================ */
  const handleImageChange = (e) => {
    const img = e.target.files[0];
    if (img) {
      setFile(img);
      setPreview(URL.createObjectURL(img));
    }
  };

  /* ===========================
       HANDLE SUBMIT
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      /* 🔒 UPDATE NAME ONLY (EMAIL NOT SENT) */
      const userRes = await api.put(
        "/auth/update",
        { name }, // ✅ email removed
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let updatedUser = userRes.data.user;

      /* UPDATE IMAGE IF PROVIDED */
      if (file) {
        const formData = new FormData();
        formData.append("profileImage", file);

        const imgRes = await api.put(
          "/auth/update-profile-image",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        updatedUser = imgRes.data.user;
      }

      setUser(updatedUser);

      toast.success("Profile updated successfully ✅", { duration: 2500 });
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile ❌", { duration: 2500 });
      setMessage("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
          UI
  ============================ */
  return (
    <div className="min-h-screen px-6 py-10 bg-[#F5F5F5] dark:bg-gray-900 dark:text-white flex justify-center">
      <div className="max-w-lg w-full">

        {/* BACK BUTTON */}
        <BackButton label="Profile" />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200/40 dark:border-gray-700/40">
          <h1 className="text-3xl font-bold mb-6 text-center text-[#103B66] dark:text-white">
            Edit Profile
          </h1>

          {/* IMAGE PREVIEW */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-lg border-4 border-[#103B66]/20 dark:border-gray-600">
              <img
                src={
                  preview ||
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            <label className="mt-4 cursor-pointer bg-[#103B66] dark:bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-[#0d2f52] dark:hover:bg-blue-700 transition">
              Change Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAME */}
            <div>
              <label className="block font-semibold mb-2">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-gray-200 
                           dark:bg-gray-700 dark:text-white outline-none 
                           focus:ring-2 focus:ring-[#103B66] dark:focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* EMAIL (DISABLED) */}
            <div>
              <label className="block font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 rounded-lg 
                           bg-gray-300 dark:bg-gray-700 
                           text-gray-500 dark:text-gray-400 
                           cursor-not-allowed opacity-80"
              />
              <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                Email cannot be changed
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#103B66] text-white dark:bg-blue-600 
                         py-3 rounded-lg font-semibold shadow 
                         hover:opacity-90 transition"
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>

            {message && (
              <p className="text-center mt-3 font-medium text-green-600 dark:text-green-400">
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
