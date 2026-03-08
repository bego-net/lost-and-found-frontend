import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

/* ==========================================
   SOCKET CONNECTION
========================================== */
const socket = io("http://localhost:5000", {
  withCredentials: true,
});

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  /* ==========================================
     LOAD NOTIFICATIONS
  ========================================== */
  useEffect(() => {
    if (!user?._id) return;

    const loadNotifications = async () => {
      try {
        const res = await axios.get("/notifications");
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Notification load error:", err);
      }
    };

    loadNotifications();
  }, [user?._id]);

  /* ==========================================
     REALTIME SOCKET LISTENER
  ========================================== */
  useEffect(() => {
    if (!user?._id) return;

    socket.emit("userOnline", user._id);

    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === notification._id);
        if (exists) return prev;

        return [notification, ...prev];
      });
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [user?._id]);

  /* ==========================================
     CLOSE DROPDOWN WHEN CLICK OUTSIDE
  ========================================== */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /* ==========================================
     CLICK NOTIFICATION
  ========================================== */
 const handleClick = async (notification) => {
  try {
    await axios.put(`/notifications/${notification._id}/read`);

    setNotifications((prev) =>
      prev.map((n) =>
        n._id === notification._id ? { ...n, isRead: true } : n
      )
    );

    /* ===============================
       SAFE ITEM NAVIGATION
    =============================== */

    const itemId =
      notification.item?._id || notification.item;

    if (itemId) {
      navigate(`/item/${itemId}`);
    }

    setOpen(false);

  } catch (err) {
    console.error("Notification click error:", err);
  }
};

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ==========================================
     GET MESSAGE TEXT
  ========================================== */
  const getMessage = (n) => {

    if (n.type === "match") {
      const similarity = n.similarity || null;

      if (similarity) {
        return `🎉 AI found a ${similarity}% match for "${n.item?.title}"`;
      }

      return `🔎 AI found a similar item: ${n.item?.title || "View item"}`;
    }

    if (n.type === "message") {
      return "💬 Sent you a message";
    }

    if (n.type === "offer") {
      return "📦 Sent you an offer";
    }

    return "New notification";
  };

  /* ==========================================
     UI
  ========================================== */
  return (
    <div className="relative" ref={dropdownRef}>

      {/* 🔔 Notification Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <span className="text-2xl">🔔</span>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* ======================================
          DROPDOWN
      ====================================== */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">

          <div className="p-3 font-semibold border-b border-gray-200 dark:border-gray-700 dark:text-white">
            Notifications
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                  !n.isRead ? "bg-blue-50 dark:bg-gray-700" : ""
                }`}
              >

                {/* USER IMAGE */}
                <img
                  src={
                    n.sender?.profileImage
                      ? `http://localhost:5000${n.sender.profileImage}`
                      : "http://localhost:5000/uploads/default-profile.png"
                  }
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div className="flex-1">

                  {/* USER NAME */}
                  <p className="font-medium text-sm dark:text-white">
                    {n.sender?.name || "System"}
                  </p>

                  {/* MESSAGE */}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getMessage(n)}
                  </p>

                  {/* TIME */}
                  <p className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>

                </div>

                {/* UNREAD DOT */}
                {!n.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}

              </div>
            ))
          )}

        </div>
      )}
    </div>
  );
}