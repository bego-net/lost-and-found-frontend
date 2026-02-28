import { useEffect, useState, useContext } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthContext from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import SkeletonText from "../components/skeletons/SkeletonText";
import "leaflet/dist/leaflet.css";

/* ================= ENABLE ZOOM AFTER CLICK ================= */
function EnableZoomOnClick() {
  const map = useMap();

  useEffect(() => {
    map.scrollWheelZoom.disable(); // disable initially

    const enableZoom = () => {
      map.scrollWheelZoom.enable();
    };

    map.on("click", enableZoom);

    return () => {
      map.off("click", enableZoom);
    };
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

  /* ================= FETCH ITEM ================= */
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

  /* ================= FETCH UNREAD COUNT ================= */
  /* ================= FETCH UNREAD COUNT ================= */
const fetchUnread = async () => {
  try {
    const { data } = await api.get("/messages/unread/count");
    setUnreadCount(data.count);
  } catch (err) {
    console.error("Unread fetch error:", err);
  }
};

useEffect(() => {
  if (user) {
    fetchUnread();
  }
}, [user]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 dark:text-white">
        <button
          onClick={() => navigate(-1)}
          className="text-emerald-600 hover:underline mb-4"
        >
          ← Back
        </button>

        <div className="mb-6 flex justify-center">
          <SkeletonText width="w-2/3" height="h-10" />
        </div>
        <div className="skeleton h-[420px] w-full rounded-2xl mb-8" />
      </div>
    );
  }

  if (!item || !item._id) {
    return <p className="text-center mt-10">Item not found</p>;
  }

  const images = item.images || [];
  const ownerId =
    typeof item.user === "object" ? item.user._id : item.user;

  const latitude = item.latitude;
  const longitude = item.longitude;
  const hasLocation =
    typeof latitude === "number" && typeof longitude === "number";

  const handleBack = () => {
    const from = location.state?.from;

    if (from === "lost") {
      navigate("/lost-items", { replace: true });
    } else if (from === "found") {
      navigate("/found-items", { replace: true });
    } else if (from === "my-items") {
      navigate("/my-items", { replace: true });
    } else {
      if (item.type === "lost") {
        navigate("/lost-items", { replace: true });
      } else if (item.type === "found") {
        navigate("/found-items", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 dark:text-white">
      <button
        onClick={handleBack}
        className="text-emerald-600 hover:underline mb-4"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold mb-6 text-center">
        {item.title}
      </h1>

      {/* ================= IMAGE SLIDER ================= */}
      {images.length > 0 && (
        <div className="relative mb-8 bg-black rounded-2xl overflow-hidden shadow-lg">
          <img
            src={images[sliderIndex]?.url || images[sliderIndex]}
            alt="Item"
            className="h-[420px] w-full object-contain bg-black"
          />

          <button
            onClick={() =>
              setSliderIndex(
                (sliderIndex - 1 + images.length) % images.length
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-xl"
          >
            ‹
          </button>

          <button
            onClick={() =>
              setSliderIndex((sliderIndex + 1) % images.length)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-xl"
          >
            ›
          </button>
        </div>
      )}

      {/* ================= INFO ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
        <p><b>Type:</b> {item.type}</p>
        <p><b>Category:</b> {item.category}</p>
        <p><b>Location:</b> {item.location}</p>
        <p className="mt-3">{item.description}</p>
      </div>

      {/* ================= MAP ================= */}
      <div className="rounded-2xl overflow-hidden shadow-lg mb-8">
        {hasLocation ? (
          <MapContainer
            center={[latitude, longitude]}
            zoom={14}
            className="h-72"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[latitude, longitude]} />
            <EnableZoomOnClick />
          </MapContainer>
        ) : (
          <div className="h-72 flex items-center justify-center bg-gray-200">
            Location not available
          </div>
        )}
      </div>

      {/* ================= CONTACT OWNER ================= */}
      {user && user._id !== ownerId && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 text-center">
          <h2 className="text-xl font-semibold mb-4">
            Contact {item.type === "lost" ? "Finder" : "Owner"}
          </h2>

          <Link
            to={`/conversation/${item._id}/${ownerId}`}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold inline-block transition"
          >
            Open Chat
          </Link>
        </div>
      )}

      {/* ================= OWNER ACTION ================= */}
      {user && user._id === ownerId && (
        <div className="text-center space-y-4">
          <Link
            to={`/item/edit/${item._id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold inline-block"
          >
            Edit Item
          </Link>

          <div className="relative inline-block">
            <Link
              to={`/my-items/${item._id}/messages`}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold inline-block"
            >
              View Messages
            </Link>

            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemDetails;